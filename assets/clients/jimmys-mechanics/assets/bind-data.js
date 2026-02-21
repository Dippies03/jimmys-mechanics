(function () {
  const cfg = window.SITE_CONFIG || {};
  const apiUrl = cfg.CONTENT_API_URL;

  async function fetchContent() {
    if (!apiUrl || apiUrl.includes("PASTE_YOUR")) {
      console.warn("Missing CONTENT_API_URL in assets/config.js");
      return {};
    }
    const res = await fetch(apiUrl, { cache: "no-store" });
    if (!res.ok) throw new Error("Content API fetch failed: " + res.status);
    return await res.json();
  }

  function get(obj, path) {
    return path.split(".").reduce((acc, key) => (acc && acc[key] != null ? acc[key] : null), obj);
  }

  function bindText(root, data) {
    root.querySelectorAll("[data-bind]").forEach(el => {
      const path = el.getAttribute("data-bind");
      const val = get(data, path);
      if (val != null) el.textContent = String(val);
    });

    root.querySelectorAll("[data-bind-attr]").forEach(el => {
      const spec = el.getAttribute("data-bind-attr"); // e.g. "href=settings.phone_link"
      const [attr, path] = spec.split("=").map(s => s.trim());
      const val = get(data, path);
      if (val != null) el.setAttribute(attr, String(val));
    });
  }

  function bindLists(root, data) {
    root.querySelectorAll("[data-bind-list]").forEach(container => {
      const path = container.getAttribute("data-bind-list");
      const list = get(data, path);
      if (!Array.isArray(list) || list.length === 0) return;

      const template = container.firstElementChild?.cloneNode(true);
      if (!template) return;

      container.innerHTML = "";
      list.forEach(item => {
        const node = template.cloneNode(true);
        node.querySelectorAll("[data-bind]").forEach(el => {
          const p = el.getAttribute("data-bind");
          if (p === "item") el.textContent = String(item);
          else {
            const v = get({ item }, p);
            if (v != null) el.textContent = String(v);
          }
        });
        container.appendChild(node);
      });
    });
  }

  function applyBasePath() {
    const basePath = (cfg.BASE_PATH || "").replace(/\/$/, "");
    if (!basePath) return;

    document.querySelectorAll('a[href^="./"], a[href^="/"]').forEach(a => {
      const href = a.getAttribute("href");
      if (!href) return;

      // ignore external, hash, mailto/tel
      if (/^(https?:)?\/\//.test(href)) return;
      if (href.startsWith("#")) return;
      if (href.startsWith("mailto:") || href.startsWith("tel:")) return;

      if (href.startsWith("./")) a.setAttribute("href", basePath + href.slice(1));
      else if (href.startsWith("/")) a.setAttribute("href", basePath + href);
    });
  }

  async function init() {
    applyBasePath();
    const data = await fetchContent();
    bindText(document, data);
    bindLists(document, data);
  }

  init().catch(err => console.error(err));
})();
