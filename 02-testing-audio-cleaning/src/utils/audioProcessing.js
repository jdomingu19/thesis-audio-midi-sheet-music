// ─── Supported Formats ────────────────────────────────────────────
export const SUPPORTED_FORMATS = [
  'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave',
  'audio/ogg', 'audio/flac', 'audio/aac', 'audio/mp4',
  'audio/x-m4a', 'audio/m4a', 'audio/webm', 'audio/opus',
  'audio/x-wav', 'audio/vnd.wave',
];

export const SUPPORTED_EXTENSIONS = [
  '.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a', '.opus', '.webm',
];

export const ACCEPT_STRING = SUPPORTED_EXTENSIONS.join(',');

// ─── Formatters ───────────────────────────────────────────────────
export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function getFileExtension(filename) {
  const idx = filename.lastIndexOf('.');
  return idx >= 0 ? filename.slice(idx).toUpperCase().replace('.', '') : 'AUDIO';
}

export function isFormatSupported(file) {
  const ext = '.' + file.name.split('.').pop().toLowerCase();
  const typeOk = SUPPORTED_FORMATS.includes(file.type);
  const extOk = SUPPORTED_EXTENSIONS.includes(ext);
  return typeOk || extOk;
}

// ─── WAV Encoder ──────────────────────────────────────────────────
function audioBufferToWav(buffer) {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const numSamples = buffer.length;
  const dataLength = numSamples * blockAlign;
  const wavBuffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(wavBuffer);

  const writeStr = (offset, str) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeStr(0,  'RIFF');
  view.setUint32(4,  36 + dataLength, true);
  writeStr(8,  'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);           // subchunk1 size
  view.setUint16(20, 1, true);            // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeStr(36, 'data');
  view.setUint32(40, dataLength, true);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
  }

  return new Blob([wavBuffer], { type: 'audio/wav' });
}

// ─── Core Processing Pipeline ─────────────────────────────────────
export async function processAudioFile(file, options, onProgress) {
  const { whiteNoise, backgroundNoise, distortion } = options;

  onProgress?.('Reading file…');
  const arrayBuffer = await file.arrayBuffer();

  onProgress?.('Decoding audio…');
  const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
  const tempCtx = new AudioCtxClass();

  let audioBuffer;
  try {
    audioBuffer = await tempCtx.decodeAudioData(arrayBuffer.slice(0));
  } finally {
    await tempCtx.close();
  }

  const { numberOfChannels, sampleRate, length } = audioBuffer;
  const offlineCtx = new OfflineAudioContext(numberOfChannels, length, sampleRate);

  const source = offlineCtx.createBufferSource();
  source.buffer = audioBuffer;

  let currentNode = source;

  // ── Stage 1: White Noise Reduction ──────────────────────────────
  if (whiteNoise) {
    onProgress?.('Removing white noise…');

    // Sub-bass rumble gate
    const hp = offlineCtx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 80;
    hp.Q.value = 0.707;

    // High-frequency hiss attenuation
    const shelf = offlineCtx.createBiquadFilter();
    shelf.type = 'highshelf';
    shelf.frequency.value = 10000;
    shelf.gain.value = -6;

    // Narrow band soft presence
    const lp = offlineCtx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 16000;
    lp.Q.value = 0.5;

    currentNode.connect(hp);
    hp.connect(shelf);
    shelf.connect(lp);
    currentNode = lp;
  }

  // ── Stage 2: Background Noise Reduction ─────────────────────────
  if (backgroundNoise) {
    onProgress?.('Cleaning background noise…');

    // Electrical hum notch — 50/60 Hz
    const notch60 = offlineCtx.createBiquadFilter();
    notch60.type = 'notch';
    notch60.frequency.value = 60;
    notch60.Q.value = 10;

    const notch120 = offlineCtx.createBiquadFilter();
    notch120.type = 'notch';
    notch120.frequency.value = 120;
    notch120.Q.value = 8;

    // Noise gate via aggressive compressor
    const gate = offlineCtx.createDynamicsCompressor();
    gate.threshold.value = -55;
    gate.knee.value = 10;
    gate.ratio.value = 20;
    gate.attack.value = 0.001;
    gate.release.value = 0.35;

    currentNode.connect(notch60);
    notch60.connect(notch120);
    notch120.connect(gate);
    currentNode = gate;
  }

  // ── Stage 3: Distortion Cleanup ─────────────────────────────────
  if (distortion) {
    onProgress?.('Fixing distortions…');

    // Gentle high shelf to soften harshness
    const highShelf = offlineCtx.createBiquadFilter();
    highShelf.type = 'highshelf';
    highShelf.frequency.value = 5000;
    highShelf.gain.value = -4;

    // Transparent brick-wall limiter
    const limiter = offlineCtx.createDynamicsCompressor();
    limiter.threshold.value = -3;
    limiter.knee.value = 2;
    limiter.ratio.value = 20;
    limiter.attack.value = 0.001;
    limiter.release.value = 0.05;

    // Output gain trim to avoid inter-sample peaks
    const gain = offlineCtx.createGain();
    gain.gain.value = 0.9;

    currentNode.connect(highShelf);
    highShelf.connect(limiter);
    limiter.connect(gain);
    currentNode = gain;
  }

  currentNode.connect(offlineCtx.destination);
  source.start(0);

  onProgress?.('Rendering processed audio…');
  const rendered = await offlineCtx.startRendering();

  onProgress?.('Encoding to WAV…');
  return audioBufferToWav(rendered);
}

// ─── Audio Duration Probe ─────────────────────────────────────────
export function probeAudioDuration(url) {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.onloadedmetadata = () => resolve(isFinite(audio.duration) ? audio.duration : null);
    audio.onerror = () => resolve(null);
    audio.src = url;
  });
}

// ─── Deterministic Waveform Seed (visual only) ────────────────────
export function generateWaveformBars(name, count = 32) {
  const bars = [];
  let seed = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    return Math.abs(seed) / 0xffffffff;
  };
  for (let i = 0; i < count; i++) {
    bars.push(0.1 + rand() * 0.9);
  }
  return bars;
}
