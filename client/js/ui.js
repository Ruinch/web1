const API_BASE = '';
const TOKEN_KEY = 'mht_token';
const THEME_KEY = 'mht_theme';
const LANG_KEY = 'mht_lang';

const state = {
  lang: localStorage.getItem(LANG_KEY) || 'en',
  theme: localStorage.getItem(THEME_KEY) || 'light'
};

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function authHeaders(extra = {}) {
  const headers = { ...extra };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function apiFetch(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (!(options.body instanceof FormData)) headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  Object.assign(headers, authHeaders());
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    body: options.body && !(options.body instanceof FormData) && typeof options.body !== 'string'
      ? JSON.stringify(options.body)
      : options.body
  });
  if (res.status === 204) return null;
  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : await res.text();
  if (!res.ok) {
    const message = data?.message || data?.error || 'Request failed';
    throw new Error(message);
  }
  return data;
}

function notify(message, type = 'success') {
  const container = document.getElementById('toastContainer') || createToastContainer();
  const toastId = `toast-${Date.now()}`;
  const el = document.createElement('div');
  el.className = `toast align-items-center text-bg-${type === 'error' ? 'danger' : 'success'} border-0 show mb-2`;
  el.id = toastId;
  el.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" aria-label="Close"></button>
    </div>`;
  el.querySelector('button').addEventListener('click', () => el.remove());
  container.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toastContainer';
  document.body.appendChild(container);
  return container;
}

function applyTheme(theme) {
  state.theme = theme;
  localStorage.setItem(THEME_KEY, theme);
  document.body.classList.toggle('theme-dark', theme === 'dark');
  document.body.classList.toggle('theme-light', theme !== 'dark');
  const toggle = document.querySelector('[data-theme-toggle]');
  if (toggle) toggle.textContent = theme === 'dark' ? '🌙 Dark' : '☀️ Light';
}

async function loadDictionary(lang = state.lang) {
  const res = await fetch(`/i18n/${lang}.json`);
  return await res.json();
}

async function applyLanguage(lang) {
  state.lang = lang;
  localStorage.setItem(LANG_KEY, lang);
  const dict = await loadDictionary(lang);
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) el.textContent = dict[key];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key]) el.setAttribute('placeholder', dict[key]);
  });
  const langToggle = document.querySelector('[data-lang-toggle]');
  if (langToggle) langToggle.textContent = lang === 'ru' ? 'RU' : 'EN';
}

function initGlobalUI() {
  applyTheme(state.theme);
  applyLanguage(state.lang).catch(() => {});

  document.addEventListener('click', e => {
    const themeBtn = e.target.closest('[data-theme-toggle]');
    if (themeBtn) applyTheme(state.theme === 'dark' ? 'light' : 'dark');

    const langBtn = e.target.closest('[data-lang-toggle]');
    if (langBtn) applyLanguage(state.lang === 'en' ? 'ru' : 'en');

    const logoutBtn = e.target.closest('[data-logout]');
    if (logoutBtn) {
      clearToken();
      notify('Logged out');
      setTimeout(() => location.href = '/index.html', 300);
    }
  });
}

function requireAuth(redirect = '/login.html') {
  if (!getToken()) location.href = redirect;
}

function moodToScore(mood) {
  const map = { '😞': 1, '😐': 2, '🙂': 3, '😊': 4, '🤩': 5 };
  return map[mood] || 0;
}

function scoreToMood(score) {
  const map = { 1: '😞', 2: '😐', 3: '🙂', 4: '😊', 5: '🤩' };
  return map[score] || '🙂';
}

window.MHT = { apiFetch, notify, getToken, setToken, clearToken, authHeaders, requireAuth, initGlobalUI, moodToScore, scoreToMood };
