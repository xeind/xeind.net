(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
  let state = null; // { backdrop, stage, full, thumb, prevOverflow } | null
  let busy = false;

  function buildOverlay(src, alt) {
    const backdrop = document.createElement("div");
    backdrop.className = "blog-zoom-backdrop";

    const stage = document.createElement("div");
    stage.className = "blog-zoom-stage";

    const full = document.createElement("img");
    full.src = src;
    full.alt = alt;
    full.className = "blog-zoom-img";

    stage.appendChild(full);
    document.body.appendChild(backdrop);
    document.body.appendChild(stage);
    return { backdrop, stage, full };
  }

  // FLIP: place `full` at the thumbnail's box, then release to its natural
  // centered size — the image appears to fly from the thumbnail to center.
  function flip(full, fromRect) {
    const to = full.getBoundingClientRect();
    const dx = fromRect.left + fromRect.width / 2 - (to.left + to.width / 2);
    const dy = fromRect.top + fromRect.height / 2 - (to.top + to.height / 2);
    const sx = fromRect.width / to.width;
    const sy = fromRect.height / to.height;
    return { dx, dy, sx, sy };
  }

  function openZoom(button) {
    if (state || busy) return;
    const thumb = button.querySelector("img");
    if (!thumb) return;
    const src = button.dataset.zoomSrc || thumb.src;
    const alt = button.dataset.zoomAlt || thumb.alt || "";

    const { backdrop, stage, full } = buildOverlay(src, alt);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    state = { backdrop, stage, full, thumb, prevOverflow };

    const fromRect = thumb.getBoundingClientRect();

    requestAnimationFrame(() => {
      backdrop.classList.add("is-visible");

      if (reduceMotion.matches) {
        full.style.opacity = "1";
        return;
      }

      const { dx, dy, sx, sy } = flip(full, fromRect);
      full.style.transformOrigin = "center center";
      full.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
      full.style.opacity = "1";
      full.getBoundingClientRect(); // force reflow so the next frame animates
      full.style.transition = `transform 320ms ${EASE}`;
      full.style.transform = "translate(0, 0) scale(1)";
    });
  }

  function closeZoom() {
    if (!state || busy) return;
    const { backdrop, stage, full, thumb, prevOverflow } = state;
    state = null;
    busy = true;

    const cleanup = () => {
      backdrop.remove();
      stage.remove();
      document.body.style.overflow = prevOverflow;
      busy = false;
    };

    backdrop.classList.remove("is-visible");

    if (reduceMotion.matches || !thumb) {
      cleanup();
      return;
    }

    // FLIP back toward the thumbnail's current box.
    const toRect = thumb.getBoundingClientRect();
    const { dx, dy, sx, sy } = flip(full, toRect);
    full.style.transition = `transform 260ms ${EASE}, opacity 260ms ${EASE}`;
    full.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
    full.style.opacity = "0";

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      cleanup();
    };
    full.addEventListener("transitionend", finish, { once: true });
    setTimeout(finish, 400); // fallback if transitionend doesn't fire
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest(".blog-zoom");
    if (button) {
      event.preventDefault();
      openZoom(button);
      return;
    }
    if (state) closeZoom();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state) closeZoom();
  });
})();
