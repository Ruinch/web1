window.addEventListener('DOMContentLoaded', () => {
  MHT.initGlobalUI();

  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');
  const passwordToggle = document.querySelectorAll('[data-toggle-password]');

  passwordToggle.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.togglePassword);
      target.type = target.type === 'password' ? 'text' : 'password';
      btn.textContent = target.type === 'password' ? 'Show' : 'Hide';
    });
  });

  if (registerForm) {
    registerForm.addEventListener('input', () => MHTForm.validateAuthForm(registerForm));
    registerForm.addEventListener('submit', async e => {
      e.preventDefault();
      if (!MHTForm.validateAuthForm(registerForm)) return;
      try {
        const body = Object.fromEntries(new FormData(registerForm).entries());
        const res = await MHT.apiFetch('/api/register', { method: 'POST', body });
        MHT.setToken(res.token);
        MHT.notify('Registration successful');
        setTimeout(() => location.href = '/dashboard.html', 300);
      } catch (err) {
        MHT.notify(err.message, 'error');
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener('input', () => MHTForm.validateAuthForm(loginForm));
    loginForm.addEventListener('submit', async e => {
      e.preventDefault();
      if (!MHTForm.validateAuthForm(loginForm)) return;
      try {
        const body = Object.fromEntries(new FormData(loginForm).entries());
        const res = await MHT.apiFetch('/api/login', { method: 'POST', body });
        MHT.setToken(res.token);
        MHT.notify('Login successful');
        setTimeout(() => location.href = '/dashboard.html', 300);
      } catch (err) {
        MHT.notify(err.message, 'error');
      }
    });
  }
});
