window.addEventListener('DOMContentLoaded', () => {
  MHT.initGlobalUI();
  MHT.requireAuth('/login.html');

  const state = {
    page: 1,
    limit: 10,
    filters: { search: '', date: '', mood: '', habit: '' },
    allEntries: [],
    currentEntries: [],
    goalList: JSON.parse(localStorage.getItem('mht_goals') || '[]')
  };

  const els = {
    cards: document.getElementById('cardsContainer'),
    search: document.getElementById('searchInput'),
    date: document.getElementById('filterDate'),
    mood: document.getElementById('filterMood'),
    habit: document.getElementById('filterHabit'),
    loadMore: document.getElementById('loadMoreBtn'),
    monthLabel: document.getElementById('monthLabel'),
    calendar: document.getElementById('calendarGrid'),
    dayRecords: document.getElementById('dayRecords'),
    goalForm: document.getElementById('goalForm'),
    goalList: document.getElementById('goalList'),
    editForm: document.getElementById('editForm'),
    editModalEl: document.getElementById('editModal'),
    statsText: document.getElementById('statsText')
  };

  const editModal = new bootstrap.Modal(els.editModalEl);
  let charts = { line: null, habits: null };
  let editId = null;

  function monthKey(date = new Date()) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  function toDateString(dt) {
    return new Date(dt).toISOString().slice(0, 10);
  }

  async function fetchAll() {
    const query = new URLSearchParams({ all: '1' });
    const data = await MHT.apiFetch(`/api/moods?${query.toString()}`);
    state.allEntries = data.items || data;
    renderCharts();
    renderCalendar();
    renderGoals();
    renderStats();
  }

  async function fetchPage(reset = false) {
    if (reset) { state.page = 1; els.cards.innerHTML = ''; }
    const params = new URLSearchParams({
      limit: state.limit,
      offset: String((state.page - 1) * state.limit),
      ...Object.fromEntries(Object.entries(state.filters).filter(([, v]) => v))
    });
    const data = await MHT.apiFetch(`/api/moods?${params.toString()}`);
    state.currentEntries = data.items || [];
    renderCards(reset);
    els.loadMore.classList.toggle('d-none', !data.hasMore);
  }

  function renderCards(reset = false) {
    const items = state.currentEntries;
    if (reset) els.cards.innerHTML = '';
    if (!items.length && reset) {
      els.cards.innerHTML = '<div class="col-12"><div class="alert alert-secondary">No entries found.</div></div>';
      return;
    }
    items.forEach(entry => {
      const habits = entry.habits.join(', ');
      const col = document.createElement('div');
      col.className = 'col-12 col-md-6 col-xl-4 mb-3';
      col.innerHTML = `
        <div class="card record-card h-100">
          <div class="card-body d-flex flex-column">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div class="mood-emoji">${entry.mood}</div>
              <span class="badge badge-soft">${entry.created_at.slice(0, 10)}</span>
            </div>
            <p class="mb-2"><strong>Habits:</strong> ${habits}</p>
            <p class="mb-3 flex-grow-1">${entry.comment}</p>
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-outline-primary" data-edit="${entry.id}">✏️ Edit</button>
              <button class="btn btn-sm btn-outline-danger" data-delete="${entry.id}">🗑️ Delete</button>
            </div>
          </div>
        </div>`;
      els.cards.appendChild(col);
    });
  }

  function renderCharts() {
    const moodCtx = document.getElementById('moodChart');
    const habitCtx = document.getElementById('habitChart');
    if (!moodCtx || !habitCtx) return;

    const entries = [...state.allEntries].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    const labels = entries.map(e => e.created_at.slice(0, 10));
    const scores = entries.map(e => MHT.moodToScore(e.mood));

    if (charts.line) charts.line.destroy();
    charts.line = new Chart(moodCtx, {
      type: 'line',
      data: { labels, datasets: [{ label: 'Mood score', data: scores, tension: 0.35 }] },
      options: { responsive: true, scales: { y: { suggestedMin: 1, suggestedMax: 5, ticks: { stepSize: 1 } } } }
    });

    const counts = { sport: 0, study: 0, reading: 0, sleep: 0 };
    state.allEntries.forEach(e => e.habits.forEach(h => counts[h] = (counts[h] || 0) + 1));
    if (charts.habits) charts.habits.destroy();
    charts.habits = new Chart(habitCtx, {
      type: 'bar',
      data: { labels: Object.keys(counts), datasets: [{ label: 'Habit count', data: Object.values(counts) }] },
      options: { responsive: true, indexAxis: 'x' }
    });
  }

  function renderCalendar() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    els.monthLabel.textContent = now.toLocaleString(undefined, { month: 'long', year: 'numeric' });
    els.calendar.innerHTML = '';

    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startDay = first.getDay();
    for (let i = 0; i < startDay; i++) {
      const empty = document.createElement('div');
      empty.className = 'calendar-day empty';
      els.calendar.appendChild(empty);
    }

    for (let day = 1; day <= last.getDate(); day++) {
      const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const entries = state.allEntries.filter(e => e.created_at.slice(0, 10) === date);
      const dayEl = document.createElement('div');
      dayEl.className = 'calendar-day';
      dayEl.innerHTML = `<div class="num">${day}</div><div class="emoji">${entries[0]?.mood || ''}</div><div class="small text-muted">${entries.length ? entries.length + ' entry' + (entries.length > 1 ? 'ies' : '') : ''}</div>`;
      dayEl.addEventListener('click', () => renderDayRecords(date, entries));
      els.calendar.appendChild(dayEl);
    }
  }

  function renderDayRecords(date, entries) {
    els.dayRecords.innerHTML = `<h6 class="mb-3">${date}</h6>`;
    if (!entries.length) {
      els.dayRecords.innerHTML += '<div class="text-muted">No records for this day.</div>';
      return;
    }
    entries.forEach(e => {
      els.dayRecords.innerHTML += `<div class="border rounded-3 p-3 mb-2"><strong>${e.mood}</strong> — ${e.comment}<br><span class="text-muted">${e.habits.join(', ')}</span></div>`;
    });
  }

  function renderGoals() {
    els.goalList.innerHTML = '';
    const counts = { sport: 0, study: 0, reading: 0, sleep: 0 };
    state.allEntries.forEach(e => e.habits.forEach(h => counts[h] = (counts[h] || 0) + 1));
    localStorage.setItem('mht_goals', JSON.stringify(state.goalList));
    state.goalList.forEach((goal, idx) => {
      const done = (counts[goal.habit] || 0) >= goal.target;
      const item = document.createElement('div');
      item.className = 'd-flex justify-content-between align-items-center border rounded-3 p-2 mb-2';
      item.innerHTML = `<span>${goal.habit} ${goal.target}×</span><span class="badge ${done ? 'bg-success' : 'bg-secondary'}">${done ? 'Completed' : 'Not yet'}</span><button class="btn btn-sm btn-link text-danger p-0" data-remove-goal="${idx}">x</button>`;
      els.goalList.appendChild(item);
    });
  }

  function renderStats() {
    els.statsText.textContent = `Total entries: ${state.allEntries.length}`;
  }

  async function loadMore() {
    state.page += 1;
    try { await fetchPage(false); }
    catch (err) { MHT.notify(err.message, 'error'); }
  }

  els.search.addEventListener('input', async e => { state.filters.search = e.target.value; await fetchPage(true); });
  els.date.addEventListener('change', async e => { state.filters.date = e.target.value; await fetchPage(true); });
  els.mood.addEventListener('change', async e => { state.filters.mood = e.target.value; await fetchPage(true); });
  els.habit.addEventListener('change', async e => { state.filters.habit = e.target.value; await fetchPage(true); });
  els.loadMore.addEventListener('click', loadMore);

  document.addEventListener('click', async e => {
    const editBtn = e.target.closest('[data-edit]');
    const delBtn = e.target.closest('[data-delete]');
    const removeGoalBtn = e.target.closest('[data-remove-goal]');

    if (editBtn) {
      editId = editBtn.dataset.edit;
      const entry = state.allEntries.find(x => String(x.id) === String(editId));
      if (!entry) return;
      els.editForm.mood.value = entry.mood;
      els.editForm.comment.value = entry.comment;
      [...els.editForm.querySelectorAll('input[name="habits"]')].forEach(cb => cb.checked = entry.habits.includes(cb.value));
      editModal.show();
    }

    if (delBtn) {
      const id = delBtn.dataset.delete;
      if (!confirm('Delete this entry?')) return;
      try {
        await MHT.apiFetch(`/api/moods/${id}`, { method: 'DELETE' });
        MHT.notify('Deleted');
        await refreshAll();
      } catch (err) {
        MHT.notify(err.message, 'error');
      }
    }

    if (removeGoalBtn) {
      state.goalList.splice(Number(removeGoalBtn.dataset.removeGoal), 1);
      renderGoals();
    }
  });

  els.editForm.addEventListener('submit', async e => {
    e.preventDefault();
    try {
      const habits = [...els.editForm.querySelectorAll('input[name="habits"]:checked')].map(x => x.value);
      await MHT.apiFetch(`/api/moods/${editId}`, {
        method: 'PUT',
        body: { mood: els.editForm.mood.value, habits, comment: els.editForm.comment.value.trim() }
      });
      editModal.hide();
      MHT.notify('Updated');
      await refreshAll();
    } catch (err) {
      MHT.notify(err.message, 'error');
    }
  });

  els.goalForm.addEventListener('submit', e => {
    e.preventDefault();
    const habit = els.goalForm.habit.value;
    const target = Number(els.goalForm.target.value);
    state.goalList.push({ habit, target });
    els.goalForm.reset();
    renderGoals();
  });

  async function refreshAll() {
    await fetchAll();
    await fetchPage(true);
  }

  document.getElementById('exportJsonBtn').addEventListener('click', async () => {
    const res = await fetch('/api/export/json', { headers: MHT.authHeaders() });
    const blob = await res.blob();
    downloadBlob(blob, 'moods.json');
  });
  document.getElementById('exportCsvBtn').addEventListener('click', async () => {
    const res = await fetch('/api/export/csv', { headers: MHT.authHeaders() });
    const blob = await res.blob();
    downloadBlob(blob, 'moods.csv');
  });

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  refreshAll().catch(err => MHT.notify(err.message, 'error'));
});
