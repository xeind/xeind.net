(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  // iOS Sheet curve (Vaul/Ionic) at drawer duration — Emil's canonical
  // large-surface morph. The easing makes 500ms feel faster than it is.
  const EASE = "cubic-bezier(0.32, 0.72, 0, 1)";
  // Site easeOutCubic for quick content swaps (gallery next/prev).
  const EASE_OUT = "cubic-bezier(0.215, 0.61, 0.355, 1)";
  const OPEN_MS = 500;
  const CLOSE_MS = 460;
  const NAV_OUT_MS = 180;
  const NAV_IN_MS = 220;

  // { backdrop, stage, full, counter, items, index, prevOverflow } | null
  let state = null;
  let busy = false; // open/close morph in flight
  let navBusy = false; // next/prev swap in flight

  // Scroll lock matches useScrollbarCompensation: overflow hidden ONLY.
  // Layout shift is prevented site-wide by `scrollbar-gutter: stable` on
  // <html> (global.css) — adding padding compensation here on top of that
  // double-compensates and shifts the page left by the scrollbar width.
  function lockScroll() {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return prevOverflow;
  }

  function afterTransition(el, ms) {
    return new Promise((resolve) => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        resolve();
      };
      el.addEventListener("transitionend", finish, { once: true });
      setTimeout(finish, ms + 80);
    });
  }

  const CHEVRON_LEFT =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>';
  const CHEVRON_RIGHT =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>';

  function buildOverlay(src, alt, itemCount) {
    const backdrop = document.createElement("div");
    backdrop.className = "blog-zoom-backdrop";

    const stage = document.createElement("div");
    stage.className = "blog-zoom-stage";

    const full = document.createElement("img");
    full.src = src;
    full.alt = alt;
    full.className = "blog-zoom-img";
    stage.appendChild(full);

    let counter = null;
    if (itemCount > 1) {
      const prev = document.createElement("button");
      prev.type = "button";
      prev.className = "blog-zoom-nav blog-zoom-nav--prev";
      prev.setAttribute("aria-label", "Previous image");
      prev.dataset.zoomNav = "-1";
      prev.innerHTML = CHEVRON_LEFT;

      const next = document.createElement("button");
      next.type = "button";
      next.className = "blog-zoom-nav blog-zoom-nav--next";
      next.setAttribute("aria-label", "Next image");
      next.dataset.zoomNav = "1";
      next.innerHTML = CHEVRON_RIGHT;

      counter = document.createElement("span");
      counter.className = "blog-zoom-counter";

      stage.appendChild(prev);
      stage.appendChild(next);
      stage.appendChild(counter);
    }

    document.body.appendChild(backdrop);
    document.body.appendChild(stage);
    return { backdrop, stage, full, counter };
  }

  // FLIP: place `full` at the target box, then release to its natural
  // centered size — the image appears to fly between thumbnail and center.
  function flip(full, fromRect) {
    const to = full.getBoundingClientRect();
    const dx = fromRect.left + fromRect.width / 2 - (to.left + to.width / 2);
    const dy = fromRect.top + fromRect.height / 2 - (to.top + to.height / 2);
    const sx = fromRect.width / to.width;
    const sy = fromRect.height / to.height;
    return { dx, dy, sx, sy };
  }

  function itemImg(item) {
    return item.querySelector("img") || item;
  }

  function updateCounter() {
    if (state && state.counter) {
      state.counter.textContent = `${state.index + 1} / ${state.items.length}`;
    }
  }

  function openZoom(button) {
    if (state || busy) return;
    const thumb = button.querySelector("img");
    if (!thumb) return;
    const src = button.dataset.zoomSrc || thumb.src;
    const alt = button.dataset.zoomAlt || thumb.alt || "";

    // Gallery: all cells of the enclosing image grid (including the hidden
    // 6+ ones, which are reachable via next/prev). Standalone images are a
    // gallery of one — no controls.
    const grid = button.closest("[data-image-grid]");
    const items = grid
      ? Array.from(grid.querySelectorAll(".blog-zoom"))
      : [button];
    const index = Math.max(0, items.indexOf(button));

    const { backdrop, stage, full, counter } = buildOverlay(
      src,
      alt,
      items.length,
    );
    const prevOverflow = lockScroll();
    state = { backdrop, stage, full, counter, items, index, prevOverflow };
    updateCounter();

    // Measure the inner <img> after the scroll lock. The overlay is
    // borderless, so img-box → img-box maps pixel-perfectly while the
    // thumbnail's mat and dashed border stay put on the page beneath it —
    // nothing to pop at either end of the morph.
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

  async function showAt(nextIndex, dir) {
    const current = state;
    if (!current) return;
    navBusy = true;

    const item = current.items[nextIndex];
    const src = item.dataset.zoomSrc || itemImg(item).src;
    const alt = item.dataset.zoomAlt || itemImg(item).alt || "";
    const { full } = current;

    // Preload so the incoming slide never animates a blank frame.
    const pre = new Image();
    pre.src = src;
    try {
      await pre.decode();
    } catch {
      /* still swap — browser will paint when ready */
    }
    if (state !== current) return; // closed while preloading

    if (reduceMotion.matches) {
      full.src = src;
      full.alt = alt;
      current.index = nextIndex;
      updateCounter();
      navBusy = false;
      return;
    }

    // Out: quick slide + fade toward the navigation direction.
    full.style.transition = `transform ${NAV_OUT_MS}ms ${EASE_OUT}, opacity ${NAV_OUT_MS}ms ${EASE_OUT}`;
    full.style.transform = `translateX(${-dir * 32}px)`;
    full.style.opacity = "0";
    await afterTransition(full, NAV_OUT_MS);
    if (state !== current) return;

    // Swap, then in: enter from the opposite side.
    full.src = src;
    full.alt = alt;
    full.style.transition = "none";
    full.style.transform = `translateX(${dir * 32}px)`;
    full.getBoundingClientRect();
    full.style.transition = `transform ${NAV_IN_MS}ms ${EASE_OUT}, opacity ${NAV_IN_MS}ms ${EASE_OUT}`;
    full.style.transform = "translate(0, 0)";
    full.style.opacity = "1";
    await afterTransition(full, NAV_IN_MS);

    if (state === current) {
      current.index = nextIndex;
      updateCounter();
    }
    navBusy = false;
  }

  function navigate(dir) {
    if (!state || busy || navBusy || state.items.length < 2) return;
    const n = state.items.length;
    void showAt((state.index + dir + n) % n, dir);
  }

  function closeZoom() {
    if (!state || busy || navBusy) return;
    const { backdrop, stage, full, items, index, prevOverflow } = state;
    state = null;
    busy = true;

    const cleanup = () => {
      backdrop.remove();
      stage.remove();
      document.body.style.overflow = prevOverflow;
      busy = false;
    };

    backdrop.classList.remove("is-visible");

    // Land on the current item's cell; if it's one of the hidden 6+ cells,
    // fall back to the last visible cell (the "+N" one).
    let target = items[index];
    if (target && target.offsetParent === null) {
      const visible = items.filter((el) => el.offsetParent !== null);
      target = visible[visible.length - 1] || null;
    }

    if (reduceMotion.matches || !target) {
      cleanup();
      return;
    }

    // FLIP back onto the target's inner <img> — a clean morph, no fade.
    const toRect = itemImg(target).getBoundingClientRect();
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
    const nav = event.target.closest(".blog-zoom-nav");
    if (nav) {
      event.preventDefault();
      navigate(Number(nav.dataset.zoomNav) || 1);
      return;
    }
    const button = event.target.closest(".blog-zoom");
    if (button) {
      event.preventDefault();
      openZoom(button);
      return;
    }
    if (state) closeZoom();
  });

  document.addEventListener("keydown", (event) => {
    if (!state) return;
    if (event.key === "Escape") closeZoom();
    else if (event.key === "ArrowLeft") navigate(-1);
    else if (event.key === "ArrowRight") navigate(1);
  });
})();
