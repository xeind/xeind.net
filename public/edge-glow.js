(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const selector = ".edge-glow-shell";

  // One radius, one curve, for every glow effect — the cursor acts as a
  // single lamp: diamonds, side rails, divider lines, and washes all light
  // in proportion to their true distance from it, so nearby edges read as
  // one illuminated system rather than separate effects with separate
  // trigger distances.
  const GLOW_RADIUS = 180;
  // Lines closer together than the lamp radius (a divider's two strips are
  // ~20px apart) would read identical under the lamp alone — a tight local
  // emphasis on top makes the line directly under the cursor clearly
  // brightest without shrinking anyone's reach.
  const LINE_EMPHASIS_RADIUS = 32;

  let shells = [];
  let frame = 0;
  // Off-screen default so the first paint (and pointerleave) resolves to
  // zero strength everywhere.
  let pointerX = Number.NEGATIVE_INFINITY;
  let pointerY = Number.NEGATIVE_INFINITY;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  // Ease-out (sqrt): ramps up quickly on entry so effects react as soon as
  // the cursor is in range — right for the diamonds, whose capped 1px
  // outlines would be invisible without an early ramp.
  const falloff = (distance, radius) => {
    const normalized = clamp(1 - distance / radius, 0, 1);
    return Math.sqrt(normalized);
  };

  // Smoothstep: near-zero at the edge of range, steepening on approach —
  // right for the wash, whose large uncapped hotspot reads as "already on"
  // under an ease-out curve.
  const smoothFalloff = (distance, radius) => {
    const normalized = clamp(1 - distance / radius, 0, 1);
    return normalized * normalized * (3 - 2 * normalized);
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
    shells.push({
      shell,
      nodes: Array.from(shell.querySelectorAll(".edge-glow-node")),
      lines: Array.from(shell.querySelectorAll(".edge-glow-line")),
      isHorizontal: shell.classList.contains("edge-glow-shell-horizontal"),
      isVertical: shell.classList.contains("edge-glow-shell-vertical"),
      cache: {},
      idle: false,
    });
  }

  function updateEntry(entry) {
    const { shell, nodes, lines, isHorizontal, isVertical, cache } = entry;
    const rect = shell.getBoundingClientRect();

    // The gate only exists to skip work — it matches the shared falloff
    // radius so nothing can pop on at partial strength when crossing it.
    // Any shell that owns full-bleed lines (horizontal dividers, and the
    // vertical page frame's top/bottom strips) must never gate on X.
    const padX =
      isHorizontal || lines.length > 0
        ? Number.POSITIVE_INFINITY
        : GLOW_RADIUS;
    const padY = GLOW_RADIUS;
    const inside =
      pointerX >= rect.left - padX &&
      pointerX <= rect.right + padX &&
      pointerY >= rect.top - padY &&
      pointerY <= rect.bottom + padY;

    if (!inside && entry.idle) {
      return;
    }
    entry.idle = !inside;

    const relX = pointerX - rect.left;
    const relY = pointerY - rect.top;
    // True (unclamped) X: the hotspot follows the cursor into the gutters —
    // full-bleed lines glow at the corners, and node distances stay honest
    // instead of clamping to the column edge (which held diamonds at full
    // strength across the gutter, then snapped them off at the gate).
    const nextX = relX;
    const nextY = isHorizontal ? clamp(relY, 0, rect.height) : relY;

    // Hotspot position only matters while something is visible.
    if (inside) {
      write(shell, cache, "x", "--edge-glow-x", `${nextX}px`);
      write(shell, cache, "y", "--edge-glow-y", `${nextY}px`);
    }

    // Wash strength is graded by distance to the geometry that actually
    // glows — nearest side border for vertical shells, the band itself for
    // horizontal ones.
    let washStrength = 0;
    if (inside) {
      if (isVertical) {
        const distToBorder = Math.min(
          Math.abs(pointerX - rect.left),
          Math.abs(pointerX - rect.right),
        );
        washStrength = smoothFalloff(distToBorder, GLOW_RADIUS);
      } else if (isHorizontal) {
        const distToBand =
          relY < 0 ? -relY : relY > rect.height ? relY - rect.height : 0;
        washStrength = smoothFalloff(distToBand, GLOW_RADIUS);
      } else {
        washStrength = 1;
      }
    }
    write(shell, cache, "wash", "--edge-glow-opacity", washStrength.toFixed(3));

    for (let i = 0; i < nodes.length; i += 1) {
      const node = nodes[i];
      const nodeRect = node.getBoundingClientRect();
      const nodeX = nodeRect.left - rect.left + nodeRect.width / 2;
      const nodeY = nodeRect.top - rect.top + nodeRect.height / 2;
      const strength = inside
        ? falloff(Math.hypot(nextX - nodeX, nextY - nodeY), GLOW_RADIUS)
        : 0;
      write(
        node,
        cache,
        `n${i}`,
        "--edge-node-strength",
        strength.toFixed(3),
      );
    }

    // Glow lines: strength from vertical distance to each line, using the
    // unclamped cursor Y (clamped nextY would report full strength from the
    // whole gate away).
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      const lineRect = line.getBoundingClientRect();
      const lineY = lineRect.top - rect.top + lineRect.height / 2;
      let strength = 0;
      if (inside) {
        const dist = Math.abs(relY - lineY);
        const lamp = falloff(dist, GLOW_RADIUS);
        const local = clamp(1 - dist / LINE_EMPHASIS_RADIUS, 0, 1);
        // Shared lamp sets the reach; the squared local term doubles the
        // line the cursor is actually on relative to its neighbor.
        strength = lamp * (0.5 + 0.5 * local * local);
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
