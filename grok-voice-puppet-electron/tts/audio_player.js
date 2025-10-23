// tts/audio_player.js (alternative)
import tmp from 'tmp';
import fs from 'fs';
import { spawn } from 'child_process';

export async function playWavBuffer(buf) {
  const tmpObj = tmp.fileSync({ postfix: '.wav' });
  await fs.promises.writeFile(tmpObj.name, buf);
  return new Promise((resolve) => {
    const ps = spawn('powershell', [
      '-NoProfile','-Command',
      `(New-Object Media.SoundPlayer '${tmpObj.name.replace(/\\/g,'/')}').PlaySync()`
    ], { windowsHide: true });
    ps.on('close', () => {
      try { tmpObj.removeCallback?.(); } catch (_) {}
      resolve();
    });
  });
}

