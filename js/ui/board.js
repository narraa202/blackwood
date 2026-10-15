// Evidence board: pick two cards to link them into a deduction.

import { CASE } from '../data/case.js';
import { getCard, currentHint, useHint, MAX_HINTS, HINT_COST } from '../engine/state.js';
import { link } from '../engine/board.js';
import { ICONS } from '../art/deco.js';
import { haptic } from '../telegram.js';
import { playFound, playWrong } from '../sound.js';
import { topbar, bottomnav } from './hud.js';
import { esc, kindOf, KIND_LABEL, showModal } from './modal.js';

const SECTIONS = [
  { kind: 'clue', title: 'Улики' },
  { kind: 'testimony', title: 'Показания' },
  { kind: 'deduction', title: 'Выводы' },
];

function cardTile(id, k) {
  const c = getCard(id);
  const tilt = ((k * 37) % 5) - 2;
  return `<button class="tile ${kindOf(id)}" data-id="${id}" style="--tilt:${tilt}deg">
    <i class="pin"></i><span>${esc(c.title)}</span></button>`;
}

function thread(board, a, b) {
  const rect = board.getBoundingClientRect();
  const ra = a.getBoundingClientRect();
  const rb = b.getBoundingClientRect();
  const x1 = ra.left + ra.width / 2 - rect.left;
  const y1 = ra.top + 8 - rect.top + board.scrollTop;
  const x2 = rb.left + rb.width / 2 - rect.left;
  const y2 = rb.top + 8 - rect.top + board.scrollTop;
  const len = Math.hypot(x2 - x1, y2 - y1);
  const sag = Math.min(60, len / 4);
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.classList.add('thread');
  svg.setAttribute('width', rect.width);
  svg.setAttribute('height', board.scrollHeight);
  svg.innerHTML = `<path d="M${x1} ${y1}Q${(x1 + x2) / 2} ${(y1 + y2) / 2 + sag} ${x2} ${y2}" stroke-dasharray="${len * 1.3}" stroke-dashoffset="${len * 1.3}"/>`;
  board.appendChild(svg);
  return svg;
}

export function render(root, ctx) {
  let selected = null;
  const el = document.createElement('section');
  el.className = 'screen';
  el.appendChild(topbar(ctx, { title: 'Доска улик' }));
  const body = document.createElement('div');
  body.className = 'scroll board';
  el.appendChild(body);
  const bar = document.createElement('div');
  bar.className = 'select-bar';
  el.appendChild(bar);
  el.appendChild(bottomnav(ctx, 'board'));
  root.appendChild(el);

  const drawBar = () => {
    if (!selected) {
      bar.classList.remove('open');
      bar.innerHTML = '';
      return;
    }
    const c = getCard(selected);
    bar.classList.add('open');
    bar.innerHTML = `<div class="sel-card"><div class="kind">${KIND_LABEL[kindOf(selected)]}</div>
      <strong>${esc(c.title)}</strong><p>${esc(c.text)}</p></div>
      <div class="sel-hint">Выберите вторую карточку, чтобы связать их</div>
      <button class="icon-btn" data-cancel aria-label="Отменить">${ICONS.close}</button>`;
    bar.querySelector('[data-cancel]').addEventListener('click', () => { selected = null; draw(); });
  };

  const draw = () => {
    const s = ctx.state;
    const hintsLeft = MAX_HINTS - s.hintsUsed;
    const sections = SECTIONS.map(({ kind, title }) => {
      const ids = s.cards.filter((id) => kindOf(id) === kind);
      let tiles = ids.map((id, k) => cardTile(id, k)).join('');
      if (kind === 'deduction') {
        const missing = CASE.deductions.length - ids.length;
        tiles += Array.from({ length: missing }, () => '<div class="tile empty"><span>?</span></div>').join('');
      }
      if (!tiles) tiles = '<p class="muted empty-note">Пока пусто</p>';
      const total = kind === 'deduction' ? ` · ${ids.length} из ${CASE.deductions.length}` : '';
      return `<div class="section-title">${title}${total}</div><div class="tiles">${tiles}</div>`;
    }).join('');
    body.innerHTML = `
      <div class="board-tools">
        <p class="muted">Соедините две карточки, если они вместе что-то доказывают. Неверная связь стоит 5 репутации.</p>
        <button class="btn ghost hint-btn" ${hintsLeft > 0 ? '' : 'disabled'}>${ICONS.hint}<span>Подсказка (${hintsLeft})</span></button>
      </div>
      ${sections}`;
    body.querySelectorAll('.tile[data-id]').forEach((t) => {
      t.classList.toggle('selected', t.dataset.id === selected);
      t.addEventListener('click', () => onTile(t));
    });
    body.querySelector('.hint-btn').addEventListener('click', onHint);
    drawBar();
  };

  const onTile = async (tile) => {
    const id = tile.dataset.id;
    if (!selected) { selected = id; haptic('light'); draw(); return; }
    if (selected === id) { selected = null; draw(); return; }
    const first = body.querySelector(`.tile[data-id="${selected}"]`);
    const r = link(ctx.state, selected, id);
    selected = null;
    drawBar();
    if (r.outcome === 'new') {
      ctx.set(r.state);
      const line = thread(body, first, tile);
      first.classList.add('linked');
      tile.classList.add('linked');
      haptic('success');
      playFound();
      await new Promise((res) => setTimeout(res, 700));
      line.remove();
      await ctx.reveal([r.deduction.id]);
      if (ctx.screen === 'board') draw();
    } else if (r.outcome === 'none') {
      ctx.set(r.state);
      haptic('error');
      playWrong();
      [first, tile].forEach((t) => { t.classList.remove('shake'); void t.offsetWidth; t.classList.add('shake'); });
      ctx.toast('Связи нет. Репутация −5');
      setTimeout(draw, 420);
    } else if (r.outcome === 'already') {
      ctx.toast('Этот вывод уже на доске');
      draw();
    } else {
      draw();
    }
  };

  const onHint = async () => {
    const text = currentHint(ctx.state);
    if (!text) {
      showModal({ title: 'Подсказка', html: '<p class="center">Вы знаете достаточно. Пора выдвигать обвинение.</p>' });
      return;
    }
    const ok = await showModal({
      title: 'Взять подсказку?',
      html: `<p class="center muted">Подсказка стоит ${HINT_COST} репутации и может стоить вам высшего ранга.</p>`,
      actions: [{ label: 'Взять подсказку', kind: 'primary', value: true }, { label: 'Сам разберусь', kind: 'ghost', value: false }],
    });
    if (!ok) return;
    const r = useHint(ctx.state);
    if (!r.text) return;
    ctx.set(r.state);
    draw();
    showModal({ title: 'Подсказка', html: `<p class="center lead">${esc(r.text)}</p>` });
  };

  draw();
}
