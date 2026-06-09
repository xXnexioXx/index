/**
 * nav.js — Global navigation logic for nexio.network
 * Handles: hamburger menu toggle, outside-click close, smooth scroll (landing only)
 */

(function () {
  const menuBtn = document.getElementById('menuBtn');
  const menu    = document.getElementById('menu');

  if (!menuBtn || !menu) return;

  function openMenu() {
    menu.classList.add('active');
    menuBtn.classList.add('active');
    menu.setAttribute('aria-hidden', 'false');
    menuBtn.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    menu.classList.remove('active');
    menuBtn.classList.remove('active');
    menu.setAttribute('aria-hidden', 'true');
    menuBtn.setAttribute('aria-expanded', 'false');
  }

  function toggleMenu() {
    menu.classList.contains('active') ? closeMenu() : openMenu();
  }

  // Toggle on button click
  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && e.target !== menuBtn) closeMenu();
  });

  // Close on nav link click; smooth-scroll for anchor links (landing page)
  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');

      // External page navigation — just close the menu
      if (!href.startsWith('#')) {
        closeMenu();
        return;
      }

      // Anchor link — smooth scroll + history update
      e.preventDefault();
      closeMenu();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => history.replaceState(null, '', href), 1000);
      }
    });
  });

  // Update URL hash on scroll (landing page only)
  const sections = document.querySelectorAll('section[id]');
  if (sections.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          history.replaceState(null, '', '#' + entry.target.id);
        }
      });
    }, { threshold: 0.5 });

    sections.forEach((section) => observer.observe(section));
  }
})();
