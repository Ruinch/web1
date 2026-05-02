(() => {
  const validators = {
    name(value) {
      if (!value.trim()) return 'Name is required.';
      return '';
    },
    email(value) {
      if (!value.trim()) return 'Email is required.';
      const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return pattern.test(value.trim()) ? '' : 'Enter a valid email address.';
    },
    mood(value) {
      return value ? '' : 'Please select a mood.';
    },
    password(value) {
      if (!value) return 'Password is required.';
      if (value.length < 6) return 'Password must be at least 6 characters.';
      return '';
    },
    habits(values) {
      return values.length ? '' : 'Select at least one habit.';
    }
  };

  function getHabitValues(form) {
    return Array.from(form.querySelectorAll('input[name="habits"]:checked')).map(cb => cb.value);
  }

  function setFieldError(errorId, message) {
    const errorBox = document.getElementById(errorId);
    if (!errorBox) return;
    errorBox.textContent = message;
  }

  function setInvalidState(field, isInvalid) {
    if (!field) return;
    field.classList.toggle('is-invalid', isInvalid);
    field.classList.toggle('is-valid', !isInvalid && field.value.trim() !== '');
  }

  function validateField(form, fieldName) {
    let error = '';
    let field = form.querySelector(`[name="${fieldName}"]`);

    if (fieldName === 'habits') {
      error = validators.habits(getHabitValues(form));
      setFieldError('habitsError', error);
      form.querySelectorAll('input[name="habits"]').forEach(cb => cb.classList.toggle('is-invalid', !!error));
      return !error;
    }

    if (!field) return true;

    const value = field.value;
    error = validators[fieldName](value);

    const errorMap = {
      name: 'nameError',
      email: 'emailError',
      mood: 'moodError',
      password: 'passwordError'
    };

    setFieldError(errorMap[fieldName], error);
    setInvalidState(field, !!error);
    return !error;
  }

  function validateForm(form) {
    const fields = ['name', 'email', 'mood', 'password', 'habits'];
    let valid = true;

    fields.forEach(fieldName => {
      const ok = validateField(form, fieldName);
      if (!ok) valid = false;
    });

    return valid;
  }

  function bindRealTimeValidation(formId) {
    const form = document.getElementById(formId);
    if (!form) return null;

    const inputNames = ['name', 'email', 'mood', 'password'];

    inputNames.forEach(name => {
      const field = form.querySelector(`[name="${name}"]`);
      if (!field) return;

      field.addEventListener('input', () => validateField(form, name));
      field.addEventListener('blur', () => validateField(form, name));
      if (name === 'mood') {
        field.addEventListener('change', () => validateField(form, name));
      }
    });

    form.querySelectorAll('input[name="habits"]').forEach(cb => {
      cb.addEventListener('change', () => validateField(form, 'habits'));
    });

    return form;
  }

  window.MoodFormValidation = {
    validators,
    validateField,
    validateForm,
    bindRealTimeValidation,
    getHabitValues
  };
})();
