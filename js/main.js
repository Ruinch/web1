document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("trackerForm");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      if (!validateForm()) return;

      const mood = document.getElementById("mood").value;
      const habits = [...document.querySelectorAll('input[type="checkbox"]:checked')]
        .map(cb => cb.value);

      const entry = {
        mood,
        habits,
        comment: document.getElementById("comment").value
      };

      let data = JSON.parse(localStorage.getItem("entries")) || [];
      data.push(entry);
      localStorage.setItem("entries", JSON.stringify(data));

      changeBackground(mood);

      window.location.href = "dashboard.html";
    });
  }

  // Render dashboard
  const container = document.getElementById("entries");

  if (container) {
    const data = JSON.parse(localStorage.getItem("entries")) || [];

    data.forEach(entry => {
      const div = document.createElement("div");
      div.className = "card p-3 mb-3";

      div.innerHTML = `
        <div class="emoji">${entry.mood}</div>
        <p><strong>Habits:</strong> ${entry.habits.join(", ")}</p>
        <p>${entry.comment}</p>
      `;

      container.appendChild(div);
    });
  }

});