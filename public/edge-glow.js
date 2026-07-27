(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const selector = ".edge-glow-shell";

  // One lamp: the cursor. Every lit thing — diamonds, side rails, divider
  // strips — reads its own true distance from it, through one radius, one
  // curve and one peak alpha.
  //
  // The split of labour is by geometry, not by effect. A diamond is a point,
  // so this script scores it. A rail or a strip is unbounded along one axis,
  // so its gradient is centred on the cursor and the paint scores every pixel
  // of it. Neither path may own a distance term the other also applies, or
  // the falloff squares itself.
  //
  // Reach, peak and spread live in CSS (--edge-glow-radius, --edge-glow-cap,
  // --edge-glow-spread) because the gradients need them at paint time; this
  // script reads them back so there is still only one of each number.
  //
  // The lamp is an ellipse, not a circle: an edge is unbounded along one
  // axis, so that axis is stretched by --edge-glow-spread. The short axis is
  // always the perpendicular one, which is what makes approach read as
  // brightening rather than as a hotspot sliding into view.
  let GLOW_RADIUS = 180;
  let GLOW_SPREAD = 2;
  // Lines closer together than the lamp radius (a divider's two strips are
  // ~20px apart) sit at near-identical distances — a tight local emphasis on
  // top makes the strip directly under the cursor clearly brightest without
  // shrinking anyone's reach.
  const LINE_EMPHASIS_RADIUS = 32;
  // Floor of that emphasis: a faint echo of unity on the far strip.
  const LINE_AMBIENT = 0.2;

  let shells = [];
  let frame = 0;
  // Off-screen default so the first paint (and pointerleave) resolves to
  // zero strength everywhere.
  let pointerX = Number.NEGATIVE_INFINITY;
  let pointerY = Number.NEGATIVE_INFINITY;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  // The curve. Smoothstep: zero slope at both ends, so nothing pops on at
  // the edge of range and nothing flattens out under the cursor.
  // --edge-glow-stops in global.css samples this same function at
  // 0/25/50/75/100% (1, .844, .5, .156, 0) — change one, change both.
  const falloff = (distance, radius) => {
    const normalized = clamp(1 - distance / radius, 0, 1);
    return normalized * normalized * (3 - 2 * normalized);
  };

  const readNumber = (property, fallback) => {
    const raw = getComputedStyle(document.documentElement).getPropertyValue(property);
    const value = Number.parseFloat(raw);
    return Number.isFinite(value) && value > 0 ? value : fallback;
  };

  // Skip style writes when the value hasn't changed — idle shells cost one
  // rect read and nothing else.
  const write = (el, cache, key, prop, value) => {
    if (cache[key] === value) {
      return;
    }
    cache[key] = value;
    el.style.setProperty(prop, value);
  };

  function bind(shell) {
    if (shell.dataset.edgeGlowBound === "true") {
      return;
    }

    shell.dataset.edgeGlowBound = "true";
    // Shells nest (divider shells live inside the page-frame <main> shell).
    // Each node/line must have exactly ONE writer — its nearest shell —
    // or the two entries fight over the same CSS variable with different
    // values and the per-entry write cache turns mouse direction into
    // which writer wins the frame (visible flicker on divider diamonds).
    shells.push({
      shell,
      nodes: Array.from(shell.querySelectorAll(".edge-glow-node")).filter(
        (node) => node.closest(selector) === shell,
      ),
      lines: Array.from(shell.querySelectorAll(".edge-glow-line")).filter(
        (line) => line.closest(selector) === shell,
      ),
      isHorizontal: shell.classList.contains("edge-glow-shell-horizontal"),
      // Only a shell that owns a wash layer needs a hotspot Y or a gate
      // opacity written — divider shells carry strips and nothing else.
      hasLayer: Boolean(shell.querySelector(".edge-glow-layer")),
      cache: {},
      idle: false,
    });
  }

  function updateEntry(entry) {
    const { shell, nodes, lines, isHorizontal, hasLayer, cache } = entry;

    const rect = shell.getBoundingClientRect();

    // The gate only exists to skip work — it matches how far the lamp
    // actually reaches on each axis, so nothing can pop on at partial
    // strength when crossing it. A shell that owns full-bleed lines
    // (horizontal dividers, and the vertical page frame's top/bottom strips)
    // must never gate on X; a shell that owns a wash layer owns vertical
    // rails, whose light runs GLOW_SPREAD × as far down them as across.
    const padX = isHorizontal || lines.length > 0 ? Number.POSITIVE_INFINITY : GLOW_RADIUS;
    const padY = hasLayer ? GLOW_RADIUS * GLOW_SPREAD : GLOW_RADIUS;
    const inside =
      pointerX >= rect.left - padX &&
      pointerX <= rect.right + padX &&
      pointerY >= rect.top - padY &&
      pointerY <= rect.bottom + padY;

    if (!inside && entry.idle) {
      return;
    }
    entry.idle = !inside;

    // True (unclamped) position: the hotspot follows the cursor into the
    // gutters — full-bleed lines glow at the corners, and node distances stay
    // honest instead of clamping to the column edge (which held diamonds at
    // full strength across the gutter, then snapped them off at the gate).
    const relX = pointerX - rect.left;
    const relY = pointerY - rect.top;

    // Hotspot position only matters while something is visible.
    if (inside) {
      write(shell, cache, "x", "--edge-glow-x", `${relX}px`);
      if (hasLayer) {
        write(shell, cache, "y", "--edge-glow-y", `${relY}px`);
      }
    }

    // No strength term here: the layer's gradient is the same ellipse centred
    // on the cursor, so it already grades every pixel of the rails by
    // distance. This is a gate, and it cannot pop — the gate sits at the lamp
    // radius, where the gradient is transparent anyway.
    if (hasLayer) {
      write(shell, cache, "wash", "--edge-glow-opacity", inside ? "1" : "0");
    }

    // Diamonds are points, so the distance is scored here.
    for (let i = 0; i < nodes.length; i += 1) {
      const node = nodes[i];
      const nodeRect = node.getBoundingClientRect();
      const nodeX = nodeRect.left - rect.left + nodeRect.width / 2;
      const nodeY = nodeRect.top - rect.top + nodeRect.height / 2;
      const strength = inside ? falloff(Math.hypot(relX - nodeX, relY - nodeY), GLOW_RADIUS) : 0;
      write(node, cache, `n${i}`, "--edge-node-strength", strength.toFixed(3));
    }

    // Strips are unbounded along X, so their gradient carries the lamp: hand
    // it the signed offset it needs to sit on the cursor, and keep only the
    // local emphasis here. Applying the falloff again would square it.
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      const lineRect = line.getBoundingClientRect();
      const lineY = lineRect.top - rect.top + lineRect.height / 2;
      let strength = 0;
      if (inside) {
        const dy = relY - lineY;
        const local = clamp(1 - Math.abs(dy) / LINE_EMPHASIS_RADIUS, 0, 1);
        strength = LINE_AMBIENT + (1 - LINE_AMBIENT) * local * local;
        write(line, cache, `d${i}`, "--edge-line-dy", `${dy.toFixed(1)}px`);
      }
      write(line, cache, `l${i}`, "--edge-line-strength", strength.toFixed(3));
    }
  }

  function paintAll() {
    frame = 0;

    if (reduceMotion.matches) {
      return;
    }

    for (const entry of shells) {
      if (!entry.shell.isConnected) {
        continue;
      }
      updateEntry(entry);
    }
  }

  function schedule() {
    if (!frame) {
      frame = window.requestAnimationFrame(paintAll);
    }
  }

  function zeroAll() {
    pointerX = Number.NEGATIVE_INFINITY;
    pointerY = Number.NEGATIVE_INFINITY;
    schedule();
  }

  function init() {
    // View transitions swap page content without a reload — drop shells
    // whose elements were removed so they stop being measured forever.
    shells = shells.filter((entry) => entry.shell.isConnected);
    GLOW_RADIUS = readNumber("--edge-glow-radius", GLOW_RADIUS);
    GLOW_SPREAD = readNumber("--edge-glow-spread", GLOW_SPREAD);
    document.querySelectorAll(selector).forEach(bind);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  document.addEventListener("astro:page-load", init);

  // Compute once per frame from the latest pointer position — pointermove
  // can fire at mouse polling rate (500-1000Hz), far above frame rate.
  document.addEventListener("pointermove", (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    schedule();
  });

  document.addEventListener("pointerleave", zeroAll);

  if (typeof reduceMotion.addEventListener === "function") {
    reduceMotion.addEventListener("change", (event) => {
      if (!event.matches) {
        return;
      }

      // paintAll early-returns under reduced motion, so zero directly.
      for (const entry of shells) {
        if (!entry.shell.isConnected) {
          continue;
        }
        entry.shell.style.setProperty("--edge-glow-opacity", "0");
        for (const node of entry.nodes) {
          node.style.setProperty("--edge-node-strength", "0");
        }
        for (const line of entry.lines) {
          line.style.setProperty("--edge-line-strength", "0");
        }
        entry.cache = {};
        entry.idle = true;
      }
    });
  }
})();
