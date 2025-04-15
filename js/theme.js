
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    document.addEventListener('DOMContentLoaded', () => {
      const toggle = document.getElementById('theme-toggle');
      if (toggle) toggle.checked = savedTheme === 'dark';
    });
