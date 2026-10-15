// Midgame event: full-screen dramatic scene.

import { CASE } from '../data/case.js';
import { pendingEvent, applyEvent } from '../engine/state.js';
import { VIGNETTES } from '../art/vignettes.js';
import { divider } from '../art/deco.js';
import { haptic } from '../telegram.js';
import { playThunder } from '../sound.js';
import { esc } from './modal.js';

export function render(root, ctx) {
  const id = pendingEvent(ctx.state);
  if (!id) { ctx.go('map'); return; }
  const ev = CASE.events[id];
  const el = document.createElement('section');
  el.className = 'screen event';
  el.innerHTML = `
    <div class="cover-flash on"></div>
    <div class="event-body">
      <div class="eyebrow">Тем временем</div>
      <div class="slide-art">${VIGNETTES.maid}</div>
      <h1 class="display event-title">${esc(ev.title)}</h1>
      ${divider()}
      <p class="lead center">${esc(ev.text)}</p>
    </div>
    <div class="prologue-foot"><button class="btn primary">Продолжить расследование</button></div>`;
  root.appendChild(el);
  haptic('heavy');
  playThunder();
  el.querySelector('.btn').addEventListener('click', () => {
    ctx.set(applyEvent(ctx.state, id));
    ctx.go('map');
    ctx.toast('Открыты комната Люси и оранжерея');
  });
}
