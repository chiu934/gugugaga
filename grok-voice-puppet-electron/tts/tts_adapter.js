
// Replace this stub with your cloned-voice TTS.
// Expected: async function synthToWav(text) -> returns Buffer (PCM 16-bit WAV, mono).

export async function synthToWav(text) {
  // --- DEMO ONLY: generate a short beep proportional to text length ---
  const sampleRate = 16000;
  const seconds = Math.max(0.4, Math.min(4, text.length / 18));
  const length = Math.floor(sampleRate * seconds);
  const data = new Int16Array(length);
  const freq = 220;
  for (let i = 0; i < length; i++) {
    const amp = 2500 * (0.5 + 0.5 * Math.sin(2 * Math.PI * i / (sampleRate * 0.25))); // slow tremolo
    data[i] = Math.sin(2 * Math.PI * freq * (i / sampleRate)) * amp;
  }
  // Write minimal WAV header
  const header = Buffer.alloc(44);
  const bytesPerSample = 2;
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length * bytesPerSample, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);         // fmt chunk size
  header.writeUInt16LE(1, 20);          // PCM
  header.writeUInt16LE(1, 22);          // mono
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * bytesPerSample, 28);
  header.writeUInt16LE(bytesPerSample, 32);
  header.writeUInt16LE(16, 34);         // bits per sample
  header.write('data', 36);
  header.writeUInt32LE(data.length * bytesPerSample, 40);
  const pcm = Buffer.alloc(data.length * bytesPerSample);
  for (let i = 0; i < data.length; i++) pcm.writeInt16LE(data[i], i * 2);
  return Buffer.concat([header, pcm]);
}
