function validateForm() {
  let valid = true;

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const habits = document.querySelectorAll('input[type="checkbox"]:checked');

  // Name
  if (!name) {
    document.getElementById("nameError").innerText = "Name required";
    valid = false;
  } else {
    document.getElementById("nameError").innerText = "";
  }

  // Email
  if (!email.includes("@")) {
    document.getElementById("emailError").innerText = "Invalid email";
    valid = false;
  } else {
    document.getElementById("emailError").innerText = "";
  }

  // Password
  if (password.length < 6) {
    document.getElementById("passwordError").innerText = "Min 6 characters";
    valid = false;
  } else {
    document.getElementById("passwordError").innerText = "";
  }

  // Habits
  if (habits.length === 0) {
    document.getElementById("habitError").innerText = "Select at least one";
    valid = false;
  } else {
    document.getElementById("habitError").innerText = "";
  }

  return valid;
}