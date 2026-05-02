function changeBackground(mood) {
  const colors = {
    "😄": "lightyellow",
    "😐": "lightgray",
    "😢": "lightblue",
    "😡": "lightcoral"
  };

  document.body.style.backgroundColor = colors[mood] || "white";
}

function togglePassword() {
  const password = document.getElementById("password");

  password.type = password.type === "password" ? "text" : "password";
}