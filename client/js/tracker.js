window.addEventListener('DOMContentLoaded', () => {
  MHT.initGlobalUI();
  MHT.requireAuth('/login.html');

  const form = document.getElementById('trackerForm');
  const emojiHint = document.getElementById('emojiHint');
  const moodSelect = document.querySelector('select[name="mood"]');
  const habitChecks = [...document.querySelectorAll('input[name="habits"]')];

  const updateHint = () => {
    emojiHint.textContent = moodSelect.value || '🙂';
  };
  moodSelect.addEventListener('change', updateHint);
  updateHint();

  habitChecks.forEach(cb => cb.addEventListener('input', () => MHTForm.validateTrackerForm(form)));
  form.addEventListener('input', () => MHTForm.validateTrackerForm(form));

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!MHTForm.validateTrackerForm(form)) return;
    try {
      const body = {
        mood: form.mood.value,
        habits: MHTForm.getSelectedHabits(form),
        comment: form.comment.value.trim(),
        date: new Date().toISOString().slice(0, 10)
      };
      await MHT.apiFetch('/api/moods', { method: 'POST', body });
      form.reset();
      updateHint();
      MHT.notify('Mood saved');
    } catch (err) {
      MHT.notify(err.message, 'error');
    }
  });
});
