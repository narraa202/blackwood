// Result: verdict scene, rank, stats, the truth, share and replay.

import { CASE } from '../data/case.js';
import { SHARE_LINK } from '../config.js';
import { share } from '../telegram.js';
import { clear } from '../engine/storage.js';
import { divider } from '../art/deco.js';
import { portraitSvg } from '../art/portraits.js';
import { esc, showModal } from './modal.js';

const RANKS = ['Констебль', 'Сержант', 'Инспектор', 'Старший инспектор', 'Великий сыщик'];

function badge(rank) {
  const level = RANKS.indexOf(rank) + 1;
  const stars = Array.from({ length: 5 }, (_, k) => {
    const x = 60 + (k - 2) * 16;
    return `<path d="M${x} 112l5 5-5 5-5-5z" fill="${k < level ? '#e6cf8f' : 'none'}" stroke="#c9a24a"/>`;
  }).join('');
  let rays = '';
  for (let k = 0; k < 24; k++) {
    const a = (Math.PI * 2 * k) / 24;
    rays += `<line x1="${60 + 40 * Math.cos(a)}" y1="${60 + 40 * Math.sin(a)}" x2="${60 + 54 * Math.cos(a)}" y2="${60 + 54 * Math.sin(a)}"/>`;
  }
  return `<svg viewBox="0 0 120 130" class="badge" aria-hidden="true">
    <g stroke="#c9a24a" stroke-width="1.2" opacity="0.7">${rays}</g>
    <circle cx="60" cy="60" r="38" fill="#0f2620" stroke="#c9a24a" stroke-width="2"/>
    <circle cx="60" cy="60" r="32" fill="none" stroke="#c9a24a" stroke-width="0.7"/>
    <path d="M60 36l7 17h18l-14 11 5 18-16-11-16 11 5-18-14-11h18z" fill="#c9a24a"/>
    ${stars}
  </svg>`;
}

const fmtTime = (ms) => {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

export function render(root, ctx) {
  const f = ctx.state.finished;
  if (!f) { ctx.go('map'); return; }
  const caught = f.correct.who;
  const qs = Object.fromEntries(CASE.questions.map((q) => [q.id, q]));
  const label = (id, v) => (qs[id].options.find((o) => o.id === v) || { label: '—' }).label;
  const rows = CASE.questions.map((q) => {
    const ok = f.correct[q.id];
    return `<li class="${ok ? 'ok' : 'bad'}"><span>${esc(q.text)}</span>
      <b>${ok ? '✓' : '✗'} ${esc(label(q.id, f.answers[q.id]))}</b></li>`;
  }).join('');

  const el = document.createElement('section');
  el.className = 'screen';
  el.innerHTML = `<div class="scroll result">
    <div class="eyebrow">${caught ? 'Дело раскрыто' : 'Дело провалено'}</div>
    <div class="result-portrait ${caught ? 'caught' : 'escaped'}">${portraitSvg('finch')}</div>
    <h1 class="display result-title">${caught ? 'Убийца разоблачён' : 'Убийца ушёл'}</h1>
    ${divider()}
    <p class="lead">${esc(caught ? CASE.finale.caught : f.answers.who === 'finch' ? CASE.finale.unproven : CASE.finale.escaped)}</p>
    <div class="rank-box">
      ${badge(f.rank)}
      <div class="rank-name">${esc(f.rank)}</div>
      <div class="stats">
        <div><b>${f.score}</b><span>очков</span></div>
        <div><b>${fmtTime(f.timeMs)}</b><span>время</span></div>
        <div><b>${f.cluesFound}/${f.cluesTotal}</b><span>улик</span></div>
        <div><b>${f.count}/5</b><span>ответов</span></div>
      </div>
    </div>
    <div class="stack">
      <button class="btn primary block" data-share>Поделиться результатом</button>
      <button class="btn block" data-truth>Как всё было на самом деле</button>
      <button class="btn ghost block" data-again>Сыграть снова</button>
    </div>
    <div class="section-title">Ваша версия</div>
    <ul class="verdict-list">${rows}</ul>
  </div>`;
  root.appendChild(el);

  el.querySelector('[data-share]').addEventListener('click', async () => {
    const text = caught
      ? `Я раскрыл(а) дело «${CASE.title}»: ранг «${f.rank}», ${f.score} очков из 100. Сможешь лучше?`
      : `Я расследовал(а) дело «${CASE.title}» и упустил(а) убийцу. Ранг «${f.rank}». Попробуешь ты?`;
    const url = SHARE_LINK || `${location.origin}${location.pathname}`;
    const how = await share(text, url);
    if (how === 'copied') ctx.toast('Текст скопирован — отправьте его друзьям');
    if (how === 'failed') ctx.toast('Не получилось поделиться');
  });
  el.querySelector('[data-truth]').addEventListener('click', () => {
    showModal({ title: 'Как всё было', html: `<p>${esc(CASE.finale.truth)}</p>` });
  });
  el.querySelector('[data-again]').addEventListener('click', async () => {
    const ok = await showModal({
      title: 'Сыграть снова?',
      html: '<p class="center muted">Результат этого расследования будет стёрт.</p>',
      actions: [{ label: 'Начать заново', kind: 'danger', value: true }, { label: 'Отмена', kind: 'ghost', value: false }],
    });
    if (!ok) return;
    clear();
    ctx.state = null;
    ctx.go('cover');
  });
}
