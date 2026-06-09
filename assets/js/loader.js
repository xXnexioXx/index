/**
 * loader.js — Module loader for nexio.network
 *
 * Fetches a module's HTML file, extracts the content of its
 * <section id="frame"> and injects it into a target container.
 * Also executes the module's JS by appending a <script> tag.
 *
 * Usage (in an overview page):
 *   loadModule({
 *     html:      'compendium/compendium.html',   // path to module HTML
 *     css:       'compendium/compendium.css',    // path to module CSS
 *     script:    'compendium/compendium.js',     // path to module JS
 *     container: document.getElementById('mod-compendium'),
 *   });
 */

async function loadModule({ html, css, script, container }) {
  if (!container) return;

  // ── Inject CSS (once) ──────────────────────────────────────
  if (css && !document.querySelector(`link[href="${css}"]`)) {
    const link = document.createElement('link');
    link.rel  = 'stylesheet';
    link.href = css;
    document.head.appendChild(link);
  }

  // ── Fetch HTML, extract <section id="frame"> ───────────────
  try {
    const res = await fetch(html);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const text = await res.text();
    const doc  = new DOMParser().parseFromString(text, 'text/html');
    const section = doc.getElementById('frame');

    if (!section) throw new Error(`No <section id="frame"> found in ${html}`);

    container.innerHTML = section.innerHTML;
  } catch (err) {
    container.innerHTML = `<p style="color:#e05555;text-align:center;padding:2rem;">Failed to load module: ${err.message}</p>`;
    return;
  }

  // ── Execute module JS ──────────────────────────────────────
  if (script) {
    const tag  = document.createElement('script');
    tag.src    = script;
    tag.defer  = true;
    document.body.appendChild(tag);
  }
}
