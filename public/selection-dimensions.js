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
  function lineData(x0, y0, x1, y1, seed, amplitude) {
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
      const offset = noise(d, seed * 1000) * amplitude;
      const x = x0 + (x1 - x0) * t + nx * offset;
      const y = y0 + (y1 - y0) * t + ny * offset;
      data += `${d === 0 ? "M" : "L"}${round(x)} ${round(y)}`;
      if (d === length) {
        return data;
      }
    }
  }

  // With no overshoot the box is one closed rectangle, so its corners join
  // square. With overshoot it is four lines, each running past its corners
  // like a rectangle ruled by hand. `seed` picks the pass: the second pass
  // takes its own four, or it would trace the first exactly and the doubled
  // line would read as one.
  function boxData(x, y, w, h, seed) {
    const { wobble, overshoot: o } = stroke;
    if (o === 0) {
      return `M${x} ${y}H${x + w}V${y + h}H${x}Z`;
    }
    return (
      lineData(x - o, y, x + w + o, y, seed, wobble) +
      lineData(x + w, y - o, x + w, y + h + o, seed + 1, wobble) +
      lineData(x + w + o, y + h, x - o, y + h, seed + 2, wobble) +
      lineData(x, y + h + o, x, y - o, seed + 3, wobble)
    );
  }

  // The selection's bounding box, from the rects of the text it covers. A
  // range's own getBoundingClientRect() includes whole elements it merely
  // touches; walking the text nodes keeps the box on the ink.
  function selectionRect() {
    const selection = document.getSelection();
    if (!selection || selection.isCollapsed || !selection.rangeCount) {
      return null;
    }
    const range = selection.getRangeAt(0);
    let left = Infinity;
    let top = Infinity;
    let right = -Infinity;
    let bottom = -Infinity;
    const take = (rects) => {
      for (const r of rects) {
        if (!r.width || !r.height) {
          continue;
        }
        left = Math.min(left, r.left);
        top = Math.min(top, r.top);
        right = Math.max(right, r.right);
        bottom = Math.max(bottom, r.bottom);
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
    return right > left && bottom > top ? new DOMRect(left, top, right - left, bottom - top) : null;
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
    set(parts.lines, "shape-rendering", clean ? "crispEdges" : "geometricPrecision");
    set(parts.box, "opacity", String(stroke.opacity));
    set(parts.box, "stroke-width", String(stroke.weight));
    set(parts.ghost, "display", stroke.passes > 1 ? "inline" : "none");
    // A 0.8px rule antialiases to a soft grey row; clean mode rules a full one.
    set(parts.marks, "stroke-width", clean ? "1" : "0.8");
  }

  // The selection's box in page coordinates. A scroll moves the text and the
  // box together, so it must not read as a reshape and trail behind.
  function selectionEdges() {
    const rect = selectionRect();
    if (!rect) {
      return null;
    }
    return {
      left: rect.left + window.scrollX,
      top: rect.top + window.scrollY,
      right: rect.right + window.scrollX,
      bottom: rect.bottom + window.scrollY,
    };
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

  // Close each edge on its target. Returns whether any is still travelling.
  function settle(share, still) {
    const { shown, target } = record;
    let moving = false;
    for (const edge of ["left", "top", "right", "bottom"]) {
      const gap = target[edge] - shown[edge];
      if (still || Math.abs(gap) < SETTLE_EPSILON) {
        shown[edge] = target[edge];
      } else {
        shown[edge] += gap * share;
        moving = true;
      }
    }
    return moving;
  }

  function draw(now) {
    const still = reduceMotion.matches;
    const share = 1 - Math.exp(-(now - (record.tick ?? now)) / SETTLE_TAU_MS);
    let moving = settle(share, still);

    const fadeIn = still ? 1 : Math.min(1, (now - record.start) / FADE_IN_MS);
    const fadeOut = record.gone === null ? 1 : still ? 0 : 1 - (now - record.gone) / FADE_OUT_MS;
    if (fadeOut <= 0) {
      return { keep: false, busy: false };
    }
    set(svg, "display", "inline");
    set(svg, "opacity", String(round(fadeIn * Math.max(0, fadeOut))));

    // Snap to the half pixel so a 1px line lands on one device row at 1x.
    const left = Math.round(record.shown.left - window.scrollX);
    const top = Math.round(record.shown.top - window.scrollY);
    const right = Math.round(record.shown.right - window.scrollX);
    const bottom = Math.round(record.shown.bottom - window.scrollY);
    const x = left + 0.5;
    const y = top + 0.5;
    const w = right - left - 1;
    const h = bottom - top - 1;

    // The box, then in Blueprint a fainter second pass half a pixel off: the
    // doubled stroke is what reads as pencil rather than as a CSS border.
    set(parts.box, "d", boxData(x, y, w, h, 0));
    if (stroke.passes > 1) {
      set(parts.ghost, "d", boxData(x + 0.5, y - 0.3, w, h, 4));
    }

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
    setText(parts.compact, `${width} × ${height}`);
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

    // Corner squares while either rule shows. A clean square is 4px about
    // the corner, so its sides land on half pixels like the box's; a drawn
    // one keeps 3.5.
    const wobble = stroke.wobble;
    const squares = Math.max(wv, hv);
    set(parts.corners, "opacity", String(round(squares)));
    if (squares > 0) {
      const side = wobble === 0 ? 4 : 3.5;
      let corners = "";
      for (const [cx, cy] of [
        [x, y],
        [x + w, y],
        [x, y + h],
        [x + w, y + h],
      ]) {
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
    const widthTail = `\u00a0×\u00a0${height}`;
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
    const heightHead = `${width}\u00a0×\u00a0`;
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
      retarget(selectionEdges());
    }
    schedule();
  }

  function retarget(edges) {
    if (!edges) {
      return;
    }
    record.target = edges;
    record.tick ??= performance.now();
  }

  function onSelectionChange() {
    if (!svg) {
      return;
    }
    const selection = document.getSelection();
    const edges = selection && !selection.isCollapsed ? selectionEdges() : null;
    if (edges && (!record || record.gone !== null)) {
      // A new box starts at its full shape, with its rules already drawn, and
      // only fades in.
      const element = selectedElement(selection);
      const rules = rulesFor(
        Math.round(edges.right) - Math.round(edges.left) - 1,
        Math.round(edges.bottom) - Math.round(edges.top) - 1,
        null,
      );
      record = {
        start: performance.now(),
        gone: null,
        target: edges,
        shown: { ...edges },
        tick: null,
        rules,
        visible: {
          width: rules.width ? 1 : 0,
          height: rules.height ? 1 : 0,
          compact: rules.width || rules.height ? 0 : 1,
        },
        advance: 0,
        ink: inkFor(element),
        footer: Boolean(element?.closest("footer")),
      };
      stroke = readStroke();
      applyStroke();
    } else if (edges) {
      retarget(edges);
    } else if (record && record.gone === null) {
      record.gone = performance.now();
    }
    schedule();
  }

  // A theme pick swaps the stroke and the ink under a live box.
  function onThemeChange() {
    if (!record) {
      return;
    }
    const selection = document.getSelection();
    if (record.gone === null && selection?.rangeCount) {
      record.ink = inkFor(selectedElement(selection));
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
    // centred under the box.
    const text = create("g", { fill: "currentColor", "dominant-baseline": "central" }, svg);
    parts = {
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
