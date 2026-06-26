(() => {
  if (!window.matchMedia("(pointer: fine)").matches) return;

  let ctx = null;
  let primed = false;

  const getCtx = () => {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  };

  const prime = async () => {
    if (primed) return;
    const audio = getCtx();
    if (audio.state === "suspended") await audio.resume();
    const buffer = audio.createBuffer(1, 1, audio.sampleRate);
    const source = audio.createBufferSource();
    const gain = audio.createGain();
    source.buffer = buffer;
    gain.gain.value = 0.0001;
    source.connect(gain);
    gain.connect(audio.destination);
    source.start(audio.currentTime);
    primed = true;
  };

  const playClickSoft = async () => {
    const audio = getCtx();
    if (audio.state === "suspended") await audio.resume();
    const noise = audio.createBufferSource();
    const buf = audio.createBuffer(
      1,
      audio.sampleRate * 0.012,
      audio.sampleRate,
    );
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++)
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / 80);
    noise.buffer = buf;
    const filter = audio.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 3000 + Math.random() * 400;
    filter.Q.value = 2;
    const gain = audio.createGain();
    gain.gain.value = 0.2 + Math.random() * 0.04;
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audio.destination);
    noise.start(audio.currentTime);
  };

  const playFidget = async () => {
    const audio = getCtx();
    if (audio.state === "suspended") await audio.resume();
    const noise = audio.createBufferSource();
    const buf = audio.createBuffer(1, audio.sampleRate * 0.005, audio.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++)
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / 15);
    noise.buffer = buf;
    const filter = audio.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 2200 + Math.random() * 400;
    filter.Q.value = 3;
    const gain = audio.createGain();
    gain.gain.value = 0.12 + Math.random() * 0.03;
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audio.destination);
    noise.start(audio.currentTime);
  };

  const heroLinkSelector = '[data-hero-sfx="click"]';
  const hoverSelector = "[data-hero-sfx-hover]";
  const hintSelector = "[data-link-hint]";
  let lastHoverTarget = null;
  let hint = null;
  let hintTarget = null;

  const SVG_NS = "http://www.w3.org/2000/svg";
  const HINT_PAD_X = 8;
  const HINT_PAD_Y = 4;
  const HINT_TAIL_WIDTH = 6;
  const HINT_TAIL_HEIGHT = 5;

  const getHint = () => {
    if (hint) return hint;

    const root = document.createElement("div");
    root.id = "link-hint-tooltip";
    root.setAttribute("role", "tooltip");
    root.style.cssText =
      "position:fixed;z-index:50;pointer-events:none;visibility:hidden;opacity:0;transition:opacity 120ms cubic-bezier(0.215,0.61,0.355,1);";

    const svg = document.createElementNS(SVG_NS, "svg");
    svg.style.display = "block";

    const path = document.createElementNS(SVG_NS, "path");
    path.style.fill = "var(--color-card)";
    path.style.stroke =
      "color-mix(in srgb, var(--color-accent) 30%, transparent)";
    path.setAttribute("stroke-width", "1");
    path.setAttribute("stroke-dasharray", "3 2");

    const text = document.createElementNS(SVG_NS, "text");
    text.setAttribute("text-anchor", "middle");
    text.style.fill =
      "color-mix(in srgb, var(--color-foreground) 80%, transparent)";
    text.style.fontFamily = "var(--font-family-sans)";
    text.style.fontSize = "0.875rem";

    svg.append(path, text);
    root.append(svg);
    document.body.append(root);
    hint = { root, svg, path, text };
    return hint;
  };

  const positionHint = (target) => {
    const label = target.getAttribute("data-link-hint");
    if (!label) return;

    const parts = getHint();
    parts.text.textContent = label;
    parts.root.style.display = "block";

    const textBox = parts.text.getBBox();
    const boxWidth = Math.ceil(textBox.width) + HINT_PAD_X * 2;
    const boxHeight = Math.ceil(textBox.height) + HINT_PAD_Y * 2;
    const svgWidth = boxWidth + 2;
    const svgHeight = boxHeight + HINT_TAIL_HEIGHT + 2;
    const center = svgWidth / 2;

    parts.svg.setAttribute("width", String(svgWidth));
    parts.svg.setAttribute("height", String(svgHeight));
    parts.svg.setAttribute("viewBox", `0 0 ${svgWidth} ${svgHeight}`);
    parts.path.setAttribute(
      "d",
      [
        "M 1 1",
        `H ${boxWidth + 1}`,
        `V ${boxHeight + 1}`,
        `H ${center + HINT_TAIL_WIDTH}`,
        `L ${center} ${boxHeight + HINT_TAIL_HEIGHT + 1}`,
        `L ${center - HINT_TAIL_WIDTH} ${boxHeight + 1}`,
        "H 1",
        "Z",
      ].join(" "),
    );
    parts.text.setAttribute("x", String(center));
    parts.text.setAttribute(
      "y",
      String(1 + HINT_PAD_Y + Math.ceil(textBox.height) * 0.82),
    );

    const rect = target.getBoundingClientRect();
    parts.root.style.left = `${rect.left + rect.width / 2 - svgWidth / 2}px`;
    parts.root.style.top = `${rect.top - svgHeight}px`;
    target.setAttribute("aria-describedby", parts.root.id);
  };

  const showHint = (target) => {
    hintTarget = target;
    positionHint(target);
    const parts = getHint();
    parts.root.style.visibility = "visible";
    requestAnimationFrame(() => {
      if (hintTarget === target) parts.root.style.opacity = "1";
    });
  };

  const hideHint = () => {
    if (hintTarget) hintTarget.removeAttribute("aria-describedby");
    hintTarget = null;
    if (!hint) return;
    hint.root.style.opacity = "0";
    window.setTimeout(() => {
      if (hint && !hintTarget) hint.root.style.visibility = "hidden";
    }, 120);
  };

  document.addEventListener(
    "click",
    (event) => {
      const target =
        event.target instanceof Element
          ? event.target.closest(heroLinkSelector)
          : null;
      if (!target) return;
      void (async () => {
        await prime();
        await playClickSoft();
      })();
    },
    { passive: true },
  );

  document.addEventListener(
    "pointerover",
    (event) => {
      const target =
        event.target instanceof Element
          ? event.target.closest(hoverSelector)
          : null;
      if (!target || target === lastHoverTarget) return;
      lastHoverTarget = target;
      if (primed) void playFidget();
      if (target.matches(hintSelector)) showHint(target);
    },
    { passive: true },
  );

  document.addEventListener(
    "pointerout",
    (event) => {
      const target =
        event.target instanceof Element
          ? event.target.closest(hoverSelector)
          : null;
      if (target === lastHoverTarget) {
        lastHoverTarget = null;
        hideHint();
      }
    },
    { passive: true },
  );

  document.addEventListener("focusin", (event) => {
    const target =
      event.target instanceof Element
        ? event.target.closest(hintSelector)
        : null;
    if (target) showHint(target);
  });

  document.addEventListener("focusout", (event) => {
    const target =
      event.target instanceof Element
        ? event.target.closest(hintSelector)
        : null;
    if (target === hintTarget) hideHint();
  });

  window.addEventListener("scroll", hideHint, { passive: true, capture: true });
  window.addEventListener(
    "resize",
    () => {
      if (hintTarget) positionHint(hintTarget);
    },
    { passive: true },
  );

  window.addEventListener("keydown", (event) => {
    if (event.altKey || event.metaKey || event.ctrlKey || event.shiftKey)
      return;
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement
    )
      return;

    const key = event.key.toLowerCase();
    if (key !== "v" && key !== "c") return;

    const link = document.querySelector('[data-hero-shortcut="' + key + '"]');
    if (!(link instanceof HTMLAnchorElement)) return;

    event.preventDefault();
    void (async () => {
      await prime();
      await playClickSoft();
      window.open(link.href, link.target || "_blank", "noopener,noreferrer");
    })();
  });
})();
