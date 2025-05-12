export function initThemeManager() {
  const themeButtons = document.querySelectorAll('.theme-btn');

  function applyTheme(theme) {
    document.body.classList.remove('dark-theme', 'light-theme');
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('dark-theme', 'light-theme');
      document.body.style.removeProperty('--primary-color');
      document.body.style.removeProperty('--secondary-color');
      document.body.style.removeProperty('--tertiary-color');
      document.body.style.removeProperty('--background-gradient-start');
      document.body.style.removeProperty('--background-gradient-end');
      document.body.style.removeProperty('--text-color');
      document.body.style.removeProperty('--card-background');
      document.body.style.removeProperty('--card-hover-shadow');
      document.body.style.removeProperty('--link-color');
      document.body.style.removeProperty('--link-hover-color');
    }
  }

  themeButtons.forEach(button => {
    button.addEventListener('click', () => {
      themeButtons.forEach(btn => btn.classList.remove('selected'));
      button.classList.add('selected');
      applyTheme(button.getAttribute('data-theme'));
    });
  });

  // Apply default theme on load
  const defaultButton = document.querySelector('.theme-btn.selected');
  if (defaultButton) {
    applyTheme(defaultButton.getAttribute('data-theme'));
  }
}
