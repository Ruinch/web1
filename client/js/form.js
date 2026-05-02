function setError(input, message) {
  const box = input.closest('.mb-3, .form-group, .col-12')?.querySelector('.error-message');
  if (box) box.textContent = message || '';
  input.classList.toggle('is-invalid', !!message);
}

function clearError(input) {
  setError(input, '');
}

function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validatePassword(value) {
  return typeof value === 'string' && value.length >= 6;
}

function validateNotEmpty(value) {
  return String(value || '').trim().length > 0;
}

function getSelectedHabits(form) {
  return [...form.querySelectorAll('input[name="habits"]:checked')].map(el => el.value);
}

function validateAuthForm(form) {
  const email = form.querySelector('input[name="email"]');
  const password = form.querySelector('input[name="password"]');
  let valid = true;

  if (!validateNotEmpty(email.value)) { setError(email, 'Email is required'); valid = false; }
  else if (!validateEmail(email.value)) { setError(email, 'Enter a valid email'); valid = false; }
  else clearError(email);

  if (!validateNotEmpty(password.value)) { setError(password, 'Password is required'); valid = false; }
  else if (!validatePassword(password.value)) { setError(password, 'Password must be at least 6 characters'); valid = false; }
  else clearError(password);

  return valid;
}

function validateTrackerForm(form) {
  const mood = form.querySelector('select[name="mood"]');
  const comment = form.querySelector('textarea[name="comment"]');
  const habits = getSelectedHabits(form);
  let valid = true;

  if (!validateNotEmpty(mood.value)) { setError(mood, 'Choose a mood'); valid = false; } else clearError(mood);
  if (habits.length === 0) {
    const group = form.querySelector('[data-habits-group]');
    const box = group?.querySelector('.error-message');
    if (box) box.textContent = 'Select at least one habit';
    valid = false;
  } else {
    const group = form.querySelector('[data-habits-group]');
    const box = group?.querySelector('.error-message');
    if (box) box.textContent = '';
  }
  if (!validateNotEmpty(comment.value)) { setError(comment, 'Comment is required'); valid = false; } else clearError(comment);

  return valid;
}

window.MHTForm = { setError, clearError, validateEmail, validatePassword, validateNotEmpty, getSelectedHabits, validateAuthForm, validateTrackerForm };
