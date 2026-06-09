/**
 * compendium.js — Tab & sub-filter logic for the Compendium module
 *
 * Behaviour:
 *  - Clicking a category tab activates the matching panel
 *  - Categories with sub-filters (movies → DE/EN, games → PC/ROMs)
 *    reveal the filter bar and show/hide buttons accordingly
 *  - Clicking a tool button opens its URL in a new tab
 */

(function () {
  // Categories that have a sub-filter and which sub-buttons they show
  const SUB_CONFIG = {
    movies: { label: 'Language:', subs: ['all', 'de', 'en'] },
    games:  { label: 'Platform:', subs: ['all', 'pc', 'roms'] },
  };

  const subFilter = document.getElementById('subFilter');
  const subLabel  = document.getElementById('subLabel');
  const subBtns   = document.querySelectorAll('.sub-btn');
  const catTabs   = document.querySelectorAll('.cat-tab');
  const catPanels = document.querySelectorAll('.cat-panel');

  // ── Activate a category tab ──────────────────────────────
  function activateTab(tab) {
    catTabs.forEach(t => t.classList.remove('active'));
    catPanels.forEach(p => p.classList.remove('active'));

    tab.classList.add('active');
    document.querySelector(`.cat-panel[data-cat="${tab.dataset.cat}"]`).classList.add('active');

    const cfg = SUB_CONFIG[tab.dataset.cat];

    if (cfg) {
      // Show relevant sub-buttons, hide the rest
      subLabel.textContent = cfg.label;
      subBtns.forEach(btn => {
        btn.classList.toggle('hidden', !cfg.subs.includes(btn.dataset.sub));
        btn.classList.remove('active');
      });
      document.querySelector('.sub-btn[data-sub="all"]').classList.add('active');

      // Reset visibility — show all buttons in the active panel
      showSubFilter('all');
      subFilter.classList.add('visible');
      subFilter.setAttribute('aria-hidden', 'false');
    } else {
      subFilter.classList.remove('visible');
      subFilter.setAttribute('aria-hidden', 'true');
    }
  }

  // ── Filter buttons by sub-category ──────────────────────
  function showSubFilter(sub) {
    document.querySelectorAll('.cat-panel.active .tool-btn').forEach(btn => {
      const matches = sub === 'all' || btn.dataset.sub === sub;
      btn.style.display = matches ? 'block' : 'none';
    });
  }

  // ── Event: category tab click ────────────────────────────
  catTabs.forEach(tab => {
    tab.addEventListener('click', () => activateTab(tab));
  });

  // ── Event: sub-filter button click ──────────────────────
  subBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      subBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      showSubFilter(btn.dataset.sub);
    });
  });

  // ── Event: tool button click → open URL ─────────────────
  document.querySelectorAll('.tool-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const url = btn.dataset.url;
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
    });
  });
})();
