(() => {
  if (!window.matchMedia('(pointer: fine)').matches) return;

  let ctx = null;
  let primed = false;

  const getCtx = () => {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  };

  const prime = async () => {
    if (primed) return;
    const audio = getCtx();
    if (audio.state === 'suspended') await audio.resume();
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

  const playClickSoft = () => {
    const audio = getCtx();
    if (audio.state === 'suspended') void audio.resume();
    const noise = audio.createBufferSource();
    const buf = audio.createBuffer(1, audio.sampleRate * 0.012, audio.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / 80);
    noise.buffer = buf;
    const filter = audio.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 3000 + Math.random() * 400;
    filter.Q.value = 2;
    const gain = audio.createGain();
    gain.gain.value = 0.12 + Math.random() * 0.03;
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audio.destination);
    noise.start(audio.currentTime);
  };

  const heroLinkSelector = '[data-hero-sfx="click"]';

  document.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target.closest(heroLinkSelector) : null;
    if (!target) return;
    void prime();
    playClickSoft();
  }, { passive: true });

  window.addEventListener('keydown', (event) => {
    if (event.altKey || event.metaKey || event.ctrlKey || event.shiftKey) return;
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement) return;

    const key = event.key.toLowerCase();
    if (key !== 'v' && key !== 'c') return;

    const link = document.querySelector('[data-hero-shortcut="' + key + '"]');
    if (!(link instanceof HTMLAnchorElement)) return;

    event.preventDefault();
    void prime();
    playClickSoft();
    window.open(link.href, link.target || '_blank', 'noopener,noreferrer');
  });
})();
