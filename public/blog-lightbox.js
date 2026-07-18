(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  // iOS Sheet curve (Vaul/Ionic) at drawer duration — Emil's canonical
  // large-surface morph. The easing makes 500ms feel faster than it is.
  const EASE = "cubic-bezier(0.32, 0.72, 0, 1)";
  const OPEN_MS = 500;
  const CLOSE_MS = 460;
  let state = null; // { backdrop, stage, full, thumb, prevOverflow, prevPad }
  let busy = false;

  // Match useScrollbarCompensation: locking body scroll removes the
  // scrollbar, which shifts the page (and the thumbnail we FLIP against)
  // on classic-scrollbar setups. Pad the body by the scrollbar width.
  function lockScroll() {
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPad = document.body.style.paddingRight;
    document.body.style.overflow = "hidden";
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    return { prevOverflow, prevPad };
  }

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
    const { prevOverflow, prevPad } = lockScroll();
    state = { backdrop, stage, full, thumb, prevOverflow, prevPad };

    // Measure the inner <img>, and only after the scroll lock (which can
    // shift layout by the scrollbar width). The overlay is borderless, so
    // img-box → img-box maps pixel-perfectly while the thumbnail's mat and
    // dashed border stay put on the page beneath it — nothing to pop at
    // either end of the morph.
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
      full.style.opacity = "1"; // instant — FLIP places it exactly over the thumb
      full.getBoundingClientRect(); // force reflow so the next frame animates
      full.style.transition = `transform ${OPEN_MS}ms ${EASE}`;
      full.style.transform = "translate(0, 0) scale(1)";
    });
  }

  function closeZoom() {
    if (!state || busy) return;
    const { backdrop, stage, full, thumb, prevOverflow, prevPad } = state;
    state = null;
    busy = true;

    const cleanup = () => {
      backdrop.remove();
      stage.remove();
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPad;
      busy = false;
    };

    backdrop.classList.remove("is-visible");

    if (reduceMotion.matches || !thumb) {
      cleanup();
      return;
    }

    // FLIP back onto the thumbnail's inner <img> — a clean morph, no fade.
    // The borderless overlay lands pixel-identical inside the thumbnail's
    // untouched mat/border, so removing it changes nothing visually.
    const toRect = thumb.getBoundingClientRect();
    const { dx, dy, sx, sy } = flip(full, toRect);
    full.style.transition = `transform ${CLOSE_MS}ms ${EASE}`;
    full.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      cleanup();
    };
    full.addEventListener("transitionend", finish, { once: true });
    setTimeout(finish, CLOSE_MS + 80); // fallback if transitionend doesn't fire
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
