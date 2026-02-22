(function () {
  const cfg = window.SITE_CONFIG || {};
  const apiUrl = cfg.CONTENT_API_URL;
  const basePath = (cfg.BASE_PATH || "").replace(/\/$/, "");
  const thanksPath = cfg.THANK_YOU_PATH || "/thanks.html";

  function toUrl(path) {
    if (!path) return basePath || "/";
    if (path.startsWith("http")) return path;
    if (!basePath) return path;
    return path.startsWith("/") ? (basePath + path) : (basePath + "/" + path);
  }

  document.addEventListener("submit", async (e) => {
    const form = e.target.closest("[data-leads-form]");
    if (!form) return;

    e.preventDefault();

    if (!apiUrl || apiUrl.includes("PASTE_YOUR")) {
      alert("Missing CONTENT_API_URL in assets/config.js");
      return;
    }

    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries());
    payload._type = "lead";
    payload._page = location.href;
    payload._ts = new Date().toISOString();

    const res = await fetch(apiUrl, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      alert("Sorry — message failed. Please try again.");
      return;
    }

    location.href = toUrl(thanksPath);
  });
})();
