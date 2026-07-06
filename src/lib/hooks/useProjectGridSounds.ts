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

function playClickLow() {
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

function playClickSharp() {
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

function playBrush() {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    ctx.resume();
  }

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

export function useProjectGridSounds() {
  const prefersReducedMotion = useReducedMotion();
  const enabled = useRef(true);

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

  const brush = useCallback(() => {
    if (prefersReducedMotion || !enabled.current) return;
    playBrush();
  }, [prefersReducedMotion]);

  const clickLow = useCallback(() => {
    if (prefersReducedMotion || !enabled.current) return;
    playClickLow();
  }, [prefersReducedMotion]);

  const clickSharp = useCallback(() => {
    if (prefersReducedMotion || !enabled.current) return;
    playClickSharp();
  }, [prefersReducedMotion]);

  return {
    brush,
    clickLow,
    clickSharp,
  };
}
