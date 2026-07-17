"use client";

import { useCallback, useEffect, useRef } from "react";
import { useReducedMotion } from "./useReducedMotion";

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
 * first interaction (autoplay policy). Shared by useClickSound and any
 * lighter-weight consumer that imports play* functions directly, so the
 * unlock logic exists in exactly one place. */
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

export function playTick() {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Resume if suspended (autoplay policy)
  if (ctx.state === "suspended") {
    ctx.resume();
  }

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(600, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(
    350,
    ctx.currentTime + 0.06,
  );

  gain.gain.setValueAtTime(0.05, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.09);
}

export function playPop() {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    ctx.resume();
  }

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(400, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(
    150,
    ctx.currentTime + 0.08,
  );

  gain.gain.setValueAtTime(0.06, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.1);
}

export function playHover() {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    ctx.resume();
  }

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(520, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(
    480,
    ctx.currentTime + 0.08,
  );

  gain.gain.setValueAtTime(0.015, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.1);
}

export function playChime() {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    ctx.resume();
  }

  // Low warm hum with gentle drift — not bubbly, just presence
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(260, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(
    220,
    ctx.currentTime + 0.12,
  );

  gain.gain.setValueAtTime(0.04, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.15);
}

export function playTap() {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    ctx.resume();
  }

  // Muted thump — rounder and lower than link hover
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(320, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(
    240,
    ctx.currentTime + 0.06,
  );

  gain.gain.setValueAtTime(0.03, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.08);
}

export function playNudge() {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    ctx.resume();
  }

  // Resonance — two slightly detuned sines creating a slow beat/wobble
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.type = "sine";
  osc1.frequency.setValueAtTime(100, ctx.currentTime);
  gain1.gain.setValueAtTime(0.001, ctx.currentTime);
  gain1.gain.linearRampToValueAtTime(0.07, ctx.currentTime + 0.1);
  gain1.gain.linearRampToValueAtTime(0.055, ctx.currentTime + 0.3);
  gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
  osc1.start(ctx.currentTime);
  osc1.stop(ctx.currentTime + 0.5);

  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(103, ctx.currentTime);
  gain2.gain.setValueAtTime(0.001, ctx.currentTime);
  gain2.gain.linearRampToValueAtTime(0.07, ctx.currentTime + 0.1);
  gain2.gain.linearRampToValueAtTime(0.055, ctx.currentTime + 0.3);
  gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
  osc2.start(ctx.currentTime);
  osc2.stop(ctx.currentTime + 0.5);
}

export function playClick() {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    ctx.resume();
  }

  const noise = ctx.createBufferSource();
  const buf = ctx.createBuffer(1, ctx.sampleRate * 0.008, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / 50);
  }
  noise.buffer = buf;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 3400 + Math.random() * 600;
  filter.Q.value = 3;

  const gain = ctx.createGain();
  gain.gain.value = 0.62 + Math.random() * 0.1;

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start(ctx.currentTime);
}

export function playProjectPop() {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    ctx.resume();
  }

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(420, ctx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(
    160,
    ctx.currentTime + 0.045,
  );

  gain.gain.setValueAtTime(0.12, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.055);

  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.055);
}

export function playClickHigh() {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    ctx.resume();
  }

  const noise = ctx.createBufferSource();
  const buf = ctx.createBuffer(1, ctx.sampleRate * 0.006, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / 30);
  }
  noise.buffer = buf;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 5200 + Math.random() * 800;
  filter.Q.value = 4;

  const gain = ctx.createGain();
  gain.gain.value = 0.26 + Math.random() * 0.07;

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start(ctx.currentTime);
}

export function playClickLow() {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    ctx.resume();
  }

  const noise = ctx.createBufferSource();
  const buf = ctx.createBuffer(1, ctx.sampleRate * 0.01, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / 60);
  }
  noise.buffer = buf;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 2200 + Math.random() * 300;
  filter.Q.value = 2.5;

  const gain = ctx.createGain();
  gain.gain.value = 0.36 + Math.random() * 0.08;

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start(ctx.currentTime);
}

export function playClickSharp() {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    ctx.resume();
  }

  const noise = ctx.createBufferSource();
  const buf = ctx.createBuffer(1, ctx.sampleRate * 0.004, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / 20);
  }
  noise.buffer = buf;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 4000 + Math.random() * 500;
  filter.Q.value = 5;

  const gain = ctx.createGain();
  gain.gain.value = 0.3 + Math.random() * 0.06;

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start(ctx.currentTime);
}

export function playClickSoft() {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    ctx.resume();
  }

  const noise = ctx.createBufferSource();
  const buf = ctx.createBuffer(1, ctx.sampleRate * 0.012, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / 80);
  }
  noise.buffer = buf;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 3000 + Math.random() * 400;
  filter.Q.value = 2;

  const gain = ctx.createGain();
  gain.gain.value = 0.2 + Math.random() * 0.04;

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start(ctx.currentTime);
}

export function playFidget() {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    ctx.resume();
  }

  // Tiny mechanical tick — low-pitched, very short noise burst
  const noise = ctx.createBufferSource();
  const buf = ctx.createBuffer(1, ctx.sampleRate * 0.005, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / 15);
  }
  noise.buffer = buf;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 2200 + Math.random() * 400;
  filter.Q.value = 3;

  const gain = ctx.createGain();
  gain.gain.value = 0.12 + Math.random() * 0.03;

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start(ctx.currentTime);
}

export function playBrush() {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    ctx.resume();
  }

  // Soft tactile brush — very quiet, wide-band, ultra-short
  const noise = ctx.createBufferSource();
  const buf = ctx.createBuffer(1, ctx.sampleRate * 0.007, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / 25);
  }
  noise.buffer = buf;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 2000 + Math.random() * 500;
  filter.Q.value = 1.2;

  const gain = ctx.createGain();
  gain.gain.value = 0.06 + Math.random() * 0.02;

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start(ctx.currentTime);
}

export function useClickSound() {
  const prefersReducedMotion = useReducedMotion();
  const enabled = useRef(true);

  useAudioUnlock();

  const tick = useCallback(() => {
    if (prefersReducedMotion || !enabled.current) return;
    playTick();
  }, [prefersReducedMotion]);

  const pop = useCallback(() => {
    if (prefersReducedMotion || !enabled.current) return;
    playPop();
  }, [prefersReducedMotion]);

  const hover = useCallback(() => {
    if (prefersReducedMotion || !enabled.current) return;
    playHover();
  }, [prefersReducedMotion]);

  const chime = useCallback(() => {
    if (prefersReducedMotion || !enabled.current) return;
    playChime();
  }, [prefersReducedMotion]);

  const tap = useCallback(() => {
    if (prefersReducedMotion || !enabled.current) return;
    playTap();
  }, [prefersReducedMotion]);

  const nudge = useCallback(() => {
    if (prefersReducedMotion || !enabled.current) return;
    playNudge();
  }, [prefersReducedMotion]);

  const click = useCallback(() => {
    if (prefersReducedMotion || !enabled.current) return;
    playClick();
  }, [prefersReducedMotion]);

  const clickHigh = useCallback(() => {
    if (prefersReducedMotion || !enabled.current) return;
    playClickHigh();
  }, [prefersReducedMotion]);

  const clickLow = useCallback(() => {
    if (prefersReducedMotion || !enabled.current) return;
    playClickLow();
  }, [prefersReducedMotion]);

  const clickSharp = useCallback(() => {
    if (prefersReducedMotion || !enabled.current) return;
    playClickSharp();
  }, [prefersReducedMotion]);

  const clickSoft = useCallback(() => {
    if (prefersReducedMotion || !enabled.current) return;
    playClickSoft();
  }, [prefersReducedMotion]);

  const projectPop = useCallback(() => {
    if (prefersReducedMotion || !enabled.current) return;
    playProjectPop();
  }, [prefersReducedMotion]);

  const fidget = useCallback(() => {
    if (prefersReducedMotion || !enabled.current) return;
    playFidget();
  }, [prefersReducedMotion]);

  const brush = useCallback(() => {
    if (prefersReducedMotion || !enabled.current) return;
    playBrush();
  }, [prefersReducedMotion]);

  return {
    tick,
    pop,
    hover,
    chime,
    tap,
    nudge,
    click,
    clickHigh,
    clickLow,
    clickSharp,
    clickSoft,
    projectPop,
    fidget,
    brush,
  };
}
