(() => {
  if (window.__hero_interactions_loaded) return;
  window.__hero_interactions_loaded = true;

  let ctx = null;
  let primed = false;

  const getCtx = () => {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  };

  /* Ambient drone — the one sustained sound on the site, off by default and
     switched by the footer's speaker button (ui/AmbientToggle.astro). A=432
     with every interval exact, so nothing beats; free-running LFOs, so nothing
     loops. Built from oscillators — no file, no fetch, no bytes — and torn
     down after the fade-out so a silent page costs no CPU. Sits above the
     pointer guard because the button has to work on a phone. The exception to
     docs/building.md's "nothing ambient" is written there. */
  const AMBIENT_KEY = "ambient";
  const AMBIENT_GAIN = 0.04;
  const AMBIENT_FADE_IN = 2;
  const AMBIENT_FADE_OUT = 1.5;
  /* hz, gain, pan, lfo hz, fixed detune in cents, triangle wave */
  const AMBIENT_VOICES = [
    [108, 1.0, 0, 0.031, 0, true],
    [162, 0.55, -0.35, 0.047, 2.5, false],
    [216, 0.42, 0.3, 0.059, -2, false],
    [324, 0.26, -0.22, 0.073, 1.5, false],
    [432, 0.3, 0.18, 0.109, -1, false],
  ];
  /* ±0.15% of pitch, in cents: 1200 · log2(1.0015). */
  const AMBIENT_DRIFT_CENTS = 2.6;
  let drone = null;

  const ambientWanted = () => localStorage.getItem(AMBIENT_KEY) === "on";

  const syncAmbient = () => {
    const pressed = String(ambientWanted());
    document.querySelectorAll("[data-ambient-toggle]").forEach((button) => {
      button.setAttribute("aria-pressed", pressed);
    });
  };

  /* A slow sine into an AudioParam: `depth` is the swing either side of the
     param's own value, which stays as the centre. */
  const modulate = (audio, hz, depth, param) => {
    const osc = audio.createOscillator();
    osc.frequency.value = hz;
    const scale = audio.createGain();
    scale.gain.value = depth;
    osc.connect(scale);
    scale.connect(param);
    osc.start();
    return osc;
  };

  const startDrone = async () => {
    if (drone) return;
    const audio = getCtx();
    if (audio.state === "suspended") await audio.resume();
    if (drone || !ambientWanted()) return;

    const now = audio.currentTime;
    const sources = [];
    const master = audio.createGain();
    master.gain.setValueAtTime(0, now);
    master.gain.linearRampToValueAtTime(AMBIENT_GAIN, now + AMBIENT_FADE_IN);
    master.connect(audio.destination);

    /* One lowpass over the whole stack, its cutoff breathing 610–950 Hz. */
    const lowpass = audio.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 780;
    lowpass.Q.value = 0;
    lowpass.connect(master);
    sources.push(modulate(audio, 0.023, 170, lowpass.frequency));

    /* Band-limited triangle for the root: odd harmonics to the 13th, 1/n²,
       alternating sign. The built-in triangle runs to Nyquist and is harsher. */
    const real = new Float32Array(14);
    const imag = new Float32Array(14);
    for (let n = 1, sign = 1; n <= 13; n += 2, sign = -sign) imag[n] = sign / (n * n);
    const triangle = audio.createPeriodicWave(real, imag, { disableNormalization: true });

    for (const [hz, gain, pan, lfoHz, cents, isTriangle] of AMBIENT_VOICES) {
      const osc = audio.createOscillator();
      if (isTriangle) osc.setPeriodicWave(triangle);
      else osc.type = "sine";
      osc.frequency.value = hz;
      osc.detune.value = cents;
      /* Pitch and level drift on the same LFO, so each voice swells as it
         sharpens — the breathing. Gain sits at 0.88 and swings ±0.12. */
      const level = audio.createGain();
      level.gain.value = gain * 0.88;
      const drift = modulate(audio, lfoHz, AMBIENT_DRIFT_CENTS, osc.detune);
      const swell = audio.createGain();
      swell.gain.value = gain * 0.12;
      drift.connect(swell);
      swell.connect(level.gain);
      const panner = audio.createStereoPanner();
      panner.pan.value = pan;
      osc.connect(level);
      level.connect(panner);
      panner.connect(lowpass);
      osc.start();
      sources.push(osc, drift);
    }

    /* The bed: filtered noise, the same vocabulary as the site's clicks. Two
       seconds of white noise on a loop, rolled off at 70 Hz to a soft rumble. */
    const noise = audio.createBufferSource();
    const buffer = audio.createBuffer(1, audio.sampleRate * 2, audio.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    noise.buffer = buffer;
    noise.loop = true;
    const rumble = audio.createBiquadFilter();
    rumble.type = "lowpass";
    rumble.frequency.value = 70;
    rumble.Q.value = 0;
    const bed = audio.createGain();
    bed.gain.value = 0.9;
    noise.connect(rumble);
    rumble.connect(bed);
    bed.connect(lowpass);
    noise.start();
    sources.push(noise);

    drone = { master, sources };
  };

  const stopDrone = () => {
    if (!drone) return;
    const { master, sources } = drone;
    drone = null;
    const audio = getCtx();
    const now = audio.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(0, now + AMBIENT_FADE_OUT);
    sources.forEach((source) => source.stop(now + AMBIENT_FADE_OUT + 0.1));
    window.setTimeout(() => master.disconnect(), (AMBIENT_FADE_OUT + 0.2) * 1000);
  };

  /* A saved "on" cannot start on load: the context needs a gesture. Wait for
     the first one anywhere on the page — unless it is on the switch itself,
     which is about to turn the sound off. A reader who asked for less data
     gets the saved choice dropped, not the button. */
  const resumeAmbient = () => {
    if (!ambientWanted()) return;
    const saveData =
      (navigator.connection && navigator.connection.saveData) ||
      window.matchMedia("(prefers-reduced-data: reduce)").matches;
    if (saveData) {
      localStorage.setItem(AMBIENT_KEY, "off");
      syncAmbient();
      return;
    }
    const onGesture = (event) => {
      if (event.target instanceof Element && event.target.closest("[data-ambient-toggle]")) return;
      window.removeEventListener("pointerdown", onGesture, true);
      window.removeEventListener("keydown", onGesture, true);
      void startDrone();
    };
    window.addEventListener("pointerdown", onGesture, true);
    window.addEventListener("keydown", onGesture, true);
  };

  document.addEventListener("click", (event) => {
    const target =
      event.target instanceof Element ? event.target.closest("[data-ambient-toggle]") : null;
    if (!target) return;
    const on = !ambientWanted();
    localStorage.setItem(AMBIENT_KEY, on ? "on" : "off");
    syncAmbient();
    if (on) void startDrone();
    else stopDrone();
  });

  syncAmbient();
  resumeAmbient();
  document.addEventListener("astro:after-swap", syncAmbient);

  if (!window.matchMedia("(pointer: fine)").matches) return;

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
    const buf = audio.createBuffer(1, audio.sampleRate * 0.012, audio.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / 80);
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
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / 15);
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

  /* Copy-confirm: two taps, the second brighter and a touch louder — the
     sound of something seating. Same noise-burst language as the clicks; a
     tonal "ding" would be the only struck note on the site — the drone above
     is sustained and opt-in, which is a different thing. Fired by the
     email button via the hero:copy-confirm event once the clipboard write
     has actually resolved, so the sound lands with the checkmark swap. */
  const playConfirm = async () => {
    const audio = getCtx();
    if (audio.state === "suspended") await audio.resume();

    const tap = (at, freq, gainValue, decay) => {
      const noise = audio.createBufferSource();
      const buf = audio.createBuffer(1, audio.sampleRate * 0.014, audio.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++)
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / decay);
      noise.buffer = buf;
      const filter = audio.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = freq;
      filter.Q.value = 2.5;
      const gain = audio.createGain();
      gain.gain.value = gainValue;
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audio.destination);
      noise.start(at);
    };

    const now = audio.currentTime;
    tap(now, 2600, 0.16, 70);
    tap(now + 0.07, 4200, 0.22, 90);
  };

  window.addEventListener("hero:copy-confirm", () => {
    void playConfirm();
  });

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
      "position:fixed;z-index:9999;pointer-events:none;visibility:hidden;opacity:0;transition:opacity 120ms cubic-bezier(0.215,0.61,0.355,1);";

    const svg = document.createElementNS(SVG_NS, "svg");
    svg.style.display = "block";

    const path = document.createElementNS(SVG_NS, "path");
    path.style.fill = "var(--color-card)";
    path.style.stroke = "color-mix(in srgb, var(--color-accent) 30%, transparent)";
    path.setAttribute("stroke-width", "1");
    path.setAttribute("stroke-dasharray", "3 2");

    const text = document.createElementNS(SVG_NS, "text");
    text.setAttribute("text-anchor", "middle");
    text.style.fill = "color-mix(in srgb, var(--color-foreground) 80%, transparent)";
    text.style.fontFamily = "var(--font-sans)";
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
    parts.text.setAttribute("y", String(1 + HINT_PAD_Y + Math.ceil(textBox.height) * 0.82));

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
        event.target instanceof Element ? event.target.closest(heroLinkSelector) : null;
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
      const target = event.target instanceof Element ? event.target.closest(hoverSelector) : null;
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
      const target = event.target instanceof Element ? event.target.closest(hoverSelector) : null;
      if (target === lastHoverTarget) {
        lastHoverTarget = null;
        hideHint();
      }
    },
    { passive: true },
  );

  document.addEventListener("focusin", (event) => {
    const target = event.target instanceof Element ? event.target.closest(hintSelector) : null;
    if (target) showHint(target);
  });

  document.addEventListener("focusout", (event) => {
    const target = event.target instanceof Element ? event.target.closest(hintSelector) : null;
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
    if (event.altKey || event.metaKey || event.ctrlKey || event.shiftKey) return;
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement
    )
      return;

    const key = event.key.toLowerCase();
    if (key !== "r" && key !== "c") return;

    const link = document.querySelector('[data-hero-shortcut="' + key + '"]');
    if (!(link instanceof HTMLAnchorElement)) return;

    event.preventDefault();
    void (async () => {
      await prime();
      await playClickSoft();
      window.open(link.href, link.target || "_blank", "noopener,noreferrer");
    })();
  });

  /* Re-prime audio after ClientRouter navigations */
  document.addEventListener("astro:after-swap", () => {
    primed = false;
  });
})();
