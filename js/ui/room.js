// Room screen: tap objects in the scene to find clues.

import { CASE } from '../data/case.js';
import { findClue, hasCard } from '../engine/state.js';
import { roomSvg } from '../art/rooms.js';
import { haptic } from '../telegram.js';
import { playFound } from '../sound.js';
import { topbar, bottomnav } from './hud.js';
import { showModal, cardHtml } from './modal.js';

const LOCKED_TEXT = {
  suitcase: 'Чемодан заперт. Сначала разберитесь, кто открывал сейф и зачем.',
};

export function render(root, ctx, { id }) {
  const room = CASE.rooms.find((r) => r.id === id);
  const el = document.createElement('section');
  el.className = 'screen';
  el.appendChild(topbar(ctx, { title: room.name, back: 'map' }));

  const body = document.createElement('div');
  body.className = 'scroll room-body';
  body.innerHTML = `<div class="scene">${roomSvg(id)}</div><p class="room-caption"></p>`;
  el.appendChild(body);
  el.appendChild(bottomnav(ctx, 'map'));
  root.appendChild(el);

  const caption = body.querySelector('.room-caption');
  const clues = CASE.clues.filter((c) => c.room === id);
  const refresh = () => {
    let found = 0;
    body.querySelectorAll('.hotspot').forEach((g) => {
      const on = hasCard(ctx.state, g.dataset.clue);
      g.classList.toggle('found', on);
      if (on) found += 1;
    });
    caption.textContent = found === clues.length
      ? 'Здесь больше нечего искать.'
      : `Осмотрите предметы в комнате. Найдено: ${found} из ${clues.length}.`;
  };
  refresh();

  body.querySelectorAll('.hotspot').forEach((g) => {
    g.addEventListener('click', async () => {
      const clueId = g.dataset.clue;
      const r = findClue(ctx.state, clueId);
      if (r.result === 'new') {
        ctx.set(r.state);
        haptic('medium');
        playFound();
        refresh();
        await ctx.reveal([clueId]);
      } else if (r.result === 'already') {
        showModal({ html: cardHtml(clueId) });
      } else if (r.result === 'locked') {
        haptic('light');
        ctx.toast(LOCKED_TEXT[clueId] || 'Пока не получается.');
      }
    });
  });
}
