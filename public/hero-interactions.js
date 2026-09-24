(() => {
  if (window.__hero_interactions_loaded) return;
  window.__hero_interactions_loaded = true;

  let ctx = null;
  let primed = false;

  const getCtx = () => {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  };

  /* Ambient track — one recording per colour theme, off on every load and
     switched by the footer's speaker button (ui/AmbientToggle.astro). The
     choice is not stored: it lasts the visit, across ClientRouter swaps, and
     a new load starts silent. Nothing here plays without a press.

     The files are licensed loops (Epidemic Sound), so they never enter git:
     they live in the R2 bucket `xeind-media` behind media.xeind.net, and
     public/ambient/ is ignored. Each file is 56–80 s, seamless, loudness-matched
     to -20 LUFS, Opus with an AAC twin for Safari, about 500 KB. The element
     is created on the press with preload none, so nothing loads before it
     and Lighthouse never sees it. It plays through the same AudioContext as
     the clicks, which is what gives the fades — and on iOS the only way to
     fade at all, since a media element's volume is read-only there. Sits
     above the pointer guard because the button has to work on a phone. */
  const AMBIENT_BASE = "https://media.xeind.net/ambient";
  const AMBIENT_FILES = {
    dark: "manila",
    light: "kozo",
    nightingale: "nightingale",
    blueprint: "blueprint",
  };
  const AMBIENT_GAIN = 0.5;
  const AMBIENT_FADE_IN = 2;
  const AMBIENT_FADE_OUT = 1.5;

  const currentTheme = () => document.documentElement.dataset.theme || "light";
  let ambient = null;

  let ambientOn = false;
  const ambientWanted = () => ambientOn;

  const syncAmbient = () => {
    const pressed = String(ambientWanted());
    document.querySelectorAll("[data-ambient-toggle]").forEach((button) => {
      button.setAttribute("aria-pressed", pressed);
    });
  };

  /* Opus in Ogg where it plays, AAC where it does not (Safari before 17.4). */
  const ambientSrc = (name) => {
    const probe = document.createElement("audio");
    const opus = probe.canPlayType('audio/ogg; codecs="opus"');
    return `${AMBIENT_BASE}/${name}.${opus ? "opus" : "m4a"}`;
  };

  /* One track per theme, made on first need and kept for the visit. A
     theme switch only moves the gains: the track leaving fades to nothing
     but keeps running, so coming back picks it up where it got to instead
     of from the top. Off pauses every track in place; on resumes the
     current theme's from there. A muted, looping element costs nothing
     worth measuring, and at most four exist. */
  const tracks = new Map();

  const rampTo = (track, level, seconds) => {
    const audio = getCtx();
    const now = audio.currentTime;
    track.gain.gain.cancelScheduledValues(now);
    track.gain.gain.setValueAtTime(track.gain.gain.value, now);
    track.gain.gain.linearRampToValueAtTime(level, now + seconds);
  };

  const trackFor = (theme) => {
    const key = AMBIENT_FILES[theme] ? theme : "dark";
    if (tracks.has(key)) return tracks.get(key);
    const audio = getCtx();
    const element = new Audio();
    element.crossOrigin = "anonymous";
    element.loop = true;
    element.preload = "none";
    element.src = ambientSrc(AMBIENT_FILES[key]);
    const gain = audio.createGain();
    gain.gain.value = 0;
    gain.connect(audio.destination);
    audio.createMediaElementSource(element).connect(gain);
    const track = { element, gain };
    tracks.set(key, track);
    return track;
  };

  const startAmbient = async () => {
    const audio = getCtx();
    if (audio.state === "suspended") await audio.resume();
    if (!ambientWanted()) return;
    const theme = currentTheme();
    const track = trackFor(theme);
    ambient = { theme };
    for (const other of tracks.values()) {
      if (other !== track && other.gain.gain.value > 0) rampTo(other, 0, AMBIENT_FADE_OUT);
    }
    try {
      if (track.element.paused) await track.element.play();
    } catch {
      /* Refused (no gesture, or the file is missing): leave the switch
         honest and let the next press try again. */
      if (ambient && ambient.theme === theme) {
        ambient = null;
        ambientOn = false;
        syncAmbient();
      }
      return;
    }
    if (ambient && ambient.theme === theme) rampTo(track, AMBIENT_GAIN, AMBIENT_FADE_IN);
  };

  const stopAmbient = () => {
    if (!ambient) return;
    ambient = null;
    for (const track of tracks.values()) rampTo(track, 0, AMBIENT_FADE_OUT);
    window.setTimeout(
      () => {
        if (ambient) return;
        for (const track of tracks.values()) track.element.pause();
      },
      (AMBIENT_FADE_OUT + 0.2) * 1000,
    );
  };

  /* iOS lets a media element start only if play() was first called on it
     inside a tap. The theme observer below starts the new theme's element
     with no tap behind it, so on a phone a theme switch with the sound on
     went quiet and the button fell back to off. Make every theme's element
     on the press and start each one there, synchronously, while the tap
     still counts; the ones not wanted pause as soon as they start. Their
     gain is 0, so nothing is heard, and a paused element stops buffering. */
  const blessTracks = () => {
    for (const theme of Object.keys(AMBIENT_FILES)) {
      const track = trackFor(theme);
      if (track.blessed) continue;
      track.blessed = true;
      const started = track.element.play();
      if (!started) continue;
      started
        .then(() => {
          if (!ambient || ambient.theme !== theme) track.element.pause();
        })
        .catch(() => {});
    }
  };

  /* Each theme has its own track: when the reader changes theme while the
     sound is on, the gains cross — nothing restarts. */
  new MutationObserver(() => {
    if (!ambient || ambient.theme === currentTheme()) return;
    void startAmbient();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  document.addEventListener("click", (event) => {
    const target =
      event.target instanceof Element ? event.target.closest("[data-ambient-toggle]") : null;
    if (!target) return;
    ambientOn = !ambientOn;
    syncAmbient();
    if (ambientOn) {
      blessTracks();
      void startAmbient();
    } else stopAmbient();
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
     tonal "ding" would be the only musical note the site makes itself; the
     ambient track is a recording, opt-in, and a different thing. Fired by the
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
