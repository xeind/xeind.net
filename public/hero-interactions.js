(() => {
  if (window.__hero_interactions_loaded) return;
  window.__hero_interactions_loaded = true;

  let ctx = null;
  let primed = false;

  const getCtx = () => {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  };

  /* Ambient pad — the one sustained sound on the site, off by default and
     switched by the footer's speaker button (ui/AmbientToggle.astro).
     Modelled on shreygups.com's 432 Hz loop, which is not a drone but a slow
     vamp: B-flat, C, B-flat, C, with an E-flat turn, each chord a fixed
     voicing held seven to nine seconds, every note shimmering on its own
     wobble, and a flat 432 Hz sine laid over the top. Tuned to A=432 so the
     tone is the chord's own A and nothing beats. Chords are drawn at random
     so nothing loops. Synthesised — no file, no bytes — and torn down after
     the fade-out so a silent page costs no CPU. Sits above the pointer guard
     because the button has to work on a phone. /tmp/pad_432.py renders the
     same tables for auditioning; the exception to docs/building.md's
     "nothing ambient" is written there. */
  const AMBIENT_KEY = "ambient";
  const AMBIENT_GAIN = 0.022;
  const AMBIENT_FADE_IN = 2;
  const AMBIENT_FADE_OUT = 1.5;
  const AMBIENT_A4 = 432;
  const AMBIENT_NOTES = {
    Bb1: 34,
    C2: 36,
    Eb2: 39,
    Bb2: 46,
    C3: 48,
    D3: 50,
    Eb3: 51,
    E3: 52,
    F3: 53,
    G3: 55,
    Bb3: 58,
    C4: 60,
    D4: 62,
    E4: 64,
    F4: 65,
    G4: 67,
  };
  /* Voicings in dB under the loudest note, read off the reference's STFT. */
  const AMBIENT_CHORDS = {
    Bb: { Bb1: -10, Bb2: 0, D3: -6, F3: -4, Bb3: -12, C4: -8, D4: -7, F4: -18, G4: -12 },
    C: { C2: -14, C3: 0, E3: -10, G3: -6, C4: -6, D4: -14, E4: -12, G4: -10 },
    Eb: { Eb2: -4, Eb3: -2, F3: -2, G3: -10, Bb2: -5, Bb3: -12, C4: -10, G4: -14 },
  };
  const AMBIENT_NEXT = { Bb: ["C", "C", "C", "Eb"], C: ["Bb"], Eb: ["Bb"] };
  const AMBIENT_CHORD_SECONDS = [7, 9];
  const AMBIENT_CROSSFADE_TAU = 0.8;
  const AMBIENT_PARTIALS = [1, 0.35, 0.12];
  const AMBIENT_WOBBLE_HZ = [0.08, 0.35];
  const AMBIENT_WOBBLE_DEPTH = 0.45;
  const AMBIENT_DRIFT_CENTS = 3;
  const AMBIENT_DRIFT_HZ = [0.03, 0.11];
  const AMBIENT_TONE_DB = -8;
  const AMBIENT_LOWPASS_HZ = 700;
  const AMBIENT_LOWPASS_SWEEP = 150;
  const AMBIENT_LOWPASS_SWEEP_HZ = 0.02;
  const AMBIENT_BED_GAIN = 0.5;
  let pad = null;

  const ambientWanted = () => localStorage.getItem(AMBIENT_KEY) === "on";

  const syncAmbient = () => {
    const pressed = String(ambientWanted());
    document.querySelectorAll("[data-ambient-toggle]").forEach((button) => {
      button.setAttribute("aria-pressed", pressed);
    });
  };

  const between = ([lo, hi]) => lo + Math.random() * (hi - lo);
  const noteHz = (midi) => AMBIENT_A4 * 2 ** ((midi - 69) / 12);
  const dbToGain = (db) => 10 ** (db / 20);

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

  const startPad = async () => {
    if (pad) return;
    const audio = getCtx();
    if (audio.state === "suspended") await audio.resume();
    if (pad || !ambientWanted()) return;

    const now = audio.currentTime;
    const sources = [];
    const master = audio.createGain();
    master.gain.setValueAtTime(0, now);
    master.gain.linearRampToValueAtTime(AMBIENT_GAIN, now + AMBIENT_FADE_IN);
    master.connect(audio.destination);

    /* One lowpass over the whole pad, its cutoff breathing 550–850 Hz — the
       reference falls away fast above a kilohertz. Q is linear here and 0.5
       is critically damped, the nearest a biquad gets to the one-pole in the
       render. Q near 0 splits the poles and pulls the real cutoff down to a
       few hertz, which once left only the lowest note. */
    const lowpass = audio.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = AMBIENT_LOWPASS_HZ;
    lowpass.Q.value = 0.5;
    lowpass.connect(master);
    sources.push(
      modulate(audio, AMBIENT_LOWPASS_SWEEP_HZ, AMBIENT_LOWPASS_SWEEP, lowpass.frequency),
    );

    /* Every note in the pool runs the whole time; the chords only move the
       levels. A note's timbre is a fundamental with a soft octave and twelfth. */
    const real = new Float32Array(AMBIENT_PARTIALS.length + 1);
    const imag = new Float32Array(AMBIENT_PARTIALS.length + 1);
    AMBIENT_PARTIALS.forEach((gain, i) => (imag[i + 1] = gain));
    const timbre = audio.createPeriodicWave(real, imag, { disableNormalization: true });

    const levels = {};
    for (const [name, midi] of Object.entries(AMBIENT_NOTES)) {
      const osc = audio.createOscillator();
      osc.setPeriodicWave(timbre);
      osc.frequency.value = noteHz(midi);
      sources.push(modulate(audio, between(AMBIENT_DRIFT_HZ), AMBIENT_DRIFT_CENTS, osc.detune));
      /* The shimmer: level × (1 + depth · sin), each note on its own rate. */
      const wobble = audio.createGain();
      wobble.gain.value = 1;
      sources.push(modulate(audio, between(AMBIENT_WOBBLE_HZ), AMBIENT_WOBBLE_DEPTH, wobble.gain));
      const level = audio.createGain();
      level.gain.value = 0;
      osc.connect(wobble);
      wobble.connect(level);
      level.connect(lowpass);
      osc.start();
      sources.push(osc);
      levels[name] = level.gain;
    }

    /* The tone itself: a flat 432 Hz sine, under the chord, never moving. */
    const tone = audio.createOscillator();
    tone.frequency.value = AMBIENT_A4;
    const toneLevel = audio.createGain();
    toneLevel.gain.value = dbToGain(AMBIENT_TONE_DB);
    tone.connect(toneLevel);
    toneLevel.connect(lowpass);
    tone.start();
    sources.push(tone);

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
    rumble.Q.value = 0.5;
    const bed = audio.createGain();
    bed.gain.value = AMBIENT_BED_GAIN;
    noise.connect(rumble);
    rumble.connect(bed);
    bed.connect(lowpass);
    noise.start();
    sources.push(noise);

    /* The vamp. Each chord sets every note's target and the levels glide
       there on one time constant, so notes shared by both chords hold and
       the rest cross-fade. The next chord is drawn, not stepped. */
    const state = { master, sources, timer: 0, chord: "Bb" };
    const step = () => {
      const voicing = AMBIENT_CHORDS[state.chord];
      const at = audio.currentTime;
      for (const [name, param] of Object.entries(levels)) {
        const db = voicing[name];
        param.setTargetAtTime(db === undefined ? 0 : dbToGain(db), at, AMBIENT_CROSSFADE_TAU);
      }
      const options = AMBIENT_NEXT[state.chord];
      state.chord = options[Math.floor(Math.random() * options.length)];
      state.timer = window.setTimeout(step, between(AMBIENT_CHORD_SECONDS) * 1000);
    };
    step();
    pad = state;
  };

  const stopPad = () => {
    if (!pad) return;
    const { master, sources, timer } = pad;
    pad = null;
    window.clearTimeout(timer);
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
      void startPad();
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
    if (on) void startPad();
    else stopPad();
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
     tonal "ding" would be the only struck note on the site — the pad above
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
