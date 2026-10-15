// Overlays: generic modal, card reveal with fly-to-board, toasts.

import { getCard } from '../engine/state.js';
import { CASE } from '../data/case.js';

const app = () => document.getElementById('app');

const testimonyIds = new Set(CASE.testimonies.map((t) => t.id));
const deductionIds = new Set(CASE.deductions.map((d) => d.id));

export function kindOf(id) {
  if (deductionIds.has(id)) return 'deduction';
  if (testimonyIds.has(id)) return 'testimony';
  return 'clue';
}

export const KIND_LABEL = { clue: 'Улика', testimony: 'Показание', deduction: 'Вывод' };

export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function cardHtml(id, { compact = false } = {}) {
  const c = getCard(id);
  if (!c) return '';
  const kind = kindOf(id);
  return `<div class="card ${kind}${compact ? ' compact' : ''}" data-card="${id}">
    <div class="kind">${KIND_LABEL[kind]}</div>
    <h3>${esc(c.title)}</h3>
    ${compact ? '' : `<p>${esc(c.text)}</p>`}
  </div>`;
}

function overlay(inner) {
  const el = document.createElement('div');
  el.className = 'overlay';
  el.innerHTML = inner;
  app().appendChild(el);
  return el;
}

function closeOverlay(el) {
  return new Promise((resolve) => {
    el.classList.add('closing');
    setTimeout(() => { el.remove(); resolve(); }, 230);
  });
}

// actions: [{label, kind: 'primary'|'ghost'|'danger', value}] → resolves with value.
export function showModal({ title = '', html = '', actions = [{ label: 'Закрыть', kind: 'ghost', value: null }] }) {
  return new Promise((resolve) => {
    const el = overlay(`<div class="modal" role="dialog">
      ${title ? `<h2>${esc(title)}</h2>` : ''}
      <div class="modal-body">${html}</div>
      <div class="actions">${actions.map((a, i) => `<button class="btn ${a.kind || ''}" data-i="${i}">${esc(a.label)}</button>`).join('')}</div>
    </div>`);
    el.querySelectorAll('[data-i]').forEach((b) => {
      b.addEventListener('click', async () => {
        await closeOverlay(el);
        resolve(actions[Number(b.dataset.i)].value);
      }, { once: true });
    });
  });
}

const BURST = { clue: 'Новая улика', testimony: 'Новое показание', deduction: 'Вывод!' };

export function showCard(id) {
  return new Promise((resolve) => {
    const kind = kindOf(id);
    const el = overlay(`<div class="card-reveal">
      <div class="burst">${BURST[kind]}</div>
      ${cardHtml(id)}
      <button class="btn primary">В блокнот</button>
    </div>`);
    el.querySelector('.btn').addEventListener('click', () => {
      flyToBoard(el.querySelector('.card'));
      closeOverlay(el).then(resolve);
    }, { once: true });
  });
}

function flyToBoard(cardEl) {
  const target = document.getElementById('nav-board');
  if (!cardEl || !target) return;
  const a = cardEl.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  const root = app().getBoundingClientRect();
  const clone = cardEl.cloneNode(true);
  clone.classList.add('card-fly');
  Object.assign(clone.style, {
    left: `${a.left - root.left}px`, top: `${a.top - root.top}px`, width: `${a.width}px`, margin: 0, animation: 'none',
  });
  app().appendChild(clone);
  requestAnimationFrame(() => {
    const dx = b.left + b.width / 2 - (a.left + a.width / 2);
    const dy = b.top + b.height / 2 - (a.top + a.height / 2);
    clone.style.transform = `translate(${dx}px, ${dy}px) scale(0.08) rotate(20deg)`;
    clone.style.opacity = '0.2';
  });
  setTimeout(() => {
    clone.remove();
    target.classList.add('shake');
    setTimeout(() => target.classList.remove('shake'), 400);
  }, 560);
}

export function toast(text) {
  document.querySelectorAll('.toast').forEach((t) => t.remove());
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = text;
  app().appendChild(el);
  setTimeout(() => el.remove(), 2500);
}
