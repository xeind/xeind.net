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
  // The box fades in over DURATION.fast in src/lib/config/animation.ts (a
  // script in public/ cannot import it; change one, change both). It fades
  // out faster than any token: deselecting is the reader's own act, and the
  // response to it should be quicker than the entrance, so 120ms against the
  // 150ms in, where the nearest token, DURATION.fast, would make the two the
  // same. Both ramps are ease-out cubic, so the fade-in is mostly inked in
  // its first half and the fade-out drops at once.
  const FADE_IN_MS = 150;
  const FADE_OUT_MS = 120;
  // A hover callout is a lighter thing than a selection, so it arrives in
  // 100ms. One that follows another seen within HOVER_WARM_MS, as the
  // pointer runs along a row of controls or crosses a gap between them,
  // shows at once: fading in again on every control reads as flicker.
  const HOVER_FADE_IN_MS = 100;
  const HOVER_WARM_MS = 300;
  // Hover intent. While a callout is on screen, or was within HOVER_WARM_MS,
  // the pointer has to rest on the next element this long before the box
  // goes there. A fast pass over the project grid crosses a 288 × 144 tile
  // in about 50ms and used to drag one tile-sized box after it at 1600px/s;
  // a reader settling on a control stays far longer than this.
  const HOVER_DWELL_MS = 100;
  const easeOut = (t) => 1 - (1 - t) ** 3;
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
  // The side-rail rulers need this much gutter beside the sheet on both
  // sides: a 7px tick and a rotated 10px label on a rail with less room
  // crowd the viewport edge.
  const RULER_GUTTER = 24;
  // What the pointer redlines, and whether moving between two of them morphs
  // one box into the next (true) or fades one out as the next fades in.
  const INTERACTIVE = "a, button, [role=button], input, select, textarea, summary";
  const HOVER_MORPH = true;
  // The mark on the selection outline's outer corners: the site's turned
  // square, or an L bracket (see draw()).
  const CORNER_MARK = "diamond";

  let svg = null;
  let parts = null;
  let record = null;
  let stroke = null;
  let frame = 0;
  // The hover and focus redlines: at most one live of each kind, and in
  // crossfade one more leaving.
  let hovers = [];
  let pointer = null;
  let hitFrame = 0;
  // Hover boxes take ids from their own range, so a hover's wobble never
  // repeats the selection's.
  let nextHoverId = 5000;
  // When a hover callout was last on screen, for the warm switch.
  let hoverSeen = -Infinity;
  // Hover intent: the element the pointer is on but the box is not yet, since
  // when, and since when the pointer has been off the box's element. Undefined
  // and null when the pointer is where the box is.
  let candidate;
  let candidateSince = 0;
  let leftAt = null;
  let dwellTimer = 0;

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
    const n = bands.length;
    const L = bands.map((band) => Math.round(band.shown.left) + 0.5);
    const R = bands.map((band) => Math.round(band.shown.right) - 0.5);
    const seed = (i, role) => 100 + bands[i].id * EDGE_ROLES + pass * 6 + role;
    const boundary = (i) => Math.round((bands[i].shown.bottom + bands[i + 1].shown.top) / 2);
    const top = Math.round(bands[0].shown.top) + 0.5;
    const bottom = Math.round(bands[n - 1].shown.bottom) - 0.5;
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

  // The outline's path: one closed path in every theme, so every corner is
  // one mitred point. Drawing each edge as its own butt-capped line, as an
  // earlier version did to let the overshoot run past outer corners, left
  // the inner corners broken: at one the vertical ran half a pixel past the
  // horizontal, at the other the join left a notch. With wobble each edge is
  // walked on its own seed and pinned at both ends, so the path closes on the
  // corner points exactly. The overshoot is then laid over the closed path
  // as two short straight stubs at each outer corner, continuing its two
  // edges past it; inner corners get none, since there it poked into the
  // shape over the text. An edge under a pixel is a band still forming or
  // leaving; it is skipped, so it can neither bend the path nor grow stubs.
  function outlineData(points, dx, dy) {
    const { wobble, overshoot: o } = stroke;
    const edges = [];
    for (let k = 0; k < points.length; k += 1) {
      const [x0, y0, seed] = points[k];
      const [x1, y1] = points[(k + 1) % points.length];
      const length = Math.hypot(x1 - x0, y1 - y0);
      if (length >= 1) {
        edges.push({ x0, y0, x1, y1, seed, ux: (x1 - x0) / length, uy: (y1 - y0) / length });
      }
    }
    if (!edges.length) {
      return "";
    }
    let data = "";
    for (const edge of edges) {
      const line = lineData(
        edge.x0 + dx,
        edge.y0 + dy,
        edge.x1 + dx,
        edge.y1 + dy,
        edge.seed,
        wobble,
        true,
        true,
      );
      // Each walk opens with a move; past the first, it continues the path.
      data += data ? `L${line.slice(1)}` : line;
    }
    data += "Z";
    if (o > 0) {
      // Outer where the clockwise walk turns right.
      edges.forEach((edge, m) => {
        const next = edges[(m + 1) % edges.length];
        if (edge.ux * next.uy - edge.uy * next.ux > 0.5) {
          const x = edge.x1 + dx;
          const y = edge.y1 + dy;
          data +=
            `M${round(x)} ${round(y)}L${round(x + edge.ux * o)} ${round(y + edge.uy * o)}` +
            `M${round(x)} ${round(y)}L${round(x - next.ux * o)} ${round(y - next.uy * o)}`;
        }
      });
    }
    return data;
  }

  // The outline's outer corners, where the clockwise walk turns right, each
  // with the length of its shorter arm and the unit directions of the edges
  // arriving and leaving. Repeated and collinear points are dropped first, so
  // a band still forming adds no corner until its step is real.
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
    const n = ring.length;
    const outer = ring.map(([x, y], k) => {
      const [px, py] = ring[(k - 1 + n) % n];
      const [nx, ny] = ring[(k + 1) % n];
      return (x - px) * (ny - y) - (y - py) * (nx - x) > 0;
    });
    const corners = [];
    for (let k = 0; k < n; k += 1) {
      if (!outer[k]) {
        continue;
      }
      const [px, py] = ring[(k - 1 + n) % n];
      const [x, y] = ring[k];
      const [nx, ny] = ring[(k + 1) % n];
      const into = Math.hypot(x - px, y - py);
      const out = Math.hypot(nx - x, ny - y);
      corners.push({
        x,
        y,
        arm: Math.min(into, out),
        into: [(x - px) / into, (y - py) / into],
        out: [(nx - x) / out, (ny - y) / out],
        // The arms to the neighbouring corners, where those are outer too.
        before: outer[(k - 1 + n) % n] ? into : Infinity,
        after: outer[(k + 1) % n] ? out : Infinity,
      });
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

  // Whether a box in the overlay's coordinates overlaps one of the footer's
  // controls. The footer sets its buttons beside its text, so a height label
  // to the right of a footer selection can land on one, in ink that matches
  // the button's fill.
  function overlapsControl(left, top, right, bottom) {
    const sx = record.pinned ? 0 : window.scrollX;
    const sy = record.pinned ? 0 : window.scrollY;
    for (const control of document.querySelectorAll("footer a, footer button")) {
      const r = control.getBoundingClientRect();
      if (
        r.width &&
        r.left + sx < right &&
        r.right + sx > left &&
        r.top + sy < bottom &&
        r.bottom + sy > top
      ) {
        return true;
      }
    }
    return false;
  }

  // Whether the selected text sits in a fixed ancestor, which holds still
  // while the page scrolls under it: the footer, set behind the page.
  function pinnedFor(element) {
    for (let node = element; node; node = node.parentElement) {
      if (getComputedStyle(node).position === "fixed") {
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
    parts.selection.style.color = record.ink;
    set(svg, "data-anchor", record.pinned ? "viewport" : "page");
    set(parts.text, "stroke", record.surface);
    set(parts.lines, "shape-rendering", clean ? "crispEdges" : "geometricPrecision");
    set(parts.box, "stroke-width", String(stroke.weight));
    // Through the style, as for the overlay itself (see show()).
    parts.ghost.style.display = stroke.passes > 1 ? "" : "none";
    // A 0.8px rule antialiases to a soft grey row; clean mode rules a full one.
    set(parts.marks, "stroke-width", clean ? "1" : "0.8");
    set(parts.rulerTicks, "stroke-width", clean ? "1" : "0.8");
    // A diamond is filled with the surface, as the halo is, so it covers the
    // lines crossing under it; a bracket is open.
    const diamond = CORNER_MARK === "diamond";
    set(parts.corners, "fill", diamond ? record.surface : "none");
    set(parts.corners, "shape-rendering", diamond || !clean ? "geometricPrecision" : "crispEdges");
  }

  // The selection's line bands, each but the last extended down to the next
  // line's top, so the leading between lines is inside the outline and it is
  // one shape rather than stacked boxes. That bridges a paragraph margin too,
  // which is the union the outline means.
  //
  // In page coordinates, the overlay's own: it sits in the document and
  // scrolls with the text on the compositor, so a scroll needs no redraw.
  // A selection inside a fixed ancestor (the footer) does not scroll, so its
  // bands stay in viewport coordinates and the overlay is pinned to the
  // viewport for it.
  function selectionBands(pinned) {
    const lines = selectionLines();
    if (!lines) {
      return null;
    }
    const sx = pinned ? 0 : window.scrollX;
    const sy = pinned ? 0 : window.scrollY;
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

    // Reduced motion keeps the fades, which are opacity and do not move
    // anything; what it drops is the travel: the shape snaps, the rules and
    // rulers stand at full, and nothing stages or dims.
    const fadeIn = easeOut(Math.min(1, (now - record.start) / FADE_IN_MS));
    const fadeOut =
      record.gone === null ? 1 : 1 - easeOut(Math.min(1, (now - record.gone) / FADE_OUT_MS));
    if (fadeOut <= 0) {
      return { keep: false, busy: false };
    }
    show();
    fade(parts.selection, round(fadeIn * Math.max(0, fadeOut)));

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
    const left = Math.round(Math.min(...bands.map((b) => b.shown.left)));
    const right = Math.round(Math.max(...bands.map((b) => b.shown.right)));
    const top = Math.round(Math.min(...bands.map((b) => b.shown.top)));
    const bottom = Math.round(Math.max(...bands.map((b) => b.shown.bottom)));
    const x = left + 0.5;
    const y = top + 0.5;
    const w = right - left - 1;
    const h = bottom - top - 1;
    // The viewport's far edges in the overlay's coordinates, for the label
    // flips that keep a rule on screen. They are judged whenever the outline
    // is drawn, which in the document is on a selection change, not on a
    // scroll: a label does not jump under the reader once they stop
    // scrolling, at the cost of one that was flipped staying flipped.
    const viewBottom = window.innerHeight + (record.pinned ? 0 : window.scrollY);
    const viewRight = window.innerWidth + (record.pinned ? 0 : window.scrollX);

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
      const below = y + h + 16 < viewBottom;
      set(parts.compact, "x", String(midX));
      set(parts.compact, "y", String(Math.round(below ? y + h + 12 : y - 12)));
    }

    // Corner marks while either rule shows, on the outline's outer corners;
    // inner corners take none. Not the bounding box's: on a stepped outline
    // two of those float in empty space off the line, which reads as a
    // mistake. A mark grows with the shorter arm of its corner up to 8px, so
    // one does not pop in as a step starts to form.
    //
    // "diamond" is the site's own corner mark (ui/CornerDiamond): a square
    // turned 45° on the corner point, a 1px stroke in the ink over an opaque
    // fill of the surface, which covers the two lines crossing under it so
    // nothing doubles. Its half-diagonal is its side / √2. Diagonals cannot
    // land on the pixel grid, so it is drawn geometricPrecision in every
    // theme, as the CSS mark is. "bracket" is an L of two 6px ticks set 2px
    // outside the corner, along its two edges, pixel-snapped like the
    // outline in the clean themes.
    const wobble = stroke.wobble;
    const marked = Math.max(wv, hv);
    set(parts.corners, "opacity", String(round(marked)));
    if (marked > 0) {
      let corners = "";
      const found = outerCorners(points);
      // A diamond scales to its box: its side is a quarter of the corner's
      // shorter arm, up to the Panels' 8px, so a 17px line takes about 4px
      // and a tall step the full mark, and it grows in with a forming step.
      // Two outer corners closer than two sides apart along an edge would
      // crowd it, so neither is marked and the line's own corner shows; under
      // 3px a diamond is a speck, so none is drawn.
      const sides = found.map(({ arm }) => Math.min(8, arm / 4, arm));
      const count = found.length;
      for (const [k, { x: cx, y: cy, arm, into, out, before, after }] of found.entries()) {
        const grow = Math.min(1, arm / 8);
        if (CORNER_MARK === "diamond") {
          const side = sides[k];
          const crowded =
            before < 2 * Math.max(side, sides[(k - 1 + count) % count]) ||
            after < 2 * Math.max(side, sides[(k + 1) % count]);
          if (side < 3 || crowded) {
            continue;
          }
          const half = round(side / Math.SQRT2);
          corners += `M${cx} ${cy - half}L${cx + half} ${cy}L${cx} ${cy + half}L${cx - half} ${cy}Z`;
        } else {
          const reach = Math.round(6 * grow);
          if (reach < 1) {
            continue;
          }
          // Outward is left of each edge on the clockwise walk.
          const bx = cx + 2 * (into[1] + out[1]);
          const by = cy - 2 * (into[0] + out[0]);
          corners +=
            `M${bx - into[0] * reach} ${by - into[1] * reach}L${bx} ${by}` +
            `L${bx + out[0] * reach} ${by + out[1] * reach}`;
        }
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
      const rowY = y + h + 18 < viewBottom ? y + h + 11 : y - 11;
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
      let colX = x + w + 18 < viewRight ? x + w + 11 : x - 11;
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

    moving = drawRulers(top, bottom, share, still) || moving;

    return { keep: true, busy: moving || fadeIn < 1 || record.gone !== null };
  }

  // The selection's height on the sheet's side rails, after imdaryl.com's
  // rulers: on each rail a tick at the selection's top and bottom, a faint
  // band between, and the height at mid-band, in the box's ink and label.
  // The rails are main's left and right hairlines, read from its rect each
  // draw: the left on the sheet's first column, the right on the column just
  // outside its last (Layout.astro). They show only where the gutters can
  // hold them, and not for a selection pinned to the viewport, which sits in
  // the footer, off the sheet.
  //
  // The rulers form from the selection's centre, the band's half-height and
  // the count both following their visibility, and retract the same way.
  // Unlike the box they form on a new selection too: they appear away from
  // the pointer, so growing is how the eye finds them. Drawn in the overlay's
  // page coordinates, they scroll with the text and need no redraw.
  function drawRulers(top, bottom, share, still) {
    const sheet = record.pinned ? null : document.querySelector(".edge-glow-shell-vertical");
    const rect = sheet?.getBoundingClientRect();
    // The right gutter from clientWidth, so a scrollbar is not counted as one.
    const fits =
      rect &&
      rect.left >= RULER_GUTTER &&
      document.documentElement.clientWidth - rect.right >= RULER_GUTTER;
    const moving = ease("ruler", fits ? 1 : 0, share, still);
    const rv = record.visible.ruler;
    let band = "";
    let ticks = "";
    for (const label of parts.rulerLabels) {
      set(label, "opacity", String(round(rv)));
    }
    if (rv > 0 && rect) {
      const tick = (stroke.wobble * 2) / 3;
      const mid = (top + bottom) / 2;
      const reach = (rv * (bottom - top)) / 2;
      const bandTop = Math.round(mid - reach);
      const bandBottom = Math.round(mid + reach);
      const midY = Math.round(mid);
      const count = String(Math.round(rv * (bottom - top)));
      const columns = [rect.left, rect.right].map(
        (edge) => Math.round(edge + window.scrollX) + 0.5,
      );
      columns.forEach((cx, i) => {
        if (bandBottom - bandTop >= 1) {
          // 5px about the rail, so its sides sit on whole pixels.
          band += `M${cx - 2.5} ${bandTop}h5V${bandBottom}h-5Z`;
        }
        ticks +=
          lineData(cx - 3.5 * rv, bandTop + 0.5, cx + 3.5 * rv, bandTop + 0.5, 16 + i * 2, tick) +
          lineData(
            cx - 3.5 * rv,
            bandBottom - 0.5,
            cx + 3.5 * rv,
            bandBottom - 0.5,
            17 + i * 2,
            tick,
          );
        const label = parts.rulerLabels[i];
        setText(label, count);
        set(label, "x", String(cx));
        set(label, "y", String(midY));
        set(label, "transform", `rotate(-90 ${cx} ${midY})`);
      });
    }
    set(parts.rulerBand, "d", band);
    set(parts.rulerTicks, "d", ticks);
    return moving;
  }

  // The overlay is shown and hidden through its style, never the display
  // attribute: a presentation attribute loses to any stylesheet rule, and
  // Tailwind's preflight sets svg { display: block }, so display="none" left
  // the last fade frame painted under every deselected box, a ghost label
  // that never went. Hiding a group also takes its opacity to 0, so the
  // content is invisible even if the hide ever fails.
  //
  // The svg is shown while anything is drawn; the selection and each hover
  // fade in their own group, so one can come and go under the other.
  function show() {
    if (svg.style.display) {
      svg.style.display = "";
    }
  }

  function hide() {
    svg.style.display = "none";
  }

  function fade(group, opacity) {
    if (group.style.display) {
      group.style.display = "";
    }
    const value = String(opacity);
    if (group.style.opacity !== value) {
      group.style.opacity = value;
    }
  }

  function vanish(group) {
    group.style.opacity = "0";
    group.style.display = "none";
  }

  // One frame per event. The loop only keeps itself alive while a fade or a
  // reshape runs; at rest it stops, and the next selectionchange, pointer
  // move or pinned scroll draws again.
  function paint() {
    frame = 0;
    if (!svg) {
      return;
    }
    const now = performance.now();
    let busy = false;
    if (record) {
      const result = draw(now);
      if (result.keep) {
        // At rest the clock stops too: the next reshape starts timing from
        // its own event, not from the last frame seconds ago, which would
        // jump it.
        record.tick = result.busy ? now : null;
        busy = result.busy;
      } else {
        record = null;
        vanish(parts.selection);
      }
    }
    hovers = hovers.filter((hover) => {
      const result = drawHover(hover, now);
      if (!result.keep) {
        vanish(hover.parts.group);
        return false;
      }
      hover.tick = result.busy ? now : null;
      busy = busy || result.busy;
      return true;
    });
    if (!record && !hovers.length) {
      hide();
      return;
    }
    if (busy) {
      frame = window.requestAnimationFrame(paint);
    }
  }

  function schedule() {
    if (!frame) {
      frame = window.requestAnimationFrame(paint);
    }
  }

  // Hover redlines, after imdaryl.com's cursor callouts: the outline style
  // of the selection box, as one rectangle on the element's border box, with
  // its W × H under it. Each hover keeps its own record and group, so a
  // selection and a hover show at once. The box is in page coordinates, so
  // a scroll carries it with the element; the hit test reruns only when the
  // pointer moves, once a frame.
  //
  // Not while a button is held, or a drag-select across links would spray
  // boxes; not while the selection is pinned to the viewport, whose overlay
  // coordinates a page box cannot share; and not on elements in a fixed
  // ancestor (the footer) for the same reason, and because the footer's ink
  // rules leave a hover there unreadable. Under reduced motion it stays, as
  // opacity only: no box travels between neighbours, the old one fades out
  // where it is and the new one fades in at its own place.
  //
  // Keyboard focus draws the same callout, on the same elements, when the
  // browser would show its focus ring (:focus-visible), so a click on a link
  // draws none; a click in a text field does, as the ring does. The ring
  // stays: the box is drawn over the page and takes nothing from it. Focus
  // and hover are separate callouts, so a reader can tab with the pointer
  // resting elsewhere and see both. An element under both gets one box,
  // kept by whichever callout held it first.
  function boxOf(element) {
    const r = element.getBoundingClientRect();
    return {
      left: r.left + window.scrollX,
      top: r.top + window.scrollY,
      right: r.right + window.scrollX,
      bottom: r.bottom + window.scrollY,
    };
  }

  function onPointerMove(event) {
    pointer = { x: event.clientX, y: event.clientY, pressed: event.buttons !== 0 };
    if (!hitFrame) {
      hitFrame = window.requestAnimationFrame(hitTest);
    }
  }

  function onPointerOut(event) {
    if (!event.relatedTarget) {
      pointer = null;
      clearHoverIntent();
      hoverOn("pointer", null);
    }
  }

  function clearHoverIntent() {
    window.clearTimeout(dwellTimer);
    dwellTimer = 0;
    candidate = undefined;
    leftAt = null;
  }

  function onDwell() {
    dwellTimer = 0;
    if (!hitFrame) {
      hitFrame = window.requestAnimationFrame(hitTest);
    }
  }

  // Where the pointer box should be, given the element under the pointer. A
  // cold hover lands at once. In a run of hovers the box holds until the
  // pointer has rested on one element for HOVER_DWELL_MS, and fades out if the
  // pointer has been off its element that long without resting anywhere. A
  // pointer that stops sends no more moves, so a timer rechecks when the
  // dwell is due.
  function intended(pointed) {
    const live = hovers.find((hover) => hover.gone === null && hover.kind === "pointer");
    const current = live?.element ?? null;
    window.clearTimeout(dwellTimer);
    dwellTimer = 0;
    if (pointed === current) {
      clearHoverIntent();
      return pointed;
    }
    const now = performance.now();
    if (!live && leftAt === null && now - hoverSeen > HOVER_WARM_MS) {
      return pointed;
    }
    if (pointed !== candidate) {
      candidate = pointed;
      candidateSince = now;
    }
    leftAt ??= now;
    const waited = now - candidateSince;
    if (waited >= HOVER_DWELL_MS) {
      clearHoverIntent();
      return pointed;
    }
    dwellTimer = window.setTimeout(onDwell, HOVER_DWELL_MS - waited);
    return now - leftAt >= HOVER_DWELL_MS ? null : current;
  }

  // A Tab fires focusout and then focusin; reading the focus once a frame,
  // after both, lets the box travel to the next element instead of leaving
  // and fading in again.
  function onFocusChange() {
    if (!hitFrame) {
      hitFrame = window.requestAnimationFrame(hitTest);
    }
  }

  function hitTest() {
    hitFrame = 0;
    if (!svg) {
      return;
    }
    const free = !record?.pinned;
    let pointed = null;
    if (pointer && !pointer.pressed && free) {
      const element = document.elementFromPoint(pointer.x, pointer.y)?.closest(INTERACTIVE);
      if (element && !pinnedFor(element)) {
        pointed = element;
      }
      pointed = intended(pointed);
    } else {
      // A press, a pinned selection or no pointer clears the box at once.
      clearHoverIntent();
    }
    let focused = null;
    const active = document.activeElement;
    if (free && active?.matches(":focus-visible")) {
      const element = active.closest(INTERACTIVE);
      if (element && !pinnedFor(element)) {
        focused = element;
      }
    }
    // Two boxes on one element are one box to the eye on a clean stroke and
    // a smear on Blueprint's pencil; the callout already on it keeps it.
    if (focused && focused === pointed) {
      if (hovers.some((h) => h.gone === null && h.kind === "focus" && h.element === focused)) {
        pointed = null;
      } else {
        focused = null;
      }
    }
    hoverOn("pointer", pointed);
    hoverOn("focus", focused);
  }

  function applyHoverStroke(hover) {
    const { group, lines, box, ghost, text } = hover.parts;
    const clean = stroke.wobble === 0;
    group.style.color = hover.ink;
    set(text, "stroke", hover.surface);
    set(lines, "shape-rendering", clean ? "crispEdges" : "geometricPrecision");
    set(box, "stroke-width", String(stroke.weight));
    set(box, "opacity", String(stroke.opacity));
    ghost.style.display = stroke.passes > 1 ? "" : "none";
  }

  function hoverOn(kind, element) {
    const live = hovers.find((hover) => hover.gone === null && hover.kind === kind);
    if ((live?.element ?? null) === element) {
      return;
    }
    const now = performance.now();
    const morph = HOVER_MORPH && !reduceMotion.matches;
    if (live && (!element || !morph)) {
      live.gone = now;
      // It was on screen until now, however long it has rested undrawn.
      hoverSeen = now;
    }
    if (element) {
      stroke ??= readStroke();
      if (!record) {
        set(svg, "data-anchor", "page");
      }
      if (morph && live) {
        // One box travels to the next element on the edges' curve.
        live.element = element;
        live.target = boxOf(element);
        live.tick ??= now;
        live.ink = inkFor(element);
        live.surface = surfaceFor(element);
        applyHoverStroke(live);
      } else {
        // The parts no other hover holds; with two already leaving, the
        // older one gives its parts up.
        let free = parts.hovers.find((slot) => !hovers.some((hover) => hover.parts === slot));
        if (!free) {
          const oldest = hovers.shift();
          vanish(oldest.parts.group);
          free = oldest.parts;
        }
        const target = boxOf(element);
        const hover = {
          id: nextHoverId++,
          kind,
          element,
          target,
          shown: { ...target },
          // Warm: a callout seen this recently means this one starts shown.
          start: now - hoverSeen <= HOVER_WARM_MS ? now - HOVER_FADE_IN_MS : now,
          gone: null,
          tick: null,
          parts: free,
          ink: inkFor(element),
          surface: surfaceFor(element),
        };
        applyHoverStroke(hover);
        hovers.push(hover);
      }
    }
    schedule();
  }

  function drawHover(hover, now) {
    const still = reduceMotion.matches;
    const share = 1 - Math.exp(-(now - (hover.tick ?? now)) / SETTLE_TAU_MS);
    let moving = false;
    for (const edge of ["left", "top", "right", "bottom"]) {
      const gap = hover.target[edge] - hover.shown[edge];
      if (still || Math.abs(gap) < SETTLE_EPSILON) {
        hover.shown[edge] = hover.target[edge];
      } else {
        hover.shown[edge] += gap * share;
        moving = true;
      }
    }
    const fadeIn = easeOut(Math.min(1, (now - hover.start) / HOVER_FADE_IN_MS));
    const fadeOut =
      hover.gone === null ? 1 : 1 - easeOut(Math.min(1, (now - hover.gone) / FADE_OUT_MS));
    if (fadeOut <= 0) {
      return { keep: false, busy: false };
    }
    hoverSeen = now;
    const { group, box, ghost, label } = hover.parts;
    show();
    fade(group, round(fadeIn * fadeOut));
    const bands = [{ id: hover.id, shown: hover.shown }];
    set(box, "d", outlineData(outline(bands, 0), 0, 0));
    if (stroke.passes > 1) {
      set(ghost, "d", outlineData(outline(bands, 1), 0.5, -0.3));
    }
    const left = Math.round(hover.shown.left);
    const right = Math.round(hover.shown.right);
    const top = Math.round(hover.shown.top);
    const bottom = Math.round(hover.shown.bottom);
    // Below the box, or above it near the viewport's bottom edge.
    const below = bottom + 16 < window.innerHeight + window.scrollY;
    setText(label, `${right - left} \u00d7 ${bottom - top}`);
    set(label, "x", String(Math.round((left + right) / 2)));
    set(label, "y", String(below ? bottom + 11 : top - 11));
    return { keep: true, busy: moving || fadeIn < 1 || hover.gone !== null };
  }

  // A reflow moves the text under a live box; a box fading out keeps its last
  // place.
  function onResize() {
    if (record && record.gone === null) {
      retarget(selectionBands(record.pinned));
    }
    schedule();
  }

  function onSelectionChange() {
    if (!svg) {
      return;
    }
    const selection = document.getSelection();
    const selected = selection && !selection.isCollapsed && selection.rangeCount;
    const fresh = !record || record.gone !== null;
    const element = selected && fresh ? selectedElement(selection) : null;
    const pinned = fresh ? pinnedFor(element) : record.pinned;
    const targets = selected ? selectionBands(pinned) : null;
    if (targets && fresh) {
      // A new outline starts at its full shape, with its rules already drawn,
      // and only fades in.
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
          ruler: 0,
        },
        advance: 0,
        fastest: 0,
        inkShare: 1,
        ink: inkFor(element),
        surface: surfaceFor(element),
        footer: Boolean(element?.closest("footer")),
        pinned,
      };
      stroke = readStroke();
      applyStroke();
      // A pinned selection puts the overlay in viewport coordinates, which a
      // hover box in page coordinates cannot share; it goes at once.
      if (pinned) {
        hovers.forEach((hover) => vanish(hover.parts.group));
        hovers = [];
      }
    } else if (targets) {
      retarget(targets);
    } else if (record && record.gone === null) {
      record.gone = performance.now();
    }
    schedule();
  }

  // A theme pick swaps the stroke, the ink and the halo under a live box and
  // a live hover.
  function onThemeChange() {
    if (!record && !hovers.length) {
      return;
    }
    stroke = readStroke();
    if (record) {
      const selection = document.getSelection();
      if (record.gone === null && selection?.rangeCount) {
        const element = selectedElement(selection);
        record.ink = inkFor(element);
        record.surface = surfaceFor(element);
      }
      applyStroke();
    }
    for (const hover of hovers) {
      hover.ink = inkFor(hover.element);
      hover.surface = surfaceFor(hover.element);
      applyHoverStroke(hover);
    }
    schedule();
  }

  // Each label is haloed in the surface colour, stroked behind its fill
  // (paint-order), so a number over words stays readable: 3px is 1.5px of
  // surface round every glyph, and round joins keep the halo off the corners
  // of the digits.
  const LABELS = {
    fill: "currentColor",
    "dominant-baseline": "central",
    "paint-order": "stroke",
    "stroke-width": "3",
    "stroke-linejoin": "round",
  };
  const SCALED = { "vector-effect": "non-scaling-stroke" };

  // One hover's parts: its own group, so it fades and takes its ink apart
  // from the selection.
  function hoverParts() {
    const group = create("g", {}, svg);
    group.style.display = "none";
    const lines = create("g", { fill: "none", stroke: "currentColor" }, group);
    const text = create("g", LABELS, group);
    return {
      group,
      lines,
      text,
      box: create("path", { ...SCALED, "stroke-width": "1" }, lines),
      ghost: create("path", { ...SCALED, "stroke-width": "0.6", opacity: "0.25" }, lines),
      label: create("text", { "text-anchor": "middle" }, text),
    };
  }

  // The overlay's parts, built once and only re-attributed per frame. Font
  // and colour come from tokens: each group's ink is its `color`, and every
  // stroke and fill is currentColor.
  function build() {
    svg = create("svg", { class: "selection-dimensions", "aria-hidden": "true" });
    svg.style.display = "none";
    svg.style.font = "10px var(--font-mono, monospace)";
    // Tabular figures, so a counting number keeps its width digit to digit.
    svg.style.fontVariantNumeric = "tabular-nums";
    const selection = create("g", {}, svg);
    selection.style.display = "none";
    const lines = create("g", { fill: "none", stroke: "currentColor" }, selection);
    // In paint order: the box, its second pass, then the marks over them.
    const box = create("path", { ...SCALED, "stroke-width": "1" }, lines);
    const ghost = create("path", { ...SCALED, "stroke-width": "0.6", opacity: "0.25" }, lines);
    // Rule labels are placed from their start, so a label can grow a tail
    // (or, rotated, a head) without its number moving; the compact label is
    // centred under the box.
    const text = create("g", LABELS, selection);
    parts = {
      selection,
      text,
      lines,
      box,
      ghost,
      // Round joins give the diamond CornerDiamond's 1px rounding.
      corners: create(
        "path",
        { ...SCALED, "stroke-width": "1", "stroke-linejoin": "round" },
        lines,
      ),
      marks: create("path", { ...SCALED, opacity: "0.7" }, lines),
      // The rail band is a wash, Daryl's 16% of the ink; its ticks are marks,
      // at the rules' 0.7 rather than his 55%, so they read as the same ink
      // as the rules beside the box.
      rulerBand: create(
        "path",
        { fill: "currentColor", stroke: "none", "fill-opacity": "0.16" },
        lines,
      ),
      rulerTicks: create("path", { ...SCALED, opacity: "0.7" }, lines),
      compact: create("text", { "text-anchor": "middle" }, text),
      widthText: create("text", {}, text),
      widthExtra: create("text", {}, text),
      heightText: create("text", {}, text),
      heightExtra: create("text", { "text-anchor": "end" }, text),
      rulerLabels: [
        create("text", { "text-anchor": "middle" }, text),
        create("text", { "text-anchor": "middle" }, text),
      ],
    };
    // Three hover groups: a live hover and a live focus, and in crossfade one
    // more leaving as the next arrives.
    parts.hovers = [hoverParts(), hoverParts(), hoverParts()];
    document.body.append(svg);
  }

  // ClientRouter swaps <body> on navigation, which takes the overlay with it.
  function init() {
    record = null;
    hovers = [];
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
  // The overlay scrolls with the document on the compositor, so a scroll
  // needs no redraw; a redraw from this listener lands a frame or more after
  // the compositor has moved the text, and the box swam behind it. Only a
  // viewport-pinned outline redraws, and its bands do not move on a scroll,
  // so the draw is the same one.
  window.addEventListener(
    "scroll",
    () => {
      if (record?.pinned) {
        schedule();
      }
    },
    { passive: true },
  );
  window.addEventListener("resize", onResize, { passive: true });
  document.addEventListener("pointermove", onPointerMove, { passive: true });
  document.addEventListener("mouseout", onPointerOut, { passive: true });
  document.addEventListener("focusin", onFocusChange);
  document.addEventListener("focusout", onFocusChange);
  new MutationObserver(onThemeChange).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
})();
