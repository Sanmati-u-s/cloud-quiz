// Correct answers
const correctAnswers = {
  q1: "a",
  q2: "c",
  q3: "a",
  q4: "a",
  q5: "c",
  q6: "c",
  q7: "b",
  q8: "b",
  q9: "a",
  q10: "a"
};

// Handle quiz submission
const quizForm = document.getElementById("quizForm");
if (quizForm) {
  quizForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let score = 0;

    Object.keys(correctAnswers).forEach((q) => {
      const selected = document.querySelector(`input[name="${q}"]:checked`);
      if (selected && selected.value === correctAnswers[q]) score++;
    });

    localStorage.setItem("quizScore", score);
    window.location.href = "result.html";
  });
}

// Display score and leaderboard
if (window.location.pathname.includes("result.html")) {
  const score = localStorage.getItem("quizScore") || 0;
  const username = localStorage.getItem("username") || "Student";

  document.getElementById("score").innerText = score;

  // Store leaderboard in localStorage
  const leaderboard = JSON.parse(localStorage.getItem("leaderboard") || "[]");
  leaderboard.push({ name: username, score: Number(score) });
  leaderboard.sort((a, b) => b.score - a.score);
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));

  const table = document.getElementById("leaderboard");
  leaderboard.slice(0, 5).forEach((entry, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${i + 1}</td><td>${entry.name}</td><td>${entry.score}</td>`;
    table.appendChild(row);
  });
}
