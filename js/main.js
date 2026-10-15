// Boot and screen router. Owns the single game state.

import { createState, pendingEvent } from './engine/state.js';
import { save, load, clear } from './engine/storage.js';
import { initTelegram } from './telegram.js';
import { resumeSound } from './sound.js';
import { showCard, toast } from './ui/modal.js';
import { updateRep } from './ui/hud.js';
import * as cover from './ui/cover.js';
import * as prologue from './ui/prologue.js';
import * as map from './ui/map.js';

const screens = { cover, prologue, map };
const lazy = { room: './ui/room.js', talk: './ui/talk.js', board: './ui/board.js', event: './ui/event.js', accuse: './ui/accuse.js', result: './ui/result.js' };

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

  async go(screen, params = {}) {
    if (!ctx.state && screen !== 'cover') screen = 'cover';
    if (ctx.state && ctx.state.finished && !['result', 'cover'].includes(screen)) screen = 'result';
    if (['map', 'room', 'talk', 'board'].includes(screen) && ctx.state && pendingEvent(ctx.state)) {
      screen = 'event';
    }
    if (!screens[screen] && lazy[screen]) {
      try {
        screens[screen] = await import(lazy[screen]);
      } catch (err) {
        console.error(err);
        toast('Этот раздел ещё в работе');
        return;
      }
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
