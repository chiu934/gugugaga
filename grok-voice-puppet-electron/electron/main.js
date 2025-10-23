
import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';

import { synthToWav } from '../tts/tts_adapter.js';
import { rmsFromWavBuffer } from '../tts/rms.js';
import { playWavBuffer } from '../tts/audio_player.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow = null;
let avatarWindow = null;

// --- Minimal WS server for visemes (rms frames) ---
const wss = new WebSocketServer({ port: 7071 });
function broadcast(obj) {
  const msg = JSON.stringify(obj);
  wss.clients.forEach(c => { if (c.readyState === 1) c.send(msg); });
}

// --- Local REST server (Electron main process) ---
const appServer = express();
appServer.use(cors());
appServer.use(express.json({ limit: '2mb' }));

appServer.post('/speak', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text || !text.trim()) return res.status(400).json({ ok: false, error: 'No text' });

    const wavBuf = await synthToWav(text);

    // Broadcast RMS frames for lip sync
    const frames = rmsFromWavBuffer(wavBuf, 20);
    broadcast({ type: 'utterance_start', text });
    for (const f of frames) broadcast({ type: 'viseme', t: f.t, rms: f.rms });
    broadcast({ type: 'utterance_end' });

    // Play audio (fire-and-forget)
    playWavBuffer(wavBuf).catch(() => {});

    res.json({ ok: true, seconds: frames.at(-1)?.t ?? 0 });
  } catch (e) {
    console.error('speak error:', e);
    res.status(500).json({ ok: false, error: String(e) });
  }
});

appServer.listen(7070, () => {
  console.log('REST server on http://localhost:7070');
  console.log('WS visemes on ws://localhost:7071');
});

function createWindows() {
  mainWindow = new BrowserWindow({
    width: 420,
    height: 260,
    title: 'Grok Voice Puppet (HUD)',
    webPreferences: {
      contextIsolation: true
    }
  });
  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  avatarWindow = new BrowserWindow({
    width: 520,
    height: 220,
    title: 'Avatar (jawOpen preview)',
    webPreferences: { contextIsolation: true }
  });
  avatarWindow.setMenuBarVisibility(false);
  avatarWindow.loadFile(path.join(__dirname, '../avatar/index.html'));
}

app.whenReady().then(() => {
  createWindows();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindows();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
