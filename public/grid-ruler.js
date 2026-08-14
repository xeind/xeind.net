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
    const phase = (off) => `calc(round(50%, 1px) + ${off}px) top`;
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
      // Half-a-tile offsets so a tile EDGE (the drawn line) sits on the
      // element's center — same phase rule as the Blueprint gutter grid in
      // global.css, round() included: without it an odd available width leaves
      // the ruler half a pixel off the rails it is meant to measure, at every
      // devicePixelRatio. The reasoning is written out there.
      // This file is served from public/ and is NOT cache-busted — hard-reload
      // after editing it or you will measure against the old phase.
      `background-position:${phase(8)},${phase(8)},${phase(4)},${phase(4)};`;
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
