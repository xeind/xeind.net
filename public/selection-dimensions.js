(() => {
  // Selected text gets a ruled outline with its width and height set on
  // dimension lines, the way a redline in a design tool measures a layer.
  // After imdaryl.com. The ::selection tint in global.css stays the per-line
  // highlight; this draws one box around the whole selection on a fixed SVG
  // overlay, so it touches no layout and costs nothing while nothing is
  // selected. SVG, not a canvas: vectors stay sharp under pinch-zoom and on
  // any screen density, and the numbers are real text.
  //
  // Fine pointers only: touch selection brings its own handles and magnifier,
  // and a box under them is noise.
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    return;
  }

  const SVG = "http://www.w3.org/2000/svg";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  // DURATION.fast and DURATION.normal in src/lib/config/animation.ts. A script
  // in public/ cannot import it — change one, change both.
  const FADE_IN_MS = 150;
  const FADE_OUT_MS = 200;
  // A reshaped selection moves the box the way the theme picker's name rolls
  // over: `.theme-roll` in global.css, 0.3s (DURATION.slow) on
  // EASING.easeOutExpo, the curve that comment calls "a spring with no
  // bounce". easeOutExpo is 1 - 2^(-10t), an exponential approach, so each
  // edge closes the same share of its gap per millisecond: 0.3s / (10 ln 2),
  // about 43ms per e-fold, lands within 0.1% at 300ms. It keeps no start
  // point, only where an edge is and where it is going, so a new target
  // mid-flight carries on from the in-between box. The critically damped
  // spring was rejected there for starting at rest and hanging; this starts
  // at full speed, as that curve does.
  const SETTLE_TAU_MS = 300 / (10 * Math.LN2);
  // Inside half a pixel the rounded box no longer changes; snap and stop.
  const SETTLE_EPSILON = 0.5;
  // A box this wide carries a width rule, and this tall a height rule; with
  // neither, one centred label. A shown rule hides only 4px under its
  // threshold, so a box resting on the line, or a drag wobbling across it,
  // does not flicker the rule on and off.
  const SMALL_WIDTH = 44;
  const SMALL_HEIGHT = 28;
  const RULE_HYSTERESIS = 4;
  // Within 1% of shown or hidden, a rule's ends sit within a pixel of their
  // place on any rule under 100px a side; snap and stop.
  const VISIBLE_EPSILON = 0.01;
  // The outline's share of its ink while it travels: still there to follow,
  // quiet enough that an edge crossing words does not strike them through.
  const MOVING_INK = 0.4;
  // Whether a line arriving or leaving changes one axis at a time (see
  // aim()), and how far along the first axis it gets before the second
  // starts.
  const STAGED_GROWTH = true;
  const STAGE_SHARE = 0.6;

  let svg = null;
  let parts = null;
  let record = null;
  let stroke = null;
  let frame = 0;

  // Value noise: a hash per 7px step, smoothstepped between neighbours, so a
  // line bends gently instead of jittering pixel to pixel.
  const hash = (n) => {
    const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
    return s - Math.floor(s);
  };
  const noise = (distance, seed) => {
    const t = distance / 7;
    const i = Math.floor(t);
    const f = t - i;
    const a = hash(i + seed) - 0.5;
    const b = hash(i + 1 + seed) - 0.5;
    return (a + (b - a) * f * f * (3 - 2 * f)) * 2;
  };

  // Two decimals is a hundredth of a pixel, past what any screen resolves.
  const round = (value) => Math.round(value * 100) / 100;

  // Path data for one line. With no wobble it is one straight segment. With
  // wobble it walks the line every 4px from its start, each point pushed along
  // the normal by the noise. The noise is read by distance along the line
  // under a fixed seed per line, so a line that moves or stretches keeps its
  // bends where they were instead of re-rolling them every frame. Seeds sit
  // 1000 cells (7000px) apart, so no two lines share a stretch.
  //
  // A pinned end takes no wobble: the noise fades in over its first 4px, so
  // two edges meeting at a pinned corner meet on the point itself.
  function lineData(x0, y0, x1, y1, seed, amplitude, pinStart = false, pinEnd = false) {
    const length = Math.hypot(x1 - x0, y1 - y0);
    if (length < 1) {
      return "";
    }
    if (amplitude === 0) {
      return `M${round(x0)} ${round(y0)}L${round(x1)} ${round(y1)}`;
    }
    const nx = -(y1 - y0) / length;
    const ny = (x1 - x0) / length;
    let data = "";
    for (let d = 0; ; d = Math.min(d + 4, length)) {
      const t = d / length;
      const pin =
        (pinStart ? Math.min(1, d / 4) : 1) * (pinEnd ? Math.min(1, (length - d) / 4) : 1);
      const offset = noise(d, seed * 1000) * amplitude * pin;
      const x = x0 + (x1 - x0) * t + nx * offset;
      const y = y0 + (y1 - y0) * t + ny * offset;
      data += `${d === 0 ? "M" : "L"}${round(x)} ${round(y)}`;
      if (d === length) {
        return data;
      }
    }
  }

  // The outline: the contour of the selected line bands as one closed
  // orthogonal polygon, walked clockwise. Along the top of the first band,
  // down the right side stepping between successive bands' right edges,
  // along the bottom of the last band, and up the left side stepping between
  // their left edges. One band is a rectangle; a selection from mid-line 1
  // to mid-line 3 is the familiar eight-cornered step.
  //
  // Every line sits half a pixel inside its band, so a 1px stroke fills one
  // device row: verticals at L + 0.5 and R - 0.5, the top at T + 0.5, the
  // bottom at B - 0.5. A step is a bottom edge when the band below is
  // narrower on that side and a top edge when it is wider, so it takes
  // -0.5 or +0.5 to match.
  //
  // Each edge carries a seed from its band's id and its role in that band,
  // so the wobble an edge has survives bands being added above or below it.
  // The pass offsets the seeds, or the second pass would trace the first
  // exactly and the doubled line would read as one.
  const EDGE_ROLES = 12;
  function outline(bands, pass) {
    const sx = window.scrollX;
    const sy = window.scrollY;
    const n = bands.length;
    const L = bands.map((band) => Math.round(band.shown.left - sx) + 0.5);
    const R = bands.map((band) => Math.round(band.shown.right - sx) - 0.5);
    const seed = (i, role) => 100 + bands[i].id * EDGE_ROLES + pass * 6 + role;
    const boundary = (i) => Math.round((bands[i].shown.bottom + bands[i + 1].shown.top) / 2 - sy);
    const top = Math.round(bands[0].shown.top - sy) + 0.5;
    const bottom = Math.round(bands[n - 1].shown.bottom - sy) - 0.5;
    // Each point carries the seed of the edge that leaves it.
    const points = [
      [L[0], top, seed(0, 0)],
      [R[0], top, seed(0, 1)],
    ];
    for (let i = 0; i < n - 1; i += 1) {
      const y = boundary(i) + (R[i + 1] < R[i] ? -0.5 : 0.5);
      points.push([R[i], y, seed(i, 2)], [R[i + 1], y, seed(i + 1, 1)]);
    }
    points.push([R[n - 1], bottom, seed(n - 1, 3)], [L[n - 1], bottom, seed(n - 1, 4)]);
    for (let i = n - 2; i >= 0; i -= 1) {
      const y = boundary(i) + (L[i + 1] > L[i] ? -0.5 : 0.5);
      points.push([L[i + 1], y, seed(i + 1, 5)], [L[i], y, seed(i, 4)]);
    }
    return points;
  }

  // The outline's path. With no overshoot it is one closed path, so its
  // corners join square. With overshoot each edge is its own line, running
  // past its outer corners like a figure ruled by hand. An edge under a
  // pixel is a band still forming or leaving; it is skipped before the
  // overshoot, which would otherwise turn it into a 3px dash.
  function outlineData(points, dx, dy) {
    const { wobble, overshoot: o } = stroke;
    if (o === 0) {
      let data = "";
      let last = null;
      for (const [x, y] of points) {
        if (!last || x !== last[0] || y !== last[1]) {
          data += `${data ? "L" : "M"}${x + dx} ${y + dy}`;
          last = [x, y];
        }
      }
      return `${data}Z`;
    }
    // At an inner corner the overshoot poked 1.5px into the shape, over the
    // text; there the two edges meet exactly, their wobble pinned so they
    // meet on the corner. A corner is outer where the clockwise walk turns
    // right, judged between the edges either side of it once the ones under
    // a pixel are set aside.
    const edges = [];
    for (let k = 0; k < points.length; k += 1) {
      const [x0, y0, seed] = points[k];
      const [x1, y1] = points[(k + 1) % points.length];
      const length = Math.hypot(x1 - x0, y1 - y0);
      if (length >= 1) {
        edges.push({ x0, y0, x1, y1, seed, ux: (x1 - x0) / length, uy: (y1 - y0) / length });
      }
    }
    const outer = (a, b) => a.ux * b.uy - a.uy * b.ux > 0.5;
    let data = "";
    edges.forEach((edge, m) => {
      const before = outer(edges[(m - 1 + edges.length) % edges.length], edge);
      const after = outer(edge, edges[(m + 1) % edges.length]);
      const start = before ? o : 0;
      const end = after ? o : 0;
      data += lineData(
        edge.x0 - edge.ux * start + dx,
        edge.y0 - edge.uy * start + dy,
        edge.x1 + edge.ux * end + dx,
        edge.y1 + edge.uy * end + dy,
        edge.seed,
        wobble,
        !before,
        !after,
      );
    });
    return data;
  }

  // The outline's outer corners, where the clockwise walk turns right, each
  // with the length of its shorter arm. Repeated and collinear points are
  // dropped first, so a band still forming adds no corner until its step is
  // real.
  function outerCorners(points) {
    const ring = [];
    for (const point of points) {
      const last = ring[ring.length - 1];
      if (!last || Math.hypot(point[0] - last[0], point[1] - last[1]) >= 1) {
        ring.push(point);
      }
    }
    while (
      ring.length > 1 &&
      Math.hypot(ring[0][0] - ring[ring.length - 1][0], ring[0][1] - ring[ring.length - 1][1]) < 1
    ) {
      ring.pop();
    }
    const corners = [];
    for (let k = 0; k < ring.length; k += 1) {
      const [px, py] = ring[(k - 1 + ring.length) % ring.length];
      const [x, y] = ring[k];
      const [nx, ny] = ring[(k + 1) % ring.length];
      const cross = (x - px) * (ny - y) - (y - py) * (nx - x);
      if (cross > 0) {
        corners.push([x, y, Math.min(Math.hypot(x - px, y - py), Math.hypot(nx - x, ny - y))]);
      }
    }
    return corners;
  }

  // The selection's visual lines, from the rects of the text it covers, one
  // rect per line, top to bottom. A range's own getClientRects() includes
  // whole elements it merely touches; walking the text nodes keeps the
  // outline on the ink. Rects share a line when they overlap vertically by
  // more than half the shorter one, not when their tops and bottoms match:
  // an inline <code> has a taller box than the words beside it, and exact
  // matching split its line in two and stepped the outline around it.
  function selectionLines() {
    const selection = document.getSelection();
    if (!selection || selection.isCollapsed || !selection.rangeCount) {
      return null;
    }
    const range = selection.getRangeAt(0);
    const rects = [];
    const take = (list) => {
      for (const r of list) {
        if (r.width && r.height) {
          rects.push(r);
        }
      }
    };
    const root = range.commonAncestorContainer;
    if (root.nodeType === Node.TEXT_NODE) {
      take(range.getClientRects());
    } else {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const part = document.createRange();
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (!range.intersectsNode(node)) {
          continue;
        }
        part.selectNodeContents(node);
        if (node === range.startContainer) {
          part.setStart(node, range.startOffset);
        }
        if (node === range.endContainer) {
          part.setEnd(node, range.endOffset);
        }
        take(part.getClientRects());
      }
    }
    rects.sort((a, b) => a.top - b.top);
    const lines = [];
    for (const r of rects) {
      const line = lines.find(
        (l) =>
          Math.min(l.bottom, r.bottom) - Math.max(l.top, r.top) >
          Math.min(l.bottom - l.top, r.height) / 2,
      );
      if (line) {
        line.left = Math.min(line.left, r.left);
        line.top = Math.min(line.top, r.top);
        line.right = Math.max(line.right, r.right);
        line.bottom = Math.max(line.bottom, r.bottom);
      } else {
        lines.push({ left: r.left, top: r.top, right: r.right, bottom: r.bottom });
      }
    }
    lines.sort((a, b) => a.top - b.top);
    return lines.length ? lines : null;
  }

  // The accent, read from the theme so no theme's value is written twice. The
  // footer is filled with the accent, so there the ink is the colour of the
  // selected text, which is readable on it by construction. Taken from the
  // first selected text node, not the anchor: a triple-click or select-all
  // anchors on an element, and <footer>'s own colour is overridden by its
  // children — it matched the fill and the box vanished.
  function selectedElement(selection) {
    const range = selection.getRangeAt(0);
    let text = range.startContainer;
    if (text.nodeType !== Node.TEXT_NODE) {
      const walker = document.createTreeWalker(range.commonAncestorContainer, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (range.intersectsNode(node) && node.textContent.trim()) {
          text = node;
          break;
        }
      }
    }
    return text.nodeType === Node.TEXT_NODE ? text.parentElement : text;
  }

  function inkFor(element) {
    if (element?.closest("footer")) {
      return getComputedStyle(element).color;
    }
    return getComputedStyle(document.documentElement).getPropertyValue("--color-accent").trim();
  }

  // The surface the selected text sits on: the first background up its
  // ancestors that is not transparent. The labels take it as a halo, so a
  // number that lands on words stays readable. Read from the page, not from
  // one token: Kozo's sheet (--color-card) and page (--color-background)
  // differ, so either token alone is wrong on the other, and the footer is
  // filled with the accent.
  function surfaceFor(element) {
    // The footer's fill is not a background colour on any ancestor, so the
    // walk below fell through to the page's and haloed footer numbers in
    // the ink's own colour. Its fill is the accent; say so.
    if (element?.closest("footer")) {
      return getComputedStyle(document.documentElement).getPropertyValue("--color-accent").trim();
    }
    const clear = (colour) =>
      colour === "transparent" || /,\s*0\)$/.test(colour) || /\/\s*0\)$/.test(colour);
    for (let node = element; node; node = node.parentElement) {
      const colour = getComputedStyle(node).backgroundColor;
      if (colour && !clear(colour)) {
        return colour;
      }
    }
    return getComputedStyle(document.documentElement).getPropertyValue("--color-background").trim();
  }

  // Whether a viewport box overlaps one of the footer's controls. The footer
  // sets its buttons beside its text, so a height label to the right of a
  // footer selection can land on one, in ink that matches the button's fill.
  function overlapsControl(left, top, right, bottom) {
    for (const control of document.querySelectorAll("footer a, footer button")) {
      const r = control.getBoundingClientRect();
      if (r.width && r.left < right && r.right > left && r.top < bottom && r.bottom > top) {
        return true;
      }
    }
    return false;
  }

  // The theme's stroke, from --selection-stroke-* in global.css. Each theme
  // sets all five; the fallbacks are the clean style, the one that needs no
  // tuning to look right.
  function readStroke() {
    const style = getComputedStyle(document.documentElement);
    const number = (property, fallback) => {
      const value = Number.parseFloat(style.getPropertyValue(property));
      return Number.isFinite(value) ? value : fallback;
    };
    return {
      wobble: number("--selection-stroke-wobble", 0),
      passes: number("--selection-stroke-passes", 1),
      opacity: number("--selection-stroke-opacity", 1),
      overshoot: number("--selection-stroke-overshoot", 0),
      weight: number("--selection-stroke-weight", 1),
    };
  }

  // Attribute writes only when the value changes, so a box at rest under a
  // scroll costs a comparison per attribute and no style invalidation.
  function set(element, name, value) {
    if (element.getAttribute(name) !== value) {
      element.setAttribute(name, value);
    }
  }

  function setText(element, value) {
    if (element.textContent !== value) {
      element.textContent = value;
    }
  }

  function create(name, attributes, parent) {
    const element = document.createElementNS(SVG, name);
    for (const [key, value] of Object.entries(attributes)) {
      element.setAttribute(key, value);
    }
    parent?.append(element);
    return element;
  }

  // Clean lines take crispEdges so a 1px stroke on a half pixel fills exactly
  // one row of device pixels at any density. Drawn lines take
  // geometricPrecision: a wobble snapped to the pixel grid turns into stairs.
  function applyStroke() {
    const clean = stroke.wobble === 0;
    svg.style.color = record.ink;
    set(parts.text, "stroke", record.surface);
    set(parts.lines, "shape-rendering", clean ? "crispEdges" : "geometricPrecision");
    set(parts.box, "stroke-width", String(stroke.weight));
    set(parts.ghost, "display", stroke.passes > 1 ? "inline" : "none");
    // A 0.8px rule antialiases to a soft grey row; clean mode rules a full one.
    set(parts.marks, "stroke-width", clean ? "1" : "0.8");
  }

  // The selection's line bands in page coordinates, each but the last
  // extended down to the next line's top, so the leading between lines is
  // inside the outline and it is one shape rather than stacked boxes. That
  // bridges a paragraph margin too, which is the union the outline means. A
  // scroll moves the text and the outline together, so it must not read as a
  // reshape and trail behind.
  function selectionBands() {
    const lines = selectionLines();
    if (!lines) {
      return null;
    }
    const sx = window.scrollX;
    const sy = window.scrollY;
    return lines.map((line, i) => ({
      left: line.left + sx,
      top: line.top + sy,
      right: line.right + sx,
      bottom: (i + 1 < lines.length ? lines[i + 1].top : line.bottom) + sy,
    }));
  }

  let nextBandId = 0;
  const band = (shown, target) => ({
    id: nextBandId++,
    shown,
    target,
    side: null,
    from: null,
    span: 0,
  });
  const atTop = (t) => ({ left: t.left, right: t.right, top: t.top, bottom: t.top });
  const atBottom = (t) => ({ left: t.left, right: t.right, top: t.bottom, bottom: t.bottom });

  // Aim the outline at a new set of line bands. The outline is eased band by
  // band, four edges each, the way the box's four edges were; the polygon is
  // derived from the bands every frame. When the line count changes, the
  // band list holds the larger count for the length of the move and the
  // spare bands are collapsed onto a neighbour, which is collapsing the
  // polygon's spare vertices onto theirs: a band arriving is born with no
  // height on the edge it grows from, and one leaving is aimed at no height
  // on its neighbour's edge and dropped once everything settles. So a
  // one-line rectangle grows its step instead of popping one in.
  //
  // Old and new bands are paired by position, not by index: the pairing is
  // the offset that best lines up their tops, so a selection growing upward
  // grows a band above instead of sliding every line up one. Bands with no
  // partner collapse onto the first band's top or the last band's bottom,
  // whichever side they are on.
  function retarget(targets) {
    if (!targets) {
      return;
    }
    record.tick ??= performance.now();
    const live = record.bands.filter((b) => b.side === null);
    if (!live.length) {
      record.bands = targets.map((target) => band({ ...target }, target));
      return;
    }
    // An unpaired band costs about one line of mismatch.
    const UNPAIRED = 24;
    let offset = 0;
    let best = Infinity;
    for (let k = 1 - live.length; k < targets.length; k += 1) {
      let cost = 0;
      let pairs = 0;
      live.forEach((b, i) => {
        const j = i + k;
        if (j >= 0 && j < targets.length) {
          cost += Math.abs(b.target.top - targets[j].top);
          pairs += 1;
        }
      });
      cost += (live.length + targets.length - 2 * pairs) * UNPAIRED;
      if (cost < best) {
        best = cost;
        offset = k;
      }
    }
    const first = targets[0];
    const last = targets[targets.length - 1];
    const paired = live.filter((b, i) => i + offset >= 0 && i + offset < targets.length);
    const above = [];
    const below = [];
    for (const b of record.bands) {
      const i = live.indexOf(b);
      const leaving = b.side !== null || i + offset < 0 || i + offset >= targets.length;
      if (!leaving) {
        continue;
      }
      const fresh = b.side === null;
      if (b.side === "top" || (b.side === null && i + offset < 0)) {
        b.side = "top";
        b.target = atTop(first);
        above.push(b);
      } else {
        b.side = "bottom";
        b.target = atBottom(last);
        below.push(b);
      }
      if (fresh) {
        b.span = Math.max(
          Math.abs(b.shown.left - b.target.left),
          Math.abs(b.shown.right - b.target.right),
        );
      }
    }
    const bands = targets.map((target, j) => {
      const b = live[j - offset];
      if (b) {
        b.target = target;
        return b;
      }
      const from = j - offset < 0 ? paired[0] : paired[paired.length - 1];
      const born = band(j - offset < 0 ? atTop(from.shown) : atBottom(from.shown), target);
      born.from = from;
      return born;
    });
    record.bands = [...above, ...bands, ...below];
  }

  // Which rules a box of this drawn size carries, given the last answer.
  // Each rule shows at its threshold and hides RULE_HYSTERESIS under it.
  function rulesFor(w, h, was) {
    return {
      width: w >= (was?.width ? SMALL_WIDTH - RULE_HYSTERESIS : SMALL_WIDTH),
      height: h >= (was?.height ? SMALL_HEIGHT - RULE_HYSTERESIS : SMALL_HEIGHT),
    };
  }

  // Ease one visibility toward 0 or 1 on the edges' curve. Returns whether it
  // is still travelling.
  function ease(key, goal, share, still) {
    const { visible } = record;
    const gap = goal - visible[key];
    if (still || Math.abs(gap) < VISIBLE_EPSILON) {
      visible[key] = goal;
      return false;
    }
    visible[key] += gap * share;
    return true;
  }

  // Close each band's edges on their targets. Returns whether any is still
  // travelling; once none is, the bands that were leaving are dropped.
  // Where a band is headed this frame. With STAGED_GROWTH a band changes
  // along one axis at a time, so a forming step does not stub a line out
  // past its band. A band arriving keeps the extent of the band it grows
  // from until its height passes STAGE_SHARE of its target, then widens or
  // narrows to its own. A band leaving does the reverse: it narrows to its
  // neighbour's extent first, holding its outer edge (the one it shares
  // with no band), and only collapses once STAGE_SHARE of that narrowing is
  // done. Read from the band's state each frame, not from a clock, so a
  // retarget mid-stage simply aims the stage at the new target.
  function aim(b) {
    if (!STAGED_GROWTH) {
      return b.target;
    }
    if (b.from) {
      const height = b.target.bottom - b.target.top;
      const grown = b.shown.bottom - b.shown.top >= STAGE_SHARE * height;
      if (grown || !record.bands.includes(b.from)) {
        b.from = null;
        return b.target;
      }
      return { ...b.target, left: b.from.shown.left, right: b.from.shown.right };
    }
    if (b.side !== null && b.span >= 1) {
      const left = Math.abs(b.shown.left - b.target.left);
      const right = Math.abs(b.shown.right - b.target.right);
      if (Math.max(left, right) > (1 - STAGE_SHARE) * b.span) {
        return b.side === "top"
          ? { ...b.target, top: b.shown.top }
          : { ...b.target, bottom: b.shown.bottom };
      }
    }
    return b.target;
  }

  function settle(share, still) {
    let moving = false;
    record.fastest = 0;
    for (const b of record.bands) {
      const { shown } = b;
      const target = still ? b.target : aim(b);
      // A band mid-stage is not done even if this stage's edges are home.
      if (target !== b.target) {
        moving = true;
      }
      for (const edge of ["left", "top", "right", "bottom"]) {
        const gap = target[edge] - shown[edge];
        if (still || Math.abs(gap) < SETTLE_EPSILON) {
          shown[edge] = target[edge];
        } else {
          shown[edge] += gap * share;
          record.fastest = Math.max(record.fastest, Math.abs(gap * share));
          moving = true;
        }
      }
    }
    if (!moving) {
      record.bands = record.bands.filter((b) => b.side === null);
    }
    return moving;
  }

  function draw(now) {
    const still = reduceMotion.matches;
    const share = 1 - Math.exp(-(now - (record.tick ?? now)) / SETTLE_TAU_MS);
    let moving = settle(share, still);
    // A band growing in height sweeps its edge across a line of glyphs, and
    // nothing short of popping the step in avoids that. So the outline
    // quietens while it travels: past 1px a frame its stroke eases toward
    // MOVING_INK of the theme's, and back to full as the shape settles, on
    // the same curve as the edges, so it rides the motion instead of
    // flickering. The rules and labels keep their own opacity. Under reduced
    // motion nothing travels, so nothing dims.
    const inkGoal = record.fastest > 1 ? MOVING_INK : 1;
    if (still || Math.abs(inkGoal - record.inkShare) < VISIBLE_EPSILON) {
      record.inkShare = still ? 1 : inkGoal;
    } else {
      record.inkShare += (inkGoal - record.inkShare) * share;
      moving = true;
    }

    const fadeIn = still ? 1 : Math.min(1, (now - record.start) / FADE_IN_MS);
    const fadeOut = record.gone === null ? 1 : still ? 0 : 1 - (now - record.gone) / FADE_OUT_MS;
    if (fadeOut <= 0) {
      return { keep: false, busy: false };
    }
    set(svg, "display", "inline");
    set(svg, "opacity", String(round(fadeIn * Math.max(0, fadeOut))));

    // The outline, then in Blueprint a fainter second pass half a pixel off:
    // the doubled stroke is what reads as pencil rather than as a CSS border.
    const { bands } = record;
    const points = outline(bands, 0);
    set(parts.box, "d", outlineData(points, 0, 0));
    set(parts.box, "opacity", String(round(stroke.opacity * record.inkShare)));
    if (stroke.passes > 1) {
      set(parts.ghost, "d", outlineData(outline(bands, 1), 0.5, -0.3));
      set(parts.ghost, "opacity", String(round(0.25 * record.inkShare)));
    }

    // The rules measure the bounding box of the shown bands, so W and H mean
    // what they meant for one rectangle. Snapped to the half pixel, so a 1px
    // line lands on one device row at 1x.
    const left = Math.round(Math.min(...bands.map((b) => b.shown.left)) - window.scrollX);
    const right = Math.round(Math.max(...bands.map((b) => b.shown.right)) - window.scrollX);
    const top = Math.round(Math.min(...bands.map((b) => b.shown.top)) - window.scrollY);
    const bottom = Math.round(Math.max(...bands.map((b) => b.shown.bottom)) - window.scrollY);
    const x = left + 0.5;
    const y = top + 0.5;
    const w = right - left - 1;
    const h = bottom - top - 1;

    // Each axis carries its own rule once the box is big enough along it, so
    // a one-line selection already has a width rule. Decided from the box as
    // drawn this frame; each rule and the compact label then eases its own
    // visibility on the edges' curve.
    record.rules = rulesFor(w, h, record.rules);
    const { rules, visible } = record;
    const compactGoal = rules.width || rules.height ? 0 : 1;
    moving = ease("width", rules.width ? 1 : 0, share, still) || moving;
    moving = ease("height", rules.height ? 1 : 0, share, still) || moving;
    moving = ease("compact", compactGoal, share, still) || moving;
    const { width: wv, height: hv, compact: cv } = visible;

    // The numbers measure the box as drawn, so they count while it moves.
    const width = String(right - left);
    const height = String(bottom - top);
    const midX = Math.round(x + w / 2);
    const midY = Math.round(y + h / 2);
    setText(parts.compact, `${width} \u00d7 ${height}`);
    // Mono glyphs share one advance; measure it once the box is on screen.
    record.advance ||= parts.compact.getComputedTextLength() / parts.compact.textContent.length;
    const advance = record.advance;

    // With no rule, one centred label below the box (above, near the bottom
    // edge).
    set(parts.compact, "opacity", String(round(cv)));
    if (cv > 0) {
      const below = y + h + 16 < window.innerHeight;
      set(parts.compact, "x", String(midX));
      set(parts.compact, "y", String(Math.round(below ? y + h + 12 : y - 12)));
    }

    // Corner squares while either rule shows, on the outline's outer corners.
    // Not the bounding box's: on a stepped outline two of those float in
    // empty space off the line, which reads as a mistake. A square grows with
    // the shorter arm of its corner up to 8px, so one does not pop in as a
    // step starts to form. A clean square is 4px about the corner, so its
    // sides land on half pixels like the outline's; a drawn one keeps 3.5.
    const wobble = stroke.wobble;
    const squares = Math.max(wv, hv);
    set(parts.corners, "opacity", String(round(squares)));
    if (squares > 0) {
      const full = wobble === 0 ? 4 : 3.5;
      let corners = "";
      for (const [cx, cy, arm] of outerCorners(points)) {
        const side = arm >= 8 ? full : round((full * arm) / 8);
        corners += `M${cx - side / 2} ${cy - side / 2}h${side}v${side}h${-side}Z`;
      }
      set(parts.corners, "d", corners);
    }

    // The rules: width below the box (above, near the bottom edge), height to
    // its right (left, near the right edge), each broken in the middle for its
    // number. A rule draws in from the number outwards, its two segments and
    // their end ticks travelling with its visibility, the ticks growing with
    // it so none is left standing by the number, and its number fades with
    // it. Segments run from the number out, so the wobble a segment has
    // stays put while it grows. In clean mode a moving tick is snapped to the
    // half pixel, so it stays one device row.
    //
    // A rule's own number counts with it, round(v × the box's side), so a rule
    // forming on a live box reads as the measurement being taken: up from 0
    // as it draws in, down as it draws out, then tracking the side. A new box
    // starts with its rules at 1, so it shows the full numbers at once, and
    // reduced motion snaps visibility, so there is no count.
    //
    // The number without a rule of its own rides on the other: "520 × 16" on
    // the width rule of a one-line box. Its share of the label is the other
    // rule's absence, so the label narrows smoothly as that rule draws in.
    // The marks wobble less than the box: ticks two thirds of it, rules eight
    // ninths, which in Blueprint are the 0.3 and 0.4 they were tuned at.
    const tick = (wobble * 2) / 3;
    const rule = (wobble * 8) / 9;
    const snap = (value) => (wobble === 0 ? Math.round(value - 0.5) + 0.5 : value);
    let marks = "";

    // No-break spaces: SVG text drops a leading or trailing plain space, which
    // ran the number into the sign ("300× 19"). Written as escapes:
    // ESLint's no-irregular-whitespace rejects the literal character.
    const widthTail = `\u00a0\u00d7\u00a0${height}`;
    const widthShare = 1 - hv;
    set(parts.widthText, "opacity", String(round(wv)));
    set(parts.widthExtra, "opacity", String(round(wv * widthShare)));
    if (wv > 0) {
      const rowY = y + h + 18 < window.innerHeight ? y + h + 11 : y - 11;
      const count = String(Math.round(wv * (right - left)));
      const span = advance * (count.length + widthShare * widthTail.length);
      const gap = Math.round(span / 2 + 5);
      const start = Math.round(midX - span / 2);
      const leftEnd = snap(midX - gap - wv * Math.max(0, midX - gap - x));
      const rightEnd = snap(midX + gap + wv * Math.max(0, x + w - midX - gap));
      marks +=
        lineData(midX - gap, rowY, leftEnd, rowY, 10, rule) +
        lineData(midX + gap, rowY, rightEnd, rowY, 11, rule) +
        lineData(leftEnd, rowY - 3.5 * wv, leftEnd, rowY + 3.5 * wv, 8, tick) +
        lineData(rightEnd, rowY - 3.5 * wv, rightEnd, rowY + 3.5 * wv, 9, tick);
      setText(parts.widthText, count);
      setText(parts.widthExtra, widthShare > 0 ? widthTail : "");
      set(parts.widthText, "x", String(start));
      set(parts.widthText, "y", String(rowY));
      set(parts.widthExtra, "x", String(round(start + advance * count.length)));
      set(parts.widthExtra, "y", String(rowY));
    }

    // The height label is rotated a quarter turn about its centre, so its
    // run along x before the turn is its run up the rule after it.
    const heightHead = `${width}\u00a0\u00d7\u00a0`;
    const heightShare = 1 - wv;
    set(parts.heightText, "opacity", String(round(hv)));
    set(parts.heightExtra, "opacity", String(round(hv * heightShare)));
    if (hv > 0) {
      const count = String(Math.round(hv * (bottom - top)));
      const span = advance * (count.length + heightShare * heightHead.length);
      let colX = x + w + 18 < window.innerWidth ? x + w + 11 : x - 11;
      // In the footer, a label over a control moves to the box's other side.
      // Its box is the rotated label: 12px across, its length plus 4px tall.
      const reach = span / 2 + 2;
      if (record.footer && overlapsControl(colX - 6, midY - reach, colX + 6, midY + reach)) {
        colX = colX > x + w ? x - 11 : x + w + 11;
      }
      const gap = Math.round(span / 2 + 5);
      const topEnd = snap(midY - gap - hv * Math.max(0, midY - gap - y));
      const bottomEnd = snap(midY + gap + hv * Math.max(0, y + h - midY - gap));
      marks +=
        lineData(colX, midY - gap, colX, topEnd, 14, rule) +
        lineData(colX, midY + gap, colX, bottomEnd, 15, rule) +
        lineData(colX - 3.5 * hv, topEnd, colX + 3.5 * hv, topEnd, 12, tick) +
        lineData(colX - 3.5 * hv, bottomEnd, colX + 3.5 * hv, bottomEnd, 13, tick);
      const start = round(colX - span / 2 + advance * heightShare * heightHead.length);
      const turn = `rotate(-90 ${colX} ${midY})`;
      setText(parts.heightText, count);
      setText(parts.heightExtra, heightShare > 0 ? heightHead : "");
      for (const label of [parts.heightText, parts.heightExtra]) {
        set(label, "x", String(start));
        set(label, "y", String(midY));
        set(label, "transform", turn);
      }
    }
    set(parts.marks, "d", marks);

    return { keep: true, busy: moving || fadeIn < 1 || record.gone !== null };
  }

  // One frame per event. The loop only keeps itself alive while a fade or a
  // reshape runs; at rest it stops, and the next selectionchange or scroll
  // draws again.
  function paint() {
    frame = 0;
    if (!svg) {
      return;
    }
    if (!record) {
      set(svg, "display", "none");
      return;
    }
    const now = performance.now();
    const result = draw(now);
    if (!result.keep) {
      record = null;
      set(svg, "display", "none");
      return;
    }
    // At rest the clock stops too: the next reshape starts timing from its
    // own event, not from the last frame seconds ago, which would jump it.
    record.tick = result.busy ? now : null;
    if (result.busy) {
      frame = window.requestAnimationFrame(paint);
    }
  }

  function schedule() {
    if (!frame) {
      frame = window.requestAnimationFrame(paint);
    }
  }

  // A reflow moves the text under a live box; a box fading out keeps its last
  // place.
  function onResize() {
    if (record && record.gone === null) {
      retarget(selectionBands());
    }
    schedule();
  }

  function onSelectionChange() {
    if (!svg) {
      return;
    }
    const selection = document.getSelection();
    const targets = selection && !selection.isCollapsed ? selectionBands() : null;
    if (targets && (!record || record.gone !== null)) {
      // A new outline starts at its full shape, with its rules already drawn,
      // and only fades in.
      const element = selectedElement(selection);
      const rules = rulesFor(
        Math.round(Math.max(...targets.map((t) => t.right))) -
          Math.round(Math.min(...targets.map((t) => t.left))) -
          1,
        Math.round(targets[targets.length - 1].bottom) - Math.round(targets[0].top) - 1,
        null,
      );
      record = {
        start: performance.now(),
        gone: null,
        bands: targets.map((target) => band({ ...target }, target)),
        tick: null,
        rules,
        visible: {
          width: rules.width ? 1 : 0,
          height: rules.height ? 1 : 0,
          compact: rules.width || rules.height ? 0 : 1,
        },
        advance: 0,
        fastest: 0,
        inkShare: 1,
        ink: inkFor(element),
        surface: surfaceFor(element),
        footer: Boolean(element?.closest("footer")),
      };
      stroke = readStroke();
      applyStroke();
    } else if (targets) {
      retarget(targets);
    } else if (record && record.gone === null) {
      record.gone = performance.now();
    }
    schedule();
  }

  // A theme pick swaps the stroke, the ink and the halo under a live box.
  function onThemeChange() {
    if (!record) {
      return;
    }
    const selection = document.getSelection();
    if (record.gone === null && selection?.rangeCount) {
      const element = selectedElement(selection);
      record.ink = inkFor(element);
      record.surface = surfaceFor(element);
    }
    stroke = readStroke();
    applyStroke();
    schedule();
  }

  // The overlay's parts, built once and only re-attributed per frame. Font
  // and colour come from tokens: the ink is the svg's `color`, and every
  // stroke and fill is currentColor.
  function build() {
    svg = create("svg", { class: "selection-dimensions", "aria-hidden": "true", display: "none" });
    svg.style.font = "10px var(--font-mono, monospace)";
    // Tabular figures, so a counting number keeps its width digit to digit.
    svg.style.fontVariantNumeric = "tabular-nums";
    const lines = create("g", { fill: "none", stroke: "currentColor" }, svg);
    const scaled = { "vector-effect": "non-scaling-stroke" };
    // In paint order: the box, its second pass, then the marks over them.
    const box = create("path", { ...scaled, "stroke-width": "1" }, lines);
    const ghost = create("path", { ...scaled, "stroke-width": "0.6", opacity: "0.25" }, lines);
    // Rule labels are placed from their start, so a label can grow a tail
    // (or, rotated, a head) without its number moving; the compact label is
    // centred under the box. Each label is haloed in the surface colour,
    // stroked behind its fill (paint-order), so a number over words stays
    // readable: 3px is 1.5px of surface round every glyph, and round joins
    // keep the halo off the corners of the digits.
    const text = create(
      "g",
      {
        fill: "currentColor",
        "dominant-baseline": "central",
        "paint-order": "stroke",
        "stroke-width": "3",
        "stroke-linejoin": "round",
      },
      svg,
    );
    parts = {
      text,
      lines,
      box,
      ghost,
      corners: create("path", { ...scaled, "stroke-width": "1" }, lines),
      marks: create("path", { ...scaled, opacity: "0.7" }, lines),
      compact: create("text", { "text-anchor": "middle" }, text),
      widthText: create("text", {}, text),
      widthExtra: create("text", {}, text),
      heightText: create("text", {}, text),
      heightExtra: create("text", { "text-anchor": "end" }, text),
    };
    document.body.append(svg);
  }

  // ClientRouter swaps <body> on navigation, which takes the overlay with it.
  function init() {
    record = null;
    if (svg?.isConnected) {
      return;
    }
    build();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
  document.addEventListener("astro:page-load", init);
  document.addEventListener("selectionchange", onSelectionChange);
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", onResize, { passive: true });
  new MutationObserver(onThemeChange).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
})();
