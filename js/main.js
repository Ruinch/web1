(() => {
  const STORAGE_KEY = 'moodHabitEntries';

  function getEntries() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveEntries(entries) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }

  function createEntryFromForm(form) {
    const habits = window.MoodFormValidation.getHabitValues(form);
    return {
      id: Date.now(),
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      mood: form.mood.value,
      habits,
      comment: form.comment.value.trim(),
      createdAt: new Date().toISOString()
    };
  }

  function addEntry(entry) {
    const entries = getEntries();
    entries.unshift(entry);
    saveEntries(entries);
  }

  function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function renderLatestSummary(entries) {
    const summary = document.getElementById('entrySummary');
    const latestMood = document.getElementById('latestMood');
    const latestDate = document.getElementById('latestDate');
    const totalEntries = document.getElementById('totalEntries');

    if (totalEntries) totalEntries.textContent = String(entries.length);

    if (!entries.length) {
      if (latestMood) latestMood.textContent = '—';
      if (latestDate) latestDate.textContent = 'No entries yet';
      if (summary) summary.classList.add('d-none');
      return;
    }

    const latest = entries[0];
    if (latestMood) latestMood.textContent = latest.mood;
    if (latestDate) latestDate.textContent = formatDate(latest.createdAt);

    if (summary) {
      summary.classList.remove('d-none');
      summary.innerHTML = `
        <div class="d-flex flex-wrap gap-2 align-items-center justify-content-between">
          <div>
            <h2 class="h5 mb-1">${latest.name}'s latest entry</h2>
            <p class="mb-0 text-muted">Mood: <strong>${latest.mood}</strong> • Habits: <strong>${latest.habits.join(', ')}</strong></p>
          </div>
          <div class="text-end">
            <div class="display-6 mb-0">${latest.mood}</div>
            <small class="text-muted">${formatDate(latest.createdAt)}</small>
          </div>
        </div>
      `;
    }

    if (window.MoodUI) {
      window.MoodUI.setMoodTheme(latest.mood);
    }
  }

  function renderEntries(entries) {
    const container = document.getElementById('entriesContainer');
    const emptyState = document.getElementById('emptyState');
    if (!container) return;

    container.innerHTML = '';

    if (!entries.length) {
      if (emptyState) emptyState.classList.remove('d-none');
      return;
    }

    if (emptyState) emptyState.classList.add('d-none');

    entries.forEach((entry, index) => {
      const col = document.createElement('div');
      col.className = 'col-md-6 col-xl-4 fade-up';
      col.innerHTML = `
        <div class="card diary-card h-100">
          <div class="card-body p-4">
            <div class="d-flex justify-content-between align-items-start gap-3 mb-3">
              <div class="diary-mood">${entry.mood}</div>
              <div class="text-end">
                <div class="fw-semibold">${entry.name}</div>
                <small class="text-muted">${formatDate(entry.createdAt)}</small>
              </div>
            </div>
            <p class="text-muted small mb-2">Email: ${entry.email}</p>
            <div class="mb-3">
              ${entry.habits.map(habit => `<span class="badge badge-soft rounded-pill me-1 mb-1">${habit}</span>`).join('')}
            </div>
            <p class="mb-0">${entry.comment ? entry.comment : '<span class="text-muted">No comment provided.</span>'}</p>
            <div class="d-flex justify-content-end mt-3">
              <button class="btn btn-sm btn-outline-danger js-delete-entry" data-entry-id="${entry.id}">Delete</button>
            </div>
          </div>
        </div>
      `;
      container.appendChild(col);
    });

    if (window.MoodUI) {
      window.MoodUI.initRevealAnimations();
    }

    container.querySelectorAll('.js-delete-entry').forEach(button => {
      button.addEventListener('click', () => {
        const entryId = Number(button.dataset.entryId);
        const nextEntries = getEntries().filter(entry => entry.id !== entryId);
        saveEntries(nextEntries);
        refreshDashboard();
      });
    });
  }

  function refreshDashboard() {
    const entries = getEntries();
    renderLatestSummary(entries);
    renderEntries(entries);
  }

  function attachFormSubmission(formId) {
    const form = document.getElementById(formId);
    const successMessage = document.getElementById('successMessage');
    if (!form) return;

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const isValid = window.MoodFormValidation.validateForm(form);
      if (!isValid) return;

      const entry = createEntryFromForm(form);
      addEntry(entry);

      if (successMessage) successMessage.classList.remove('d-none');

      window.setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 650);
    });
  }

  function initializeMoodPageTheme() {
    const latestEntry = getEntries()[0];
    if (latestEntry && window.MoodUI) {
      window.MoodUI.setMoodTheme(latestEntry.mood);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const form = window.MoodFormValidation ? window.MoodFormValidation.bindRealTimeValidation('trackerForm') : null;
    if (form) {
      attachFormSubmission('trackerForm');
      if (window.MoodUI) {
        window.MoodUI.bindPasswordToggle('togglePassword', 'password');
        window.MoodUI.bindMoodPreview('mood', 'moodPreview');
      }
    }

    if (document.getElementById('entriesContainer')) {
      refreshDashboard();
      initializeMoodPageTheme();
    }
  });

  window.MoodDiary = {
    getEntries,
    addEntry,
    refreshDashboard
  };
})();
