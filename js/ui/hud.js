// Shared chrome: top bar (back, title, reputation, sound) and bottom nav.

import { ICONS } from '../art/deco.js';
import { isSoundOn, toggleSound } from '../sound.js';
import { esc } from './modal.js';
import { clueCount, deductionCount } from '../engine/state.js';
import { CASE } from '../data/case.js';

export function repHtml(rep) {
  return `<div class="rep${rep < 40 ? ' low' : ''}" id="rep" title="Репутация">
    <span>Реп.</span><span class="rep-bar"><i style="width:${rep}%"></i></span>
  </div>`;
}

export function topbar(ctx, { title, back = null }) {
  const el = document.createElement('header');
  el.className = 'topbar';
  el.innerHTML = `
    ${back ? `<button class="icon-btn" data-back aria-label="Назад">${ICONS.back}</button>` : ''}
    <h1>${esc(title)}</h1>
    ${repHtml(ctx.state.reputation)}
    <button class="icon-btn" data-sound aria-label="Звук">${isSoundOn() ? ICONS.soundOn : ICONS.soundOff}</button>`;
  if (back) el.querySelector('[data-back]').addEventListener('click', () => ctx.go(back));
  const s = el.querySelector('[data-sound]');
  s.addEventListener('click', () => { s.innerHTML = toggleSound() ? ICONS.soundOn : ICONS.soundOff; });
  return el;
}

export function bottomnav(ctx, active) {
  const el = document.createElement('nav');
  el.className = 'bottomnav';
  const n = ctx.state.cards.length;
  el.innerHTML = `
    <button class="navbtn${active === 'map' ? ' active' : ''}" data-go="map">${ICONS.map}<span>Особняк</span></button>
    <button class="navbtn${active === 'board' ? ' active' : ''}" id="nav-board" data-go="board">${ICONS.board}<span>Доска</span>${n ? `<b class="badge">${n}</b>` : ''}</button>
    <button class="navbtn accuse" data-go="accuse">${ICONS.accuse}<span>Обвинить</span></button>`;
  el.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => ctx.go(b.dataset.go)));
  return el;
}

// Refresh the reputation widget in place after a state change.
export function updateRep(prev, next) {
  const el = document.getElementById('rep');
  if (!el) return;
  el.outerHTML = repHtml(next);
  if (next < prev) {
    const fresh = document.getElementById('rep');
    fresh.classList.add('hit');
  }
}

export const progressLine = (state) =>
  `Улик: ${clueCount(state)} из ${CASE.clues.length} · Выводов: ${deductionCount(state)} из ${CASE.deductions.length}`;
