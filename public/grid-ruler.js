/* Phase-0 debug grid ruler (docs/prd-grid-alignment.md).
   Layout.astro renders this script's tag only when import.meta.env.DEV is
   true, so no production page loads it — the file sitting in public/ is
   inert. Add ?grid to any dev URL to draw the 16px major / 8px half-cell
   grid over the document, phase-locked center-top: the registration Phase 1
   gives the real Blueprint gutter grid, so "on the ruler" and "on the grid"
   are the same claim. Magenta, deliberately no theme token: the instrument
   must be visible over all four themes and never mistaken for the site. */
(() => {
  const install = () => {
    if (!new URLSearchParams(location.search).has("grid")) return;
    if (document.getElementById("grid-ruler")) return;
    const major = "rgba(255,0,170,0.35)";
    const half = "rgba(255,0,170,0.12)";
    const el = document.createElement("div");
    el.id = "grid-ruler";
    el.setAttribute("aria-hidden", "true");
    el.style.cssText =
      "position:absolute;top:0;left:0;right:0;z-index:9999;pointer-events:none;" +
      "background-image:" +
      `linear-gradient(to right,${major} 1px,transparent 1px),` +
      `linear-gradient(to bottom,${major} 1px,transparent 1px),` +
      `linear-gradient(to right,${half} 1px,transparent 1px),` +
      `linear-gradient(to bottom,${half} 1px,transparent 1px);` +
      "background-size:16px 16px,16px 16px,8px 8px,8px 8px;" +
      "background-position:center top;";
    const size = () => {
      el.style.height = document.documentElement.scrollHeight + "px";
    };
    size();
    new ResizeObserver(size).observe(document.body);
    document.body.append(el);
  };
  install();
  document.addEventListener("astro:after-swap", install);
})();
