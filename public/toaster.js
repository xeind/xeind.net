/* Toaster — sonner's behaviour, drawn in this site's hand.
   Styles live in global.css under "TOASTER" (public/ is not scanned for
   Tailwind classes, so everything here is a plain class name).

   Why vanilla and not a React island: both callers are already non-React —
   public/codeblock-copy.js and the inline email script in index.astro — and a
   toaster mounted in Layout.astro would put ~100KB of hydration on every page
   to draw a rectangle that moves. All of the motion here is transform and
   opacity, which is what docs/animation.md asks for anyway.

   Call it from anywhere, without caring whether this file has loaded yet:

     document.dispatchEvent(new CustomEvent("toast", {
       detail: { title: "Copied to clipboard", description: "xd@xeind.net" },
     }));

   window.toast(title, { description }) is the same thing for console use. */
(() => {
  const MAX = 3; /* visible at once; a fourth pushes the oldest out */
  const LIFETIME = 4000;
  const GAP = 16; /* space between toasts once the stack is expanded */
  const LIFT = 14; /* how far each toast behind the front peeks above it */
  const SCALE_STEP = 0.06;
  const SWIPE_DISMISS = 45; /* px of drag that counts as "throw it away" */
  const EXIT_MS = 300; /* keep in step with the transition in global.css */
  const DEDUPE_MS = 1000;

  /* Newest first. Index 0 is the front toast — the one at y = 0. */
  var list = [];
  var expanded = false;
  var container = null;

  function ensureContainer() {
    if (!container) {
      container = document.createElement("section");
      container.className = "toaster";
      container.setAttribute("aria-label", "Notifications");

      /* pointerenter/leave fire for descendants too, so hovering any toast
         expands the whole stack. Each toast bridges the gap below itself with
         a ::after, or crossing an expanded gap would read as a leave. */
      container.addEventListener("pointerenter", function () {
        expanded = true;
        list.forEach(pauseTimer);
        layout();
      });
      container.addEventListener("pointerleave", function () {
        expanded = false;
        list.forEach(startTimer);
        layout();
      });
    }
    /* ClientRouter swaps the whole body, taking the container with it. The
       node and its toasts survive the move, so a toast outlives a navigation. */
    if (!container.isConnected) document.body.appendChild(container);
    return container;
  }

  function layout() {
    var heights = list.map(function (t) {
      return t.el.offsetHeight;
    });
    var offset = 0;

    list.forEach(function (t, i) {
      var y = expanded ? -offset : -(i * LIFT);
      var scale = expanded ? 1 : 1 - i * SCALE_STEP;
      offset += heights[i] + GAP;

      t.el.style.setProperty("--y", y + "px");
      t.el.style.setProperty("--scale", String(scale));
      /* Past MAX a toast is on its way out; fade it rather than let it peek. */
      t.el.style.setProperty("--toast-opacity", i >= MAX ? "0" : "1");
    });
  }

  function startTimer(t) {
    clearTimeout(t.timer);
    t.startedAt = Date.now();
    t.timer = setTimeout(function () {
      dismiss(t);
    }, t.remaining);
  }

  function pauseTimer(t) {
    clearTimeout(t.timer);
    t.remaining = Math.max(0, t.remaining - (Date.now() - t.startedAt));
  }

  function dismiss(t) {
    if (t.dismissed) return;
    t.dismissed = true;
    clearTimeout(t.timer);

    list = list.filter(function (other) {
      return other !== t;
    });

    t.el.dataset.state = "removed";
    t.el.style.setProperty("--y", "100%");
    t.el.style.setProperty("--swipe-x", "0px");
    t.el.style.setProperty("--swipe-y", "0px");
    t.el.style.setProperty("--toast-opacity", "0");

    setTimeout(function () {
      t.el.remove();
    }, EXIT_MS);

    layout();
  }

  function bindSwipe(t) {
    var startX = 0;
    var startY = 0;
    var dx = 0;
    var dy = 0;
    var dragging = false;

    t.el.addEventListener("pointerdown", function (e) {
      /* Only the front toast is draggable — the ones behind are scaled and
         mostly hidden, so dragging one would look like grabbing thin air. */
      if (list[0] !== t || e.button !== 0) return;
      dragging = true;
      dx = 0;
      dy = 0;
      startX = e.clientX;
      startY = e.clientY;
      t.el.dataset.swiping = "";
      t.el.setPointerCapture(e.pointerId);
    });

    t.el.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      /* Down and right only: it is a bottom-right stack, so those are the
         directions that read as pushing it off the screen. */
      dx = Math.max(0, e.clientX - startX);
      dy = Math.max(0, e.clientY - startY);
      t.el.style.setProperty("--swipe-x", dx + "px");
      t.el.style.setProperty("--swipe-y", dy + "px");
    });

    function endDrag() {
      if (!dragging) return;
      dragging = false;
      delete t.el.dataset.swiping;

      if (dx > SWIPE_DISMISS || dy > SWIPE_DISMISS) {
        dismiss(t);
        return;
      }
      t.el.style.setProperty("--swipe-x", "0px");
      t.el.style.setProperty("--swipe-y", "0px");
    }

    t.el.addEventListener("pointerup", endDrag);
    t.el.addEventListener("pointercancel", endDrag);

    t.el.addEventListener("click", function () {
      /* A throw that fell short ends in a click. Don't dismiss on that. */
      if (dx > 4 || dy > 4) return;
      dismiss(t);
    });
  }

  function push(title, options) {
    if (!title) return;
    var description = (options && options.description) || "";

    /* Two clicks on the same copy button should re-arm one toast, not build a
       stack of identical ones. */
    var front = list[0];
    if (
      front &&
      front.title === title &&
      front.description === description &&
      Date.now() - front.createdAt < DEDUPE_MS
    ) {
      front.remaining = LIFETIME;
      if (!expanded) startTimer(front);
      return;
    }

    var el = document.createElement("output");
    el.className = "toast";
    el.dataset.state = "entering";

    var titleEl = document.createElement("div");
    titleEl.className = "toast-title";
    titleEl.textContent = title;
    el.appendChild(titleEl);

    if (description) {
      var descEl = document.createElement("div");
      descEl.className = "toast-description";
      descEl.textContent = description;
      el.appendChild(descEl);
    }

    /* Later in the DOM paints on top, which is exactly the stacking order the
       front toast wants — so the stack needs no z-index of its own. */
    ensureContainer().appendChild(el);

    var t = {
      el: el,
      title: title,
      description: description,
      createdAt: Date.now(),
      remaining: LIFETIME,
      startedAt: Date.now(),
      timer: 0,
      dismissed: false,
    };

    list.unshift(t);
    bindSwipe(t);

    /* Two frames: one to let the browser paint the entering state, one to
       transition out of it. A single frame drops the animation in Safari. */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.dataset.state = "visible";
        layout();
      });
    });

    if (!expanded) startTimer(t);

    while (list.length > MAX) dismiss(list[list.length - 1]);
  }

  window.toast = push;

  document.addEventListener("toast", function (e) {
    var detail = e.detail || {};
    push(detail.title, detail);
  });

  document.addEventListener("astro:after-swap", function () {
    if (list.length) ensureContainer();
  });
})();
