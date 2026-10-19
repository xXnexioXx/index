// ── Module Loader ─────────────────────────────────────────────────────────────
// Finds every <div data-module="path/to/module.html"> in the page,
// fetches the HTML, injects it, and re-executes any <script> tags inside.
// Paths are relative to the ROOT of the site (same level as tools.html).

(function () {
  async function loadModule(slot) {
    const src = slot.dataset.module;
    try {
      const res = await fetch(src);
      if (!res.ok) throw new Error(`HTTP ${res.status} — ${src}`);
      const html = await res.text();

      slot.innerHTML = html;

      // Re-execute <script> tags — browsers don't run scripts injected via innerHTML
      slot.querySelectorAll('script').forEach(oldScript => {
        const newScript = document.createElement('script');
        [...oldScript.attributes].forEach(a => newScript.setAttribute(a.name, a.value));
        newScript.textContent = oldScript.textContent;
        oldScript.replaceWith(newScript);
      });
    } catch (err) {
      slot.innerHTML = `
        <p style="color:#f55; padding:20px; font-size:13px;">
          ⚠ Failed to load module: <code>${src}</code><br>${err.message}
        </p>`;
      console.error('[loader] Module load error:', err);
    }
  }

  document.querySelectorAll('[data-module]').forEach(loadModule);
})();
