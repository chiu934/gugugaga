
// ==UserScript==
// @name         Grok → Local Speech Bridge
// @namespace    local.grok.speech
// @version      1.0
// @description  Streams Grok assistant text to localhost:7070 for TTS + lip-sync
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  // TODO: Update this selector to match Grok's assistant message text nodes.
  // Use "Inspect Element" on a Grok reply and set a robust selector here.
  const SELECTOR_FOR_GROK_MESSAGES = '.grok-message .text, .assistant .message';

  const seen = new WeakSet();
  const queue = [];

  const post = (text) => {
    fetch('http://localhost:7070/speak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    }).catch(()=>{});
  };

  // Observe DOM for new assistant message nodes
  const obs = new MutationObserver(() => {
    const nodes = document.querySelectorAll(SELECTOR_FOR_GROK_MESSAGES);
    nodes.forEach(n => {
      if (seen.has(n)) return;
      const text = n.innerText?.trim();
      if (text && text.length > 0) {
        seen.add(n);
        // Split into sentences for quicker feedback
        const parts = text.split(/(?<=[.!?])\\s+/).filter(Boolean);
        parts.forEach(p => queue.push(p));
        flush();
      }
    });
  });

  obs.observe(document.body, { childList: true, subtree: true });

  let flushing = false;
  async function flush() {
    if (flushing) return;
    flushing = true;
    while (queue.length) {
      const s = queue.shift();
      post(s);
      await new Promise(r => setTimeout(r, 50));
    }
    flushing = false;
  }

  // Manual fallback: send current selection with Alt+Shift+S
  window.addEventListener('keydown', (e) => {
    if (e.altKey && e.shiftKey && e.code === 'KeyS') {
      const sel = String(window.getSelection());
      if (sel.trim().length) post(sel.trim());
    }
  });
})();
