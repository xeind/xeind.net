(() => {
  if (window.__hero_interactions_loaded) return;
  window.__hero_interactions_loaded = true;

  let ctx = null;
  let primed = false;

  const getCtx = () => {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  };

  /* Ambient track — the one piece of music on the site, off on every load
     and switched by the footer's speaker button (ui/AmbientToggle.astro).
     The choice is not stored: it lasts the visit, across ClientRouter swaps,
     and a new load starts silent. Nothing here plays without a press.

     In the language of LEMMiNO's "Cipher (BGM)", measured from the track:
     A minor at 77 BPM, a sub on A1 in half notes with an 808 pitch drop, a
     dark saw pad on | Am | Am | C | D |, a plucked two-bar motif with a
     dotted-eighth echo, sixteenth hats accented on the off sixteenths, a
     syncopated kick. Four bars of intro before the beat, a four-bar
     breakdown every sixteen. Everything is oscillators and noise — no file,
     no bytes — scheduled a quarter second ahead on a timer, and torn down
     after the fade-out so a silent page costs no CPU. Sits above the pointer
     guard because the button has to work on a phone. /tmp/cipher_like.py
     renders the same tables for auditioning; the exception to
     docs/building.md's "nothing ambient" is written there. */
  const AMBIENT_GAIN = 0.12;
  const AMBIENT_FADE_IN = 2;
  const AMBIENT_FADE_OUT = 1.5;
  const AMBIENT_BPM = 77;
  const AMBIENT_BEAT = 60 / AMBIENT_BPM;
  const AMBIENT_BAR = 4 * AMBIENT_BEAT;
  const AMBIENT_LOOKAHEAD = 0.25;
  const AMBIENT_TICK_MS = 100;
  const AMBIENT_NOTES = {
    A1: 33,
    C2: 36,
    D2: 38,
    A2: 45,
    C3: 48,
    D3: 50,
    E3: 52,
    G3: 55,
    A3: 57,
    C4: 60,
    D4: 62,
    E4: 64,
    G4: 67,
    A4: 69,
    B4: 71,
    C5: 72,
    D5: 74,
  };
  /* [root for the sub, pad voicing] per bar of the four-bar loop. */
  const AMBIENT_CHORDS = [
    ["A1", ["A2", "E3", "A3", "C4", "E4"]],
    ["A1", ["A2", "E3", "A3", "C4", "E4"]],
    ["C2", ["C3", "G3", "C4", "E4", "G4"]],
    ["D2", ["D3", "A3", "D4", "E4", "A4"]],
  ];
  /* Two bars of eighths; null is a rest. */
  const AMBIENT_MOTIF = [
    ["A4", null, "G4", null, "E4", null, "D5", "C5"],
    ["A4", null, "G4", null, "E4", "B4", "A4", null],
  ];
  const AMBIENT_INTRO_BARS = 4;
  const AMBIENT_BREAK_EVERY = 16;
  const AMBIENT_BREAK_BARS = 4;
  const AMBIENT_KICK_BEATS = [0, 1.75, 2];
  /* Sixteenth slots: 1 accented, 0 plain, -1 silent — from the onset histogram. */
  const AMBIENT_HAT_ACCENT = [0, 1, 0, 1, 0, 1, 0, 0, 0, 0, -1, 0, 0, 1, 0, 0];
  const AMBIENT_LEVELS = {
    pad: -22,
    padIntro: -26,
    sub: -9,
    subIntro: -15,
    pluck: -18,
    kick: -12,
    hat: -36,
    hatAccent: -31,
    tick: -30,
  };
  const AMBIENT_ECHO = { seconds: (3 * AMBIENT_BEAT) / 4, feedback: 0.38, lowpass: 1800 };
  let ambient = null;

  let ambientOn = false;
  const ambientWanted = () => ambientOn;

  const syncAmbient = () => {
    const pressed = String(ambientWanted());
    document.querySelectorAll("[data-ambient-toggle]").forEach((button) => {
      button.setAttribute("aria-pressed", pressed);
    });
  };

  const noteHz = (midi) => 440 * 2 ** ((midi - 69) / 12);
  const dbToGain = (db) => 10 ** (db / 20);

  /* A gain that opens at `at`, decays on an exponential with time constant
     `tau`, and stops its source once the tail is gone. Every hit uses it. */
  const envelope = (audio, source, at, level, tau, into, length) => {
    const gain = audio.createGain();
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(level, at + 0.004);
    gain.gain.setTargetAtTime(0, at + 0.004, tau);
    source.connect(gain);
    gain.connect(into);
    source.start(at);
    source.stop(at + length);
    return gain;
  };

  const startAmbient = async () => {
    if (ambient) return;
    const audio = getCtx();
    if (audio.state === "suspended") await audio.resume();
    if (ambient || !ambientWanted()) return;

    const now = audio.currentTime;
    const master = audio.createGain();
    master.gain.setValueAtTime(0, now);
    master.gain.linearRampToValueAtTime(AMBIENT_GAIN, now + AMBIENT_FADE_IN);
    master.connect(audio.destination);

    /* Q is linear on a lowpass; 0.5 is critically damped. Q near 0 splits the
       poles and pulls the real cutoff down to a few hertz. */
    const lowpass = (hz, into) => {
      const filter = audio.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = hz;
      filter.Q.value = 0.5;
      filter.connect(into);
      return filter;
    };
    const bus = lowpass(5000, master);
    const padBus = lowpass(500, bus);

    /* The pluck's echo: a dotted eighth, three audible repeats, darkening. */
    const pluckBus = audio.createGain();
    pluckBus.connect(bus);
    const delay = audio.createDelay(2);
    delay.delayTime.value = AMBIENT_ECHO.seconds;
    const feedback = audio.createGain();
    feedback.gain.value = AMBIENT_ECHO.feedback;
    const echoTone = lowpass(AMBIENT_ECHO.lowpass, bus);
    pluckBus.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(echoTone);

    const wave = (partials) => {
      const real = new Float32Array(partials.length + 1);
      const imag = new Float32Array(partials.length + 1);
      partials.forEach((g, i) => (imag[i + 1] = g));
      return audio.createPeriodicWave(real, imag, { disableNormalization: true });
    };
    const saw = wave([1, 1 / 2, 1 / 3, 1 / 4, 1 / 5, 1 / 6, 1 / 7, 1 / 8]);
    const string = wave([1, 2, 3, 4, 5, 6].map((k) => k ** -0.7));

    const noise = audio.createBuffer(1, audio.sampleRate, audio.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

    /* Sub: sine on the root, pitch falling from 1.6× to 1× in the first
       tenth of a second, a tail long enough to meet the next hit. */
    const sub = (at, midi, level) => {
      const osc = audio.createOscillator();
      const hz = noteHz(midi);
      osc.frequency.setValueAtTime(hz * 1.6, at);
      osc.frequency.setTargetAtTime(hz, at, 1 / 18);
      envelope(audio, osc, at, dbToGain(level), 1 / 1.2, bus, 2.2);
    };

    /* Pad: each note twice, ±4 cents apart, saw partials to the 8th, into a
       500 Hz lowpass. One bar long with a slow rise and fall. */
    const pad = (at, names, level) => {
      const gain = audio.createGain();
      gain.gain.setValueAtTime(0, at);
      gain.gain.linearRampToValueAtTime(dbToGain(level), at + 0.8);
      gain.gain.setValueAtTime(dbToGain(level), at + AMBIENT_BAR - 0.8);
      gain.gain.linearRampToValueAtTime(0, at + AMBIENT_BAR + 0.4);
      gain.connect(padBus);
      for (const name of names) {
        for (const cents of [-4, 4]) {
          const osc = audio.createOscillator();
          osc.setPeriodicWave(saw);
          osc.frequency.value = noteHz(AMBIENT_NOTES[name]);
          osc.detune.value = cents;
          osc.connect(gain);
          osc.start(at);
          osc.stop(at + AMBIENT_BAR + 0.5);
        }
      }
    };

    /* Pluck: bright at the strike, its own lowpass closing in a tenth of a
       second, the body gone in under half. Into the echo bus. */
    const pluck = (at, midi, level) => {
      const osc = audio.createOscillator();
      osc.setPeriodicWave(string);
      osc.frequency.value = noteHz(midi);
      const tone = audio.createBiquadFilter();
      tone.type = "lowpass";
      tone.Q.value = 0.5;
      tone.frequency.setValueAtTime(2900, at);
      tone.frequency.setTargetAtTime(300, at, 1 / 9);
      tone.connect(pluckBus);
      envelope(audio, osc, at, dbToGain(level), 1 / 4.5, tone, 1.6);
    };

    const kick = (at, level) => {
      const osc = audio.createOscillator();
      osc.frequency.setValueAtTime(192, at);
      osc.frequency.setTargetAtTime(48, at, 1 / 40);
      envelope(audio, osc, at, dbToGain(level), 1 / 12, bus, 0.4);
    };

    /* Hat and tick: the same noise through a highpass, only the decay differs. */
    const hat = (at, level, tau) => {
      const source = audio.createBufferSource();
      source.buffer = noise;
      source.loop = true;
      const top = audio.createBiquadFilter();
      top.type = "highpass";
      top.frequency.value = 4000;
      top.Q.value = 0.5;
      top.connect(bus);
      envelope(audio, source, at, dbToGain(level), tau, top, 0.1);
    };

    /* The arrangement, one bar at a time, scheduled a quarter second ahead
       on a timer — a timer alone drifts, audio time does not. */
    const scheduleBar = (bar, at) => {
      const [root, voicing] = AMBIENT_CHORDS[bar % AMBIENT_CHORDS.length];
      const inBreak = bar % AMBIENT_BREAK_EVERY >= AMBIENT_BREAK_EVERY - AMBIENT_BREAK_BARS;
      const full = bar >= AMBIENT_INTRO_BARS && !inBreak;
      pad(at, voicing, full ? AMBIENT_LEVELS.pad : AMBIENT_LEVELS.padIntro);
      if (bar >= 2) {
        for (const half of [0, 2])
          sub(
            at + half * AMBIENT_BEAT,
            AMBIENT_NOTES[root],
            full ? AMBIENT_LEVELS.sub : AMBIENT_LEVELS.subIntro,
          );
      }
      AMBIENT_MOTIF[bar % 2].forEach((name, i) => {
        if (name && !(inBreak && i % 2))
          pluck(at + (i * AMBIENT_BEAT) / 2, AMBIENT_NOTES[name], AMBIENT_LEVELS.pluck);
      });
      if (!full) return;
      for (const beat of AMBIENT_KICK_BEATS) kick(at + beat * AMBIENT_BEAT, AMBIENT_LEVELS.kick);
      AMBIENT_HAT_ACCENT.forEach((accent, slot) => {
        if (accent < 0) return;
        hat(
          at + (slot * AMBIENT_BEAT) / 4,
          accent ? AMBIENT_LEVELS.hatAccent : AMBIENT_LEVELS.hat,
          slot % 4 ? 1 / 90 : 1 / 40,
        );
      });
      hat(at + 2 * AMBIENT_BEAT, AMBIENT_LEVELS.tick, 1 / 25);
    };

    const state = { master, timer: 0, bar: 0, nextBar: now + 0.1 };
    const tick = () => {
      while (state.nextBar < audio.currentTime + AMBIENT_LOOKAHEAD) {
        scheduleBar(state.bar, state.nextBar);
        state.bar += 1;
        state.nextBar += AMBIENT_BAR;
      }
    };
    tick();
    state.timer = window.setInterval(tick, AMBIENT_TICK_MS);
    ambient = state;
  };

  const stopAmbient = () => {
    if (!ambient) return;
    const { master, timer } = ambient;
    ambient = null;
    window.clearInterval(timer);
    const audio = getCtx();
    const now = audio.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(0, now + AMBIENT_FADE_OUT);
    /* Everything already scheduled has its own stop time; cutting the master
       off after the fade is what silences the bar in flight. */
    window.setTimeout(() => master.disconnect(), (AMBIENT_FADE_OUT + 0.2) * 1000);
  };

  document.addEventListener("click", (event) => {
    const target =
      event.target instanceof Element ? event.target.closest("[data-ambient-toggle]") : null;
    if (!target) return;
    ambientOn = !ambientOn;
    syncAmbient();
    if (ambientOn) void startAmbient();
    else stopAmbient();
  });

  syncAmbient();
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
     tonal "ding" would be the only struck note on the site outside the
     ambient track, which is opt-in and a different thing. Fired by the
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
