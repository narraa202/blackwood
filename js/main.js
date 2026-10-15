// Boot and screen router. Owns the single game state.

import { createState, pendingEvent } from './engine/state.js';
import { save, load, clear } from './engine/storage.js';
import { initTelegram } from './telegram.js';
import { resumeSound } from './sound.js';
import { showCard, toast } from './ui/modal.js';
import { updateRep } from './ui/hud.js';
import { SCREENS as screens } from './ui/screens.js';

const root = document.getElementById('app');
let cleanup = null;

const ctx = {
  state: load(),
  screen: null,
  params: {},

  newGame() {
    clear();
    ctx.state = createState(Date.now());
    save(ctx.state);
  },

  set(next) {
    const prev = ctx.state;
    ctx.state = next;
    save(next);
    if (prev) updateRep(prev.reputation, next.reputation);
  },

  go(screen, params = {}) {
    if (!ctx.state && screen !== 'cover') screen = 'cover';
    if (ctx.state && ctx.state.finished && !['result', 'cover'].includes(screen)) screen = 'result';
    if (['map', 'room', 'talk', 'board'].includes(screen) && ctx.state && pendingEvent(ctx.state)) {
      screen = 'event';
    }
    if (typeof cleanup === 'function') cleanup();
    cleanup = null;
    ctx.screen = screen;
    ctx.params = params;
    root.innerHTML = '';
    cleanup = screens[screen].render(root, ctx, params) || null;
  },

  // Show newly gained cards one by one, then fire a pending event if any.
  async reveal(ids) {
    for (const id of ids) await showCard(id);
    if (pendingEvent(ctx.state)) ctx.go('event');
  },

  toast,
};

initTelegram();
document.addEventListener('pointerdown', resumeSound, { once: true });
ctx.go('cover');
