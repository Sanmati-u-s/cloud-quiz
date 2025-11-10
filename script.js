const questions = [
  {
    text: "What does HTML stand for?",
    options: ["Hyper Trainer Marking Language", "Hyper Text Markup Language", "Hyper Text Markdown Language", "None"],
    correct: 1
  },
  {
    text: "CSS is used for?",
    options: ["Styling web pages", "Adding logic", "Database handling", "Security"],
    correct: 0
  }
];

let current = 0;
function startQuiz() {
  document.getElementById("home").style.display = "none";
  document.getElementById("quiz").style.display = "block";
  showQuestion();
}

function showQuestion() {
  const q = questions[current];
  document.getElementById("question").innerText = q.text;
  const optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = "";
  q.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.innerText = opt;
    btn.onclick = () => alert(i === q.correct ? "✅ Correct!" : "❌ Wrong!");
    optionsDiv.appendChild(btn);
  });
}

function nextQuestion() {
  current++;
  if (current < questions.length) {
    showQuestion();
  } else {
    alert("Quiz finished!");
    location.reload();
  }
}
