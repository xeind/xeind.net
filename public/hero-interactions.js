(() => {
  if (window.__hero_interactions_loaded) return;
  window.__hero_interactions_loaded = true;

  let ctx = null;
  let primed = false;

  const getCtx = () => {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  };

  /* Ambient track — the one piece of music on the site, one song per
     colour theme, off on every load and switched by the footer's speaker
     button (ui/AmbientToggle.astro).
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
  const AMBIENT_FADE_IN = 2;
  const AMBIENT_FADE_OUT = 1.5;
  const AMBIENT_LOOKAHEAD = 0.25;
  const AMBIENT_TICK_MS = 100;

  /* One song per colour theme, keyed by the data-theme value (Kozo has none
     and is "light"). The shape is the song spec in /tmp/songs/README.md;
     render_song.py there plays the same fields, so a JSON auditioned with
     afplay is pasted here unchanged. Every field is read; none is optional. */
  const AMBIENT_SONGS = {
    dark: {
      name: "manila",
      bpm: 77,
      a4: 440,
      gain: 0.12,
      renderDb: -20,
      seed: 11,
      notes: {
        F1: 29,
        G1: 31,
        A1: 33,
        C2: 36,
        D2: 38,
        E2: 40,
        D3: 50,
        E3: 52,
        F3: 53,
        G3: 55,
        "G#3": 56,
        A3: 57,
        B3: 59,
        C4: 60,
        D4: 62,
        E4: 64,
        F4: 65,
        G4: 67,
        "G#4": 68,
        A4: 69,
        B4: 71,
        C5: 72,
        D5: 74,
        E5: 76,
      },
      chords: [
        ["A1", ["E3", "A3", "C4", "E4"]],
        ["F1", ["F3", "A3", "C4", "F4"]],
        ["C2", ["E3", "G3", "C4", "E4"]],
        ["G1", ["D3", "G3", "B3", "D4"]],
        ["A1", ["E3", "A3", "C4", "E4"]],
        ["F1", ["F3", "A3", "C4", "F4"]],
        ["D2", ["F3", "A3", "D4", "F4"]],
        ["E2", ["E3", "G#3", "B3", "E4"]],
      ],
      motif: [
        ["E5", null, null, "C5", null, "A4", null, "B4"],
        ["C5", null, null, "A4", null, "F4", null, null],
        ["E5", null, null, "C5", null, "G4", null, "C5"],
        ["D5", null, null, "B4", null, "G4", null, null],
        ["E5", null, null, "C5", null, "A4", null, "B4"],
        ["C5", null, null, "A4", null, "F4", null, "G4"],
        ["A4", null, "F4", null, "D4", null, null, "E4"],
        ["E4", null, null, "G#4", null, "B4", null, null],
      ],
      introBars: 2,
      breakEvery: 16,
      breakBars: 2,
      drums: true,
      levels: {
        pad: -21,
        padIntro: -25,
        sub: -9,
        subIntro: -15,
        pluck: -16,
        kick: -11,
        hat: -36,
        hatAccent: -31,
        tick: -30,
      },
      pad: {
        lowpass: 500,
        partials: [1, 0.5, 0.333, 0.25, 0.2, 0.167, 0.143, 0.125],
        detune: 4,
        attack: 0.5,
        release: 1.0,
      },
      pluck: {
        partials: [1, 0.616, 0.463, 0.379, 0.324, 0.285],
        decayTau: 0.24,
        brightHz: 2900,
        closedHz: 300,
        closeTau: 0.111,
        length: 1.6,
      },
      sub: {
        fromBar: 1,
        beats: [0, 2],
        dropRatio: 1.6,
        dropTau: 0.055,
        decayTau: 0.83,
        length: 2.2,
      },
      kick: {
        beats: [0, 1.75, 2],
        startHz: 192,
        endHz: 48,
        dropTau: 0.025,
        decayTau: 0.1,
        length: 0.4,
      },
      hat: {
        highpass: 4000,
        accent: [0, 0, 0, 1, 1, 0, 0, 1, 0, 0, -1, 0, 1, 0, 1, 0],
        accentTau: 0.011,
        beatTau: 0.025,
        tickBeats: [1, 3],
        tickTau: 0.04,
      },
      echo: {
        beats: 0.75,
        feedback: 0.4,
        lowpass: 1800,
      },
      bus: {
        lowpass: 5000,
      },
    },
    light: {
      name: "kozo",
      bpm: 68,
      a4: 440,
      gain: 0.12,
      renderDb: -20,
      seed: 7,
      notes: {
        A1: 33,
        D2: 38,
        G2: 43,
        E3: 52,
        G3: 55,
        A3: 57,
        B3: 59,
        D3: 50,
        D4: 62,
        E4: 64,
        "F#4": 66,
        G4: 67,
        A4: 69,
        B4: 71,
        "C#5": 73,
        D5: 74,
      },
      chords: [
        ["D2", ["D3", "A3", "D4", "F#4", "A4"]],
        ["D2", ["D3", "A3", "D4", "F#4", "A4"]],
        ["G2", ["G3", "D4", "G4", "A4", "B4"]],
        ["A1", ["E3", "A3", "B3", "E4", "A4"]],
      ],
      motif: [
        ["F#4", null, "A4", null, "D5", null, "B4", "A4"],
        ["A4", null, "F#4", null, "E4", "D4", "E4", null],
      ],
      introBars: 4,
      breakEvery: 16,
      breakBars: 4,
      drums: false,
      levels: {
        pad: -21,
        padIntro: -25,
        sub: -14,
        subIntro: -19,
        pluck: -17,
        kick: -12,
        hat: -36,
        hatAccent: -31,
        tick: -30,
      },
      pad: {
        lowpass: 760,
        partials: [1, 0.5, 0.25, 0.167, 0.125, 0.1],
        detune: 3,
        attack: 1.2,
        release: 1.6,
      },
      pluck: {
        partials: [1, 0.4, 0.28, 0.14, 0.09, 0.05],
        decayTau: 0.42,
        brightHz: 4200,
        closedHz: 450,
        closeTau: 0.16,
        length: 2.4,
      },
      sub: {
        fromBar: 2,
        beats: [0, 2],
        dropRatio: 1.15,
        dropTau: 0.08,
        decayTau: 0.78,
        length: 2.6,
      },
      kick: {
        beats: [0, 1.75, 2],
        startHz: 192,
        endHz: 48,
        dropTau: 0.025,
        decayTau: 0.083,
        length: 0.4,
      },
      hat: {
        highpass: 4000,
        accent: [0, 1, 0, 1, 0, 1, 0, 0, 0, 0, -1, 0, 0, 1, 0, 0],
        accentTau: 0.011,
        beatTau: 0.025,
        tickBeats: [2],
        tickTau: 0.04,
      },
      echo: {
        beats: 0.75,
        feedback: 0.34,
        lowpass: 2600,
      },
      bus: {
        lowpass: 6500,
      },
    },
    nightingale: {
      name: "nightingale",
      bpm: 68,
      a4: 440,
      gain: 0.12,
      renderDb: -20,
      seed: 23,
      notes: {
        Bb1: 34,
        C2: 36,
        D2: 38,
        F2: 41,
        Bb2: 46,
        C3: 48,
        D3: 50,
        F3: 53,
        G3: 55,
        A3: 57,
        Bb3: 58,
        C4: 60,
        D4: 62,
        E4: 64,
        F4: 65,
        G4: 67,
        A4: 69,
        C5: 72,
        D5: 74,
      },
      chords: [
        ["D2", ["D3", "A3", "C4", "E4", "A4"]],
        ["Bb1", ["Bb2", "F3", "Bb3", "D4", "A4"]],
        ["F2", ["F3", "C4", "E4", "G4", "C5"]],
        ["C2", ["C3", "G3", "C4", "E4", "G4"]],
      ],
      motif: [
        ["A4", null, "D5", "C5", null, "A4", null, null],
        ["F4", null, "A4", null, "D5", "C5", "A4", null],
        ["C5", null, "A4", null, "G4", null, "E4", "F4"],
        ["G4", null, "E4", "G4", null, "C5", null, "D5"],
      ],
      introBars: 4,
      breakEvery: 16,
      breakBars: 4,
      drums: true,
      levels: {
        pad: -21,
        padIntro: -25,
        sub: -9,
        subIntro: -15,
        pluck: -17,
        kick: -13,
        hat: -38,
        hatAccent: -33,
        tick: -32,
      },
      pad: {
        lowpass: 380,
        partials: [1, 0.5, 0.25, 0.15, 0.1, 0.06],
        detune: 5,
        attack: 1.2,
        release: 1.6,
      },
      pluck: {
        partials: [1, 0.55, 0.36, 0.24, 0.16],
        decayTau: 0.32,
        brightHz: 2300,
        closedHz: 260,
        closeTau: 0.16,
        length: 2.2,
      },
      sub: {
        fromBar: 2,
        beats: [0, 2.5],
        dropRatio: 1.5,
        dropTau: 0.06,
        decayTau: 0.7,
        length: 1.9,
      },
      kick: {
        beats: [0, 2.5],
        startHz: 150,
        endHz: 44,
        dropTau: 0.03,
        decayTau: 0.1,
        length: 0.45,
      },
      hat: {
        highpass: 3400,
        accent: [0, -1, 0, -1, 1, -1, 0, -1, 0, -1, 0, -1, 1, -1, 0, 0],
        accentTau: 0.012,
        beatTau: 0.026,
        tickBeats: [3.5],
        tickTau: 0.045,
      },
      echo: {
        beats: 0.75,
        feedback: 0.3,
        lowpass: 1400,
      },
      bus: {
        lowpass: 4200,
      },
    },
    blueprint: {
      name: "blueprint",
      bpm: 84,
      a4: 440,
      gain: 0.12,
      renderDb: -20,
      seed: 7,
      notes: {
        D2: 38,
        E2: 40,
        "F#2": 42,
        A2: 45,
        B2: 46,
        "C#3": 49,
        D3: 50,
        E3: 52,
        "F#3": 54,
        "G#3": 56,
        A3: 57,
        B3: 59,
        "C#4": 61,
        D4: 62,
        E4: 64,
        "F#4": 66,
        "G#4": 68,
        A4: 69,
        B4: 71,
        "C#5": 73,
        D5: 74,
        E5: 76,
        "F#5": 78,
        "G#5": 80,
        A5: 81,
      },
      chords: [
        ["F#2", ["F#2", "C#3", "F#3", "A3", "C#4"]],
        ["D2", ["D3", "A3", "D4", "E4", "F#4"]],
        ["A2", ["A2", "E3", "A3", "C#4", "E4"]],
        ["E2", ["E3", "B3", "D4", "E4", "G#4"]],
      ],
      motif: [
        ["F#4", "A4", "C#5", "F#5", "C#5", "A4", "C#5", "A4"],
        ["D5", "A4", "F#4", "A4", "D5", "F#5", "D5", "A4"],
        ["A4", "C#5", "E5", "A5", "E5", "C#5", "A4", "C#5"],
        ["E5", "B4", "G#4", "B4", "E5", "G#5", "E5", "B4"],
      ],
      introBars: 4,
      breakEvery: 16,
      breakBars: 4,
      drums: true,
      levels: {
        pad: -22,
        padIntro: -26,
        sub: -9,
        subIntro: -15,
        pluck: -19,
        kick: -13,
        hat: -38,
        hatAccent: -32,
        tick: -31,
      },
      pad: {
        lowpass: 700,
        partials: [1, 0.5, 0.333, 0.25, 0.2, 0.167, 0.143, 0.125],
        detune: 3,
        attack: 0.9,
        release: 1.1,
      },
      pluck: {
        partials: [1, 0.55, 0.38, 0.27, 0.19, 0.13],
        decayTau: 0.16,
        brightHz: 3600,
        closedHz: 520,
        closeTau: 0.1,
        length: 1.2,
      },
      sub: {
        fromBar: 2,
        beats: [0, 2],
        dropRatio: 1.3,
        dropTau: 0.04,
        decayTau: 0.75,
        length: 2.0,
      },
      kick: {
        beats: [0, 2],
        startHz: 180,
        endHz: 50,
        dropTau: 0.022,
        decayTau: 0.078,
        length: 0.4,
      },
      hat: {
        highpass: 6000,
        accent: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
        accentTau: 0.009,
        beatTau: 0.02,
        tickBeats: [1, 3],
        tickTau: 0.035,
      },
      echo: {
        beats: 1.0,
        feedback: 0.28,
        lowpass: 2800,
      },
      bus: {
        lowpass: 7500,
      },
    },
  };

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

    const theme = currentTheme();
    const song = AMBIENT_SONGS[theme] || AMBIENT_SONGS.dark;
    const BEAT = 60 / song.bpm;
    const BAR = 4 * BEAT;
    const L = song.levels;
    const noteHz = (name) => song.a4 * 2 ** ((song.notes[name] - 69) / 12);

    const now = audio.currentTime;
    const master = audio.createGain();
    master.gain.setValueAtTime(0, now);
    master.gain.linearRampToValueAtTime(song.gain, now + AMBIENT_FADE_IN);
    master.connect(audio.destination);

    /* Q is linear on a lowpass; 0.5 is critically damped. Q near 0 splits the
       poles and pulls the real cutoff down to a few hertz. */
    const filter = (type, hz, into) => {
      const node = audio.createBiquadFilter();
      node.type = type;
      node.frequency.value = hz;
      node.Q.value = 0.5;
      node.connect(into);
      return node;
    };
    const bus = filter("lowpass", song.bus.lowpass, master);
    const padBus = filter("lowpass", song.pad.lowpass, bus);

    /* The pluck's echo: a delay in beats, feeding back, darkening. */
    const pluckBus = audio.createGain();
    pluckBus.connect(bus);
    const delay = audio.createDelay(4);
    delay.delayTime.value = song.echo.beats * BEAT;
    const feedback = audio.createGain();
    feedback.gain.value = song.echo.feedback;
    const echoTone = filter("lowpass", song.echo.lowpass, bus);
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
    const padWave = wave(song.pad.partials);
    const pluckWave = wave(song.pluck.partials);

    const noise = audio.createBuffer(1, audio.sampleRate, audio.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

    /* Sub: sine on the chord's root, pitch falling from dropRatio× to 1×. */
    const sub = (at, name, level) => {
      const S = song.sub;
      const osc = audio.createOscillator();
      const hz = noteHz(name);
      osc.frequency.setValueAtTime(hz * S.dropRatio, at);
      osc.frequency.setTargetAtTime(hz, at, S.dropTau);
      envelope(audio, osc, at, dbToGain(level), S.decayTau, bus, S.length);
    };

    /* Pad: each note twice, ±detune cents, one bar long with a rise and fall. */
    const pad = (at, names, level) => {
      const P = song.pad;
      const gain = audio.createGain();
      gain.gain.setValueAtTime(0, at);
      gain.gain.linearRampToValueAtTime(dbToGain(level), at + P.attack);
      gain.gain.setValueAtTime(dbToGain(level), at + BAR);
      gain.gain.linearRampToValueAtTime(0, at + BAR + P.release);
      gain.connect(padBus);
      for (const name of names) {
        for (const cents of [-P.detune, P.detune]) {
          const osc = audio.createOscillator();
          osc.setPeriodicWave(padWave);
          osc.frequency.value = noteHz(name);
          osc.detune.value = cents;
          osc.connect(gain);
          osc.start(at);
          osc.stop(at + BAR + P.release + 0.1);
        }
      }
    };

    /* Pluck: bright at the strike, its own lowpass closing. Into the echo. */
    const pluck = (at, name, level) => {
      const P = song.pluck;
      const osc = audio.createOscillator();
      osc.setPeriodicWave(pluckWave);
      osc.frequency.value = noteHz(name);
      const tone = filter("lowpass", P.brightHz, pluckBus);
      tone.frequency.setValueAtTime(P.brightHz, at);
      tone.frequency.setTargetAtTime(P.closedHz, at, P.closeTau);
      envelope(audio, osc, at, dbToGain(level), P.decayTau, tone, P.length);
    };

    const kick = (at, level) => {
      const K = song.kick;
      const osc = audio.createOscillator();
      osc.frequency.setValueAtTime(K.startHz, at);
      osc.frequency.setTargetAtTime(K.endHz, at, K.dropTau);
      envelope(audio, osc, at, dbToGain(level), K.decayTau, bus, K.length);
    };

    /* Hat and tick: the same noise through a highpass, only the decay differs. */
    const hat = (at, level, tau) => {
      const source = audio.createBufferSource();
      source.buffer = noise;
      source.loop = true;
      const top = filter("highpass", song.hat.highpass, bus);
      envelope(audio, source, at, dbToGain(level), tau, top, 0.1);
    };

    /* The arrangement, one bar at a time, scheduled a quarter second ahead
       on a timer — a timer alone drifts, audio time does not. */
    const scheduleBar = (bar, at) => {
      const [root, voicing] = song.chords[bar % song.chords.length];
      const inBreak =
        song.breakEvery > 0 && bar % song.breakEvery >= song.breakEvery - song.breakBars;
      const full = bar >= song.introBars && !inBreak;
      pad(at, voicing, full ? L.pad : L.padIntro);
      if (root && bar >= song.sub.fromBar) {
        for (const beat of song.sub.beats) sub(at + beat * BEAT, root, full ? L.sub : L.subIntro);
      }
      song.motif[bar % song.motif.length].forEach((name, i) => {
        if (name && !(inBreak && i % 2)) pluck(at + (i * BEAT) / 2, name, L.pluck);
      });
      if (!song.drums || !full) return;
      for (const beat of song.kick.beats) kick(at + beat * BEAT, L.kick);
      const H = song.hat;
      H.accent.forEach((accent, slot) => {
        if (accent < 0) return;
        hat(
          at + (slot * BEAT) / 4,
          accent ? L.hatAccent : L.hat,
          slot % 4 ? H.accentTau : H.beatTau,
        );
      });
      for (const beat of H.tickBeats) hat(at + beat * BEAT, L.tick, H.tickTau);
    };

    const state = { master, theme, timer: 0, bar: 0, nextBar: now + 0.1 };
    const tick = () => {
      while (state.nextBar < audio.currentTime + AMBIENT_LOOKAHEAD) {
        scheduleBar(state.bar, state.nextBar);
        state.bar += 1;
        state.nextBar += BAR;
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

  /* Each theme has its own song: when the reader changes theme while the
     sound is on, the old song fades out and the new one fades in over it. */
  new MutationObserver(() => {
    if (!ambient || ambient.theme === currentTheme()) return;
    stopAmbient();
    void startAmbient();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

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
