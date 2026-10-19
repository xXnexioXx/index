// ── Hamburger Menu ────────────────────────────────────────────────────────────
// Shared across all pages. Requires #menuBtn and #menu in the DOM.

(function () {
  const menuBtn = document.getElementById('menuBtn');
  const menu    = document.getElementById('menu');

  if (!menuBtn || !menu) return;

  function closeMenu() {
    menuBtn.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
    menu.classList.remove('active');
    menuBtn.classList.remove('active');
  }

  function openMenu() {
    menuBtn.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
    menu.classList.add('active');
    menuBtn.classList.add('active');
  }

  menuBtn.addEventListener('click', e => {
    e.stopPropagation();
    menuBtn.getAttribute('aria-expanded') === 'true' ? closeMenu() : openMenu();
  });

  document.addEventListener('click', e => {
    if (!menu.contains(e.target) && e.target !== menuBtn) closeMenu();
  });

  // Close on any menu link click (works for both hash-links and .html links)
  document.querySelectorAll('.menu a').forEach(link => {
    link.addEventListener('click', () => {
      if (link.getAttribute('href').includes('.html')) {
        closeMenu();
      } else {
        closeMenu();
      }
    });
  });
})();
