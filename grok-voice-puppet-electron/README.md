
# Grok → Cloned Voice → Live Lip‑Sync (Electron Starter)

This starter lets you:
- Watch Grok’s on-screen replies (via a userscript — DOM-based, no OCR)
- POST the text to a local Electron app (`/speak`)
- Synthesize audio with your cloned voice (stub included; replace with your TTS)
- Play audio locally
- Stream RMS frames over WebSocket (ws://localhost:7071) to lip-sync an avatar

## Quick Start
```bash
npm i
npm start
```
Then:
1) Open `avatar/index.html` in a browser to see jawOpen move.
2) Install the userscript in your browser (Tampermonkey): `userscript/grok_to_speech.user.js`
3) Open Grok in the browser. The script will detect new assistant messages and send them to `http://localhost:7070/speak` sentence-by-sentence.

> If CORS blocks you, keep the Electron app running (it enables CORS).

## Swap in your cloned TTS
Edit `./tts/tts_adapter.js`:
- Implement `synthToWav(text)` to return a **WAV Buffer** (PCM 16-bit mono preferred).
- If your TTS streams: play chunks immediately and push **RMS** progressively (you can adapt `rms.js`).

## Ports
- REST: `http://localhost:7070`
- WS (visemes): `ws://localhost:7071`

## Notes
- The userscript has a placeholder CSS selector for Grok messages. Inspect the Grok page and update `SELECTOR_FOR_GROK_MESSAGES` accordingly.
- You can also press **Alt+Shift+S** to send the **current text selection** to `/speak` as a manual fallback.
