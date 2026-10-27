import { useEffect } from "react";

let audioContext: AudioContext | null = null;
let audioPrimed = false;

/* Every gain starts and ends here, never at 0: an exponential ramp cannot
   leave or reach 0, and a step from silence to full is the pop the ramp is
   there to remove. 1e-4 is -80 dB, below anything a speaker resolves. */
const SILENT_GAIN = 1e-4;
/* The rise to a tap's peak. Long enough that no sample jumps further than
   the ramp allows, short enough that the tap still reads as a tap. */
const TAP_ATTACK_S = 0.002;

/** The shared context, or null before the first gesture has made it. The
 * footer's speaker switches only the ambient track, so the clicks do not
 * read it. */
function getAudioContext(): AudioContext | null {
  if (typeof document === "undefined" || !audioContext) return null;
  if (audioContext.state === "suspended") {
    void audioContext.resume();
  }
  return audioContext;
}

async function primeAudioContext() {
  if (audioPrimed) return;
  audioPrimed = true;
  const ctx = (audioContext ??= new AudioContext());

  if (ctx.state === "suspended") {
    await ctx.resume();
  }

  const buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
  const source = ctx.createBufferSource();
  const gain = ctx.createGain();

  source.buffer = buffer;
  gain.gain.value = SILENT_GAIN;

  source.connect(gain);
  gain.connect(ctx.destination);
  source.start(ctx.currentTime);
}

/** Wires up the one-time listeners that make the shared AudioContext on the
 * first pointerdown or keydown. Those are user activations under the autoplay
 * policy; a context made on hover starts suspended and Chrome warns about it.
 * Sounds asked for before then are skipped. Capture phase, so the context
 * exists before a card's own onPointerDown asks for the thump. */
export function useAudioUnlock() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const unlockAudio = () => {
      void primeAudioContext();
    };

    window.addEventListener("pointerdown", unlockAudio, { once: true, capture: true });
    window.addEventListener("keydown", unlockAudio, { once: true, capture: true });

    return () => {
      window.removeEventListener("pointerdown", unlockAudio, { capture: true });
      window.removeEventListener("keydown", unlockAudio, { capture: true });
    };
  }, []);
}

/**
 * One synth for every click: a filtered noise burst. The three sounds are the
 * same instrument with different settings — decay sets how hard the tap is,
 * frequency and Q where it sits, gain how close. Jitter keeps repeats from
 * sounding sampled. The envelope is on the gain, not baked into the noise:
 * a 2ms rise from silence, then the same fall the noise used to carry,
 * e^(-i/decay) per sample, down to silence. The burst ends where the fall
 * does, so nothing is cut off mid-ring. The rise moved each peak to where
 * the filter has rung up, which made the taps louder; the gains below are
 * the old ones trimmed until each tap's mean energy measured within 1 dB of
 * what it had with the instant onset.
 */
function playTap(opts: {
  decay: number;
  freq: number;
  freqJitter: number;
  q: number;
  gain: number;
  gainJitter: number;
}) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const t0 = ctx.currentTime;
  const peak = opts.gain + Math.random() * opts.gainJitter;
  const fallS = (opts.decay / ctx.sampleRate) * Math.log(peak / SILENT_GAIN);
  const endS = TAP_ATTACK_S + fallS;

  const noise = ctx.createBufferSource();
  const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * endS), ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  noise.buffer = buf;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = opts.freq + Math.random() * opts.freqJitter;
  filter.Q.value = opts.q;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(SILENT_GAIN, t0);
  gain.gain.exponentialRampToValueAtTime(peak, t0 + TAP_ATTACK_S);
  gain.gain.exponentialRampToValueAtTime(SILENT_GAIN, t0 + endS);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start(t0);
}

export function playClickLow() {
  playTap({
    decay: 60,
    freq: 2200,
    freqJitter: 300,
    q: 2.5,
    gain: 0.334,
    gainJitter: 0.075,
  });
}

export function playClickSharp() {
  playTap({
    decay: 20,
    freq: 4000,
    freqJitter: 500,
    q: 5,
    gain: 0.24,
    gainJitter: 0.048,
  });
}

/** Dead plate — a press on something that does not open. Not the noise
 * burst: filtered noise at thump pitch is a rumble, not a thump. This is a
 * sine that drops an octave while it fades, the kick-drum shape —
 * the pitch fall is the "thud", the fast fade keeps it from ringing. */
export function playThump() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const t0 = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  // Soft, not solid: the pitch falls one octave rather than two, and the
  // gain ramps in over 12ms instead of starting hot — the instant onset is
  // what reads as a hard hit.
  osc.type = "sine";
  osc.frequency.setValueAtTime(110 + Math.random() * 10, t0);
  osc.frequency.exponentialRampToValueAtTime(55, t0 + 0.1);

  // The fall reaches 0.001 at 110ms, as it always has, then carries on at
  // the same slope to silence (43ms more), so the stop cuts nothing.
  gain.gain.setValueAtTime(SILENT_GAIN, t0);
  gain.gain.exponentialRampToValueAtTime(0.18, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.11);
  gain.gain.exponentialRampToValueAtTime(SILENT_GAIN, t0 + 0.153);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + 0.153);
}

/** Soft tactile brush — very quiet, wide-band, ultra-short */
export function playBrush() {
  playTap({
    decay: 25,
    freq: 2000,
    freqJitter: 500,
    q: 1.2,
    gain: 0.046,
    gainJitter: 0.015,
  });
}
