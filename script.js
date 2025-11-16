// script.js  (ES module)

// 1. Import Firebase SDK (CDN modular version)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
  limit,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// 2. Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDtfDmdO-lNYV3RubGwk63zwwjtlZ3P3W8",
  authDomain: "cloudquizbackend.firebaseapp.com",
  projectId: "cloudquizbackend",
  storageBucket: "cloudquizbackend.firebasestorage.app",
  messagingSenderId: "378604806682",
  appId: "1:378604806682:web:e756c65303d1d4a65027a3",
  measurementId: "G-NMV3Y5PS7D"
};

// 3. Initialize Firebase + Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helper: get current page name
const path = window.location.pathname;
const page = path.substring(path.lastIndexOf("/") + 1);

// ======================================================================
// ======================== QUIZ PAGE LOGIC =============================
// ======================================================================

if (page === "quiz.html") {
  const params = new URLSearchParams(window.location.search);
  const level = params.get("level") || "beginner";

  // Store level for result page
  localStorage.setItem("quizLevel", level);

  const quizTitle = document.getElementById("quizTitle");
  const levelLabel = document.getElementById("levelLabel");
  const quizForm = document.getElementById("quizForm");
  const questionsDiv = document.getElementById("questions");

  const levelNiceName = {
    beginner: "Beginner",
    intermediate: "Intermediate",
    hard: "Hard"
  }[level];

  levelLabel.textContent = `Level: ${levelNiceName} Quiz`;

  let correctAnswers = {}; // q1 → "a", q2 → "b", ...

  // Load questions from Firestore
  async function loadQuestions() {
    try {
      // Show loading text
      questionsDiv.innerHTML = `<p class="loading-text">Loading quiz questions...</p>`;

      const colRef = collection(db, `questions-${level}`);
      const snapshot = await getDocs(colRef);

      if (snapshot.empty) {
        questionsDiv.innerHTML =
          "<p>No questions found for this level. Please check Firestore.</p>";
        quizForm.querySelector("button[type='submit']").disabled = true;
        return;
      }

      // Sort by index: 1, 2, 3...
      const docs = [];
      snapshot.forEach(doc => docs.push(doc.data()));
      docs.sort((a, b) => (a.index || 0) - (b.index || 0));

      questionsDiv.innerHTML = ""; // clear loading text
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
    } catch (err) {
      console.error("Error loading questions:", err);
      questionsDiv.innerHTML =
        "<p>Failed to load questions. Check Firestore or your internet connection.</p>";
    }
  }

  loadQuestions();

  // Handle quiz submission
  if (quizForm) {
    quizForm.addEventListener("submit", (e) => {
      e.preventDefault();
      let score = 0;

      Object.keys(correctAnswers).forEach(q => {
        const selected = document.querySelector(`input[name="${q}"]:checked`);
        if (selected && selected.value === correctAnswers[q]) score++;
      });

      localStorage.setItem("quizScore", score);
      window.location.href = "result.html";
    });
  }
}

// ======================================================================
// ======================== RESULT PAGE LOGIC ============================
// ======================================================================

if (page === "result.html") {
  const scoreSpan = document.getElementById("score");
  const levelInfo = document.getElementById("levelInfo");
  const leaderboardTable = document.getElementById("leaderboard");

  const score = Number(localStorage.getItem("quizScore") || 0);
  const username = localStorage.getItem("username") || "Student";
  const level = localStorage.getItem("quizLevel") || "beginner";

  const levelNiceName = {
    beginner: "Beginner",
    intermediate: "Intermediate",
    hard: "Hard"
  }[level];

  scoreSpan.textContent = score;
  levelInfo.textContent = `Level: ${levelNiceName}`;

  async function saveAndLoadLeaderboard() {
    try {
      // Save score to Firestore
      await addDoc(collection(db, "leaderboard"), {
        name: username,
        score: score,
        level: level,
        createdAt: serverTimestamp()
      });

      // Load top 5 scores
      const qLeaderboard = query(
        collection(db, "leaderboard"),
        orderBy("score", "desc"),
        orderBy("createdAt", "asc"),
        limit(5)
      );

      const snapshot = await getDocs(qLeaderboard);

      let rank = 1;
      snapshot.forEach(docSnap => {
        const data = docSnap.data();

        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${rank}</td>
          <td>${data.name}</td>
          <td>${data.score}</td>
          <td>${data.level}</td>
        `;

        leaderboardTable.appendChild(row);
        rank++;
      });

    } catch (err) {
      console.error("Error saving/loading leaderboard:", err);
    }
  }

  saveAndLoadLeaderboard();
}
