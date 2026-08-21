(() => {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  const isLocal = ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
  const adminBase = isLocal ? "http://127.0.0.1:5173/admin/" : "/admin/";
  const target = path === "/about"
    ? { type: "page", slug: "about", label: "Edit About" }
    : path === "/"
      ? { label: "Open admin" }
      : { type: "post", slug: path.slice(1), label: "Edit post" };

  async function enabled() {
    if (isLocal) return true;
    try {
      const response = await fetch("/api/session", { credentials: "same-origin" });
      return response.ok && (await response.json()).authenticated;
    } catch { return false; }
  }

  enabled().then((show) => {
    if (!show) return;
    const params = new URLSearchParams();
    if (target.type) params.set("type", target.type);
    if (target.slug) params.set("slug", target.slug);
    params.set("return", window.location.href);
    const link = document.createElement("a");
    link.href = `${adminBase}?${params}`;
    link.textContent = target.label;
    link.setAttribute("aria-label", `${target.label} in the site editor`);
    Object.assign(link.style, {
      position: "fixed", right: "18px", bottom: "18px", zIndex: "9999",
      padding: "10px 14px", border: "1px solid #5f6f52", borderRadius: "3px",
      background: "#fbfaf7", color: "#5f6f52", font: "600 13px ui-sans-serif, system-ui",
      textDecoration: "none", boxShadow: "0 4px 18px rgba(21,21,21,.10)"
    });
    document.body.appendChild(link);
  });
})();
