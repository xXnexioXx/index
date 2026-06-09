/**
 * bookmarks.js — Fetch, parse and render bookmarks from GitHub
 *
 * Fetches a Netscape bookmark HTML file, extracts top-level
 * folders and their links, then renders them as an accordion.
 */

(function () {
  const BOOKMARKS_URL = 'https://raw.githubusercontent.com/xXnexioXx/index/main/bookmarks/bookmarks_clean.html';
  const container = document.getElementById('bm-list');

  if (!container) return;

  // ── Parse Netscape bookmark HTML ────────────────────────
  function parseBookmarks(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');

    // Prefer the personal toolbar folder; fall back to first DL
    let rootDL = null;
    for (const h3 of doc.querySelectorAll('H3')) {
      if (h3.getAttribute('PERSONAL_TOOLBAR_FOLDER') === 'true') {
        let sibling = h3.nextElementSibling;
        while (sibling && sibling.tagName !== 'DL') sibling = sibling.nextElementSibling;
        rootDL = sibling;
        break;
      }
    }
    if (!rootDL) rootDL = doc.querySelector('DL');
    if (!rootDL) return [];

    return Array.from(rootDL.children)
      .filter(el => el.tagName === 'DT' && el.querySelector(':scope > H3'))
      .map(dt => {
        const name  = dt.querySelector(':scope > H3').textContent.trim();
        const links = Array.from(dt.querySelectorAll('A')).reduce((acc, a) => {
          const href = (a.getAttribute('HREF') || '').trim();
          if (!href.startsWith('http')) return acc;

          let host;
          try { host = new URL(href).hostname; } catch { return acc; }
          if (!host || host === '.') return acc;

          let title = a.textContent.trim();
          if (title.length > 50) title = host.replace(/^www\./, '');

          acc.push({ title, href });
          return acc;
        }, []);

        return { name, links };
      })
      .filter(cat => cat.links.length > 0);
  }

  // ── Build accordion HTML ─────────────────────────────────
  function buildCategory(cat) {
    const wrapper = document.createElement('div');
    wrapper.className = 'bm-cat';

    const head = document.createElement('div');
    head.className = 'bm-head';
    head.setAttribute('role', 'button');
    head.setAttribute('tabindex', '0');
    head.innerHTML = `
      <span>${cat.name}</span>
      <div class="bm-meta">
        <span class="bm-count">${cat.links.length}</span>
        <span class="bm-arrow">&#9660;</span>
      </div>`;

    const linksGrid = document.createElement('div');
    linksGrid.className = 'bm-links';

    cat.links.forEach(({ title, href }) => {
      const a = document.createElement('a');
      a.className = 'bm-link';
      a.href = href;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.title = href;
      a.textContent = title;
      linksGrid.appendChild(a);
    });

    // Toggle open/closed
    const toggle = () => wrapper.classList.toggle('open');
    head.addEventListener('click', toggle);
    head.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });

    wrapper.appendChild(head);
    wrapper.appendChild(linksGrid);
    return wrapper;
  }

  function renderBookmarks(cats) {
    container.innerHTML = '';
    const fragment = document.createDocumentFragment();
    cats.forEach(cat => fragment.appendChild(buildCategory(cat)));
    container.appendChild(fragment);
  }

  // ── Fetch and render ─────────────────────────────────────
  async function loadBookmarks() {
    try {
      const res = await fetch(`${BOOKMARKS_URL}?cb=${Date.now()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const cats = parseBookmarks(await res.text());
      if (!cats.length) throw new Error('No bookmark categories found.');

      renderBookmarks(cats);
    } catch (err) {
      container.innerHTML = `
        <div class="bm-error">
          Failed to load bookmarks. <small>${err.message}</small><br><br>
          <a href="${BOOKMARKS_URL}" target="_blank" rel="noopener">Open on GitHub</a>
        </div>`;
    }
  }

  loadBookmarks();
})();
