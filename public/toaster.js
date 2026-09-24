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
  const LIFT = 14; /* how far each toast behind the front peeks below it */
  const SCALE_STEP = 0.06;
  const SWIPE_DISMISS = 45; /* px of drag that counts as "throw it away" */
  const FLICK = 0.11; /* px/ms at release that counts as a throw, any distance */
  const VELOCITY_WINDOW = 100; /* ms of pointer history the release velocity reads */
  const RUBBER = 0.55; /* resistance past the stack's edge; 1 is no resistance */
  const EXIT_MS = 300; /* keep in step with the transition in global.css */
  const DEDUPE_MS = LIFETIME; /* a repeat re-arms the toast still on screen */

  /* Newest first. Index 0 is the front toast — the one at y = 0, pinned to the
     top of the container. Everything after it stacks downward. */
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
      var y = expanded ? offset : i * LIFT;
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
    t.el.style.setProperty("--y", "-100%");
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
    /* The last few pointer samples, so the release can read a velocity. */
    var samples = [];

    /* Past the stack's natural edge (left, down) the toast follows less the
       further it goes, the way a real thing slows before it stops. A hard
       clamp at zero read as frozen. */
    function rubberband(over, dimension) {
      return (over * dimension * RUBBER) / (dimension + RUBBER * Math.abs(over));
    }

    t.el.addEventListener("pointerdown", function (e) {
      /* Only the front toast is draggable — the ones behind are scaled and
         mostly hidden, so dragging one would look like grabbing thin air. */
      if (list[0] !== t || e.button !== 0) return;
      dragging = true;
      dx = 0;
      dy = 0;
      startX = e.clientX;
      startY = e.clientY;
      samples = [{ x: 0, y: 0, at: e.timeStamp }];
      t.el.dataset.swiping = "";
      t.el.setPointerCapture(e.pointerId);
    });

    t.el.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      /* Up and right dismiss: it is a top-right stack, so those are the
         directions that read as pushing it off the screen. */
      var rawX = e.clientX - startX;
      var rawY = e.clientY - startY;
      dx = rawX < 0 ? rubberband(rawX, t.el.offsetWidth) : rawX;
      dy = rawY > 0 ? rubberband(rawY, t.el.offsetHeight) : rawY;
      samples.push({ x: rawX, y: rawY, at: e.timeStamp });
      if (samples.length > 6) samples.shift();
      t.el.style.setProperty("--swipe-x", dx + "px");
      t.el.style.setProperty("--swipe-y", dy + "px");
    });

    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      delete t.el.dataset.swiping;

      /* Velocity over the last ~100ms of the gesture, in px/ms. A quick
         flick that covered less than SWIPE_DISMISS still throws the toast;
         a slow drag past it that was already coming back does not. */
      var last = samples[samples.length - 1];
      var first = last;
      for (var i = samples.length - 1; i >= 0; i--) {
        if (last.at - samples[i].at > VELOCITY_WINDOW) break;
        first = samples[i];
      }
      var elapsed = Math.max(1, e.timeStamp - first.at);
      var vx = (last.x - first.x) / elapsed;
      var vy = (last.y - first.y) / elapsed;

      var thrown = vx > FLICK || vy < -FLICK;
      var pulledBack = vx < -FLICK || vy > FLICK;
      var farEnough = dx > SWIPE_DISMISS || dy < -SWIPE_DISMISS;

      if (thrown || (farEnough && !pulledBack)) {
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
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) return;
      dismiss(t);
    });
  }

  function push(title, options) {
    if (!title) return;
    var description = (options && options.description) || "";

    /* Two clicks on the same copy button should re-arm one toast, not build a
       stack of identical ones. The window runs from the last repeat, not from
       when the toast was first made: measured from creation, a toast that had
       been re-armed three times still fell outside the window while it was
       plainly still on screen, and the next click stacked a duplicate behind
       it. One lifetime from the last repeat means anything arriving while you
       can still read the last one is treated as the same event. */
    var front = list[0];
    if (
      front &&
      front.title === title &&
      front.description === description &&
      Date.now() - front.touchedAt < DEDUPE_MS
    ) {
      front.remaining = LIFETIME;
      front.touchedAt = Date.now();
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
      touchedAt: Date.now(),
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

  /* A toast that expires in a background tab was never read. Hold it until
     the tab is looked at again; the hover pause already owns the timers while
     the stack is expanded. */
  document.addEventListener("visibilitychange", function () {
    if (expanded) return;
    list.forEach(document.hidden ? pauseTimer : startTimer);
  });
})();
