import { useEffect } from "react";

let audioContext: AudioContext | null = null;
let audioPrimed = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

async function primeAudioContext() {
  const ctx = getAudioContext();
  if (!ctx || audioPrimed) return;

  if (ctx.state === "suspended") {
    await ctx.resume();
  }

  const buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
  const source = ctx.createBufferSource();
  const gain = ctx.createGain();

  source.buffer = buffer;
  gain.gain.value = 0.0001;

  source.connect(gain);
  gain.connect(ctx.destination);
  source.start(ctx.currentTime);

  audioPrimed = true;
}

/** Wires up the one-time listeners that unlock the shared AudioContext on
 * first interaction (autoplay policy). */
export function useAudioUnlock() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const unlockAudio = () => {
      void primeAudioContext();
    };

    window.addEventListener("pointerenter", unlockAudio, {
      once: true,
      passive: true,
    });
    window.addEventListener("pointermove", unlockAudio, {
      once: true,
      passive: true,
    });
    window.addEventListener("pointerdown", unlockAudio, { once: true });
    window.addEventListener("keydown", unlockAudio, { once: true });

    return () => {
      window.removeEventListener("pointerenter", unlockAudio);
      window.removeEventListener("pointermove", unlockAudio);
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };
  }, []);
}

/**
 * One synth for every click: a filtered noise burst. The three sounds are the
 * same instrument with different settings — length and decay set how hard the
 * tap is, frequency and Q where it sits, gain how close. Jitter keeps repeats
 * from sounding sampled.
 */
function playTap(opts: {
  lengthS: number;
  decay: number;
  freq: number;
  freqJitter: number;
  q: number;
  gain: number;
  gainJitter: number;
}) {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    ctx.resume();
  }

  const noise = ctx.createBufferSource();
  const buf = ctx.createBuffer(1, ctx.sampleRate * opts.lengthS, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / opts.decay);
  }
  noise.buffer = buf;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = opts.freq + Math.random() * opts.freqJitter;
  filter.Q.value = opts.q;

  const gain = ctx.createGain();
  gain.gain.value = opts.gain + Math.random() * opts.gainJitter;

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start(ctx.currentTime);
}

export function playClickLow() {
  playTap({
    lengthS: 0.01,
    decay: 60,
    freq: 2200,
    freqJitter: 300,
    q: 2.5,
    gain: 0.36,
    gainJitter: 0.08,
  });
}

export function playClickSharp() {
  playTap({
    lengthS: 0.004,
    decay: 20,
    freq: 4000,
    freqJitter: 500,
    q: 5,
    gain: 0.3,
    gainJitter: 0.06,
  });
}

/** Dead plate — a press on something that does not open. Not the noise
 * burst: filtered noise at thump pitch is a rumble, not a thump. This is a
 * sine that drops an octave while it fades, the kick-drum shape —
 * the pitch fall is the "thud", the fast fade keeps it from ringing. */
export function playThump() {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    ctx.resume();
  }

  const t0 = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  // Soft, not solid: the pitch falls one octave rather than two, and the
  // gain ramps in over 12ms instead of starting hot — the instant onset is
  // what reads as a hard hit.
  osc.type = "sine";
  osc.frequency.setValueAtTime(110 + Math.random() * 10, t0);
  osc.frequency.exponentialRampToValueAtTime(55, t0 + 0.1);

  gain.gain.setValueAtTime(0.001, t0);
  gain.gain.exponentialRampToValueAtTime(0.18, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.11);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + 0.11);
}

/** Soft tactile brush — very quiet, wide-band, ultra-short */
export function playBrush() {
  playTap({
    lengthS: 0.007,
    decay: 25,
    freq: 2000,
    freqJitter: 500,
    q: 1.2,
    gain: 0.06,
    gainJitter: 0.02,
  });
}
