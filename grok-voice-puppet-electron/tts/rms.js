
import wav from 'node-wav';

// Return [{t, rms}] at hopMs spacing (default 20ms)
export function rmsFromWavBuffer(buf, hopMs = 20) {
  const { sampleRate, channelData } = wav.decode(buf);
  const mono = channelData[0];
  const hop = Math.max(1, Math.round(sampleRate * hopMs / 1000));
  const frames = [];
  for (let i = 0; i < mono.length; i += hop) {
    let sum = 0, n = Math.min(hop, mono.length - i);
    for (let k = 0; k < n; k++) sum += mono[i + k] * mono[i + k];
    const rms = Math.sqrt(sum / n);
    frames.push({ t: i / sampleRate, rms });
  }
  const max = frames.reduce((m, f) => Math.max(m, f.rms), 1e-6);
  return frames.map(f => ({ t: f.t, rms: f.rms / (max || 1e-6) }));
}
