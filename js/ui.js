(() => {
  const moodThemeMap = {
    '😄': 'mood-happy',
    '😐': 'mood-neutral',
    '😢': 'mood-sad',
    '😡': 'mood-angry'
  };

  function setMoodTheme(mood) {
    const body = document.body;
    if (!body) return;

    Object.values(moodThemeMap).forEach(cls => body.classList.remove(cls));
    const themeClass = moodThemeMap[mood];
    if (themeClass) body.classList.add(themeClass);
  }

  function pulseElement(element) {
    if (!element) return;
    element.classList.remove('bump');
    void element.offsetWidth;
    element.classList.add('bump');
    window.setTimeout(() => element.classList.remove('bump'), 280);
  }

  function bindPasswordToggle(toggleId, inputId) {
    const toggleButton = document.getElementById(toggleId);
    const input = document.getElementById(inputId);
    if (!toggleButton || !input) return;

    toggleButton.addEventListener('click', () => {
      const isHidden = input.type === 'password';
      input.type = isHidden ? 'text' : 'password';
      toggleButton.textContent = isHidden ? 'Hide' : 'Show';
      pulseElement(toggleButton);
    });
  }

  function bindMoodPreview(selectId, previewId) {
    const select = document.getElementById(selectId);
    const preview = document.getElementById(previewId);
    if (!select || !preview) return;

    const sync = () => {
      const mood = select.value;
      preview.textContent = mood || '🙂';
      setMoodTheme(mood);
      pulseElement(preview);
    };

    select.addEventListener('change', sync);
    sync();
  }

  function initRevealAnimations() {
    const items = document.querySelectorAll('.fade-up');
    if (!items.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    items.forEach(item => observer.observe(item));
  }

  window.MoodUI = {
    setMoodTheme,
    bindPasswordToggle,
    bindMoodPreview,
    initRevealAnimations
  };

  document.addEventListener('DOMContentLoaded', () => {
    initRevealAnimations();
  });
})();
