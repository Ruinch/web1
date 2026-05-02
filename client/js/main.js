window.addEventListener('DOMContentLoaded', () => {
  MHT.initGlobalUI();

  const startBtn = document.getElementById('startTrackingBtn');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      location.href = MHT.getToken() ? '/dashboard.html' : '/register.html';
    });
  }

  const cards = document.querySelectorAll('[data-tilt]');
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => card.style.transform = 'translateY(-4px)');
    card.addEventListener('mouseleave', () => card.style.transform = 'translateY(0)');
  });
});
