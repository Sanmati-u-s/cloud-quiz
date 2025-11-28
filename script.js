// script.js  (ES module)

// 1. Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDtfDmdO-lNYV3RubGwk63zwwjtlZ3P3W8",
  authDomain: "cloudquizbackend.firebaseapp.com",
  projectId: "cloudquizbackend",
  storageBucket: "cloudquizbackend.appspot.com",
  messagingSenderId: "378604806682",
  appId: "1:378604806682:web:e756c65303d1d4a65027a3",
  measurementId: "G-NMV3Y5PS7D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
window.db = db;

// Detect current page
const path = window.location.pathname;
const page = path.substring(path.lastIndexOf("/") + 1);

// =======================================================
// QUIZ PAGE LOGIC
// =======================================================
if (page.includes("quiz")) {
  const params = new URLSearchParams(window.location.search);
  const level = params.get("level") || "beginner";

  localStorage.setItem("quizLevel", level);

  const levelLabel = document.getElementById("levelLabel");
  const quizForm = document.getElementById("quizForm");
  const questionsDiv = document.getElementById("questions");

  const levelNiceName = {
    beginner: "Beginner",
    intermediate: "Intermediate",
    hard: "Hard"
  }[level];

  levelLabel.textContent = `Level: ${levelNiceName} Quiz`;

  let correctAnswers = {};

  async function loadQuestions() {
    questionsDiv.innerHTML = "Loading questions...";

    const colRef = collection(db, `questions-${level}`);
    const snapshot = await getDocs(colRef);

    if (snapshot.empty) {
      questionsDiv.innerHTML = "No questions found!";
      return;
    }

    const docs = [];
    snapshot.forEach(doc => docs.push(doc.data()));
    docs.sort((a, b) => (a.index || 0) - (b.index || 0));

    questionsDiv.innerHTML = "";
    let i = 1;

    docs.forEach(data => {
      const qName = `q${i}`;
      correctAnswers[qName] = data.answer;

      const div = document.createElement("div");
      div.className = "question";
      div.innerHTML = `
        <p>${i}. ${data.question}</p>
        <label><input type="radio" name="${qName}" value="a"> ${data.a}</label>
        <label><input type="radio" name="${qName}" value="b"> ${data.b}</label>
        <label><input type="radio" name="${qName}" value="c"> ${data.c}</label>
      `;
      questionsDiv.appendChild(div);

      i++;
    });
  }

  loadQuestions();

  quizForm.addEventListener("submit", e => {
    e.preventDefault();
    const confirmSubmit = confirm("Are you sure you want to submit the quiz for scoring?");
    if (!confirmSubmit) return;

    let score = 0;

    Object.keys(correctAnswers).forEach(q => {
      const selected = document.querySelector(`input[name="${q}"]:checked`);
      if (selected && selected.value === correctAnswers[q]) score++;
    });

    localStorage.setItem("quizScore", score);


    alert("Quiz successfully submitted!");
    window.location.href = "result.html";
  });
}

// =======================================================
// RESULT PAGE LOGIC
// =======================================================
if (document.getElementById("leaderboard")) {

  const score = Number(localStorage.getItem("quizScore") || 0);
  const username = localStorage.getItem("username") || "Student";
  const level = localStorage.getItem("quizLevel") || "beginner";

  document.getElementById("score").textContent = score;
  document.getElementById("levelInfo").textContent = `Level: ${level}`;

  async function saveAndLoadLeaderboard() {

    // Save attempt
    await addDoc(collection(db, "leaderboard"), {
      name: username,
      score: score,
      level: level,
      createdAt: serverTimestamp()
    });

    // Load leaderboard
    const qLeaderboard = query(
      collection(db, "leaderboard"),
      orderBy("score", "desc")
    );

    const snapshot = await getDocs(qLeaderboard);

    const table = document.getElementById("leaderboard");
    let rank = 1;

    snapshot.forEach(docSnap => {
      const data = docSnap.data();

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${rank}</td>
        <td>${data.name}</td>
        <td>${data.score}</td>
      `;

      table.appendChild(row);
      rank++;
    });
  }

  saveAndLoadLeaderboard();
}

// =======================================================
// NAVIGATION LOGIC
// =======================================================
const name = localStorage.getItem("username");
const studentId = localStorage.getItem("studentId");

// Redirect if not logged in (and not on login page)
if ((!name || !studentId) && !path.endsWith("index.html") && !path.endsWith("/")) {
  window.location.href = "index.html";
}

const navUser = document.getElementById("navUser");
const userAvatar = document.getElementById("userAvatar");
const logoutBtn = document.getElementById("logoutBtn");

if (navUser) navUser.innerText = name || "Student";
if (userAvatar) userAvatar.innerText = (name || "S").charAt(0).toUpperCase();

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("username");
    localStorage.removeItem("studentId");
    window.location.href = "index.html";
  });
}
