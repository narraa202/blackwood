// Manor map: rooms and the people to interrogate.

import { CASE } from '../data/case.js';
import { unlockedRooms, availableCharacters, hasCard, clueCount } from '../engine/state.js';
import { canTalk } from '../engine/talk.js';
import { portraitSvg } from '../art/portraits.js';
import { topbar, bottomnav, progressLine } from './hud.js';
import { esc } from './modal.js';

// Floor plan layout in a 360×330 viewBox: [x, y, w, h, label lines].
const LAYOUT = {
  library: [10, 10, 165, 90, ['Библиотека']],
  study: [185, 10, 165, 90, ['Кабинет', 'лорда']],
  drawing: [10, 110, 165, 90, ['Гостиная']],
  billiards: [185, 110, 165, 90, ['Бильярдная']],
  conservatory: [10, 210, 110, 110, ['Оранжерея']],
  guest: [125, 210, 110, 110, ['Гостевое', 'крыло']],
  lucy: [240, 210, 110, 110, ['Комната', 'Люси']],
};

const GLYPH = {
  study: '<path d="M-14 6h28M-10 6V-2h20v8M-4-2v-6h8v6" />',
  library: '<path d="M-14 8V-8M-8 8V-6M-2 8V-9M4 8V-5M10 8l4-15" />',
  drawing: '<path d="M-14 6V-2a4 4 0 0 1 8 0v2h12v-2a4 4 0 0 1 8 0v8zM-12 6v4M12 6v4" />',
  billiards: '<circle r="7"/><circle r="2.5" />',
  guest: '<path d="M-12 8V-6h24v14M-12 0h24M-6-6v6" />',
  lucy: '<path d="M-10 8V-2l10-7 10 7V8zM-3 8V2h6v6" />',
  conservatory: '<path d="M-12 8a12 14 0 0 1 24 0zM0 8V-6M-6 8l6-8 6 8" />',
};

const TITLES = ['Леди', 'Полковник', 'Доктор'];
export const shortName = (name) => {
  const w = name.split(' ');
  return TITLES.includes(w[0]) ? w[1] : w[0];
};

function roomStats(state, roomId) {
  const clues = CASE.clues.filter((c) => c.room === roomId);
  const found = clues.filter((c) => hasCard(state, c.id)).length;
  return { found, total: clues.length };
}

function lockReason(room) {
  if (room.unlock.type === 'clues') return `${room.unlock.count} улики`;
  return 'позже';
}

function mapSvg(state) {
  const open = unlockedRooms(state);
  const rooms = CASE.rooms.map((room) => {
    const [x, y, w, h, lines] = LAYOUT[room.id];
    const isOpen = open.includes(room.id);
    const { found, total } = roomStats(state, room.id);
    const cls = ['map-room', isOpen ? '' : 'locked', isOpen && found === total ? 'done' : '', isOpen && found === 0 ? 'fresh' : ''].join(' ');
    const cx = x + w / 2;
    const ty = y + h / 2 - (lines.length - 1) * 9 + 10;
    const label = lines.map((l, k) => `<text x="${cx}" y="${ty + k * 18}" text-anchor="middle" font-size="15">${esc(l)}</text>`).join('');
    const sub = isOpen
      ? `<text class="count" x="${cx}" y="${y + h - 10}" text-anchor="middle">${found === total ? '✓ осмотрено' : `${found} / ${total}`}</text>`
      : `<text class="count" x="${cx}" y="${y + h - 10}" text-anchor="middle" opacity="0.6">закрыто · ${lockReason(room)}</text>`;
    return `<g class="${cls}" data-room="${room.id}" role="button" aria-label="${esc(room.name)}">
      <rect class="room-bg" x="${x}" y="${y}" width="${w}" height="${h}" rx="2"/>
      <g transform="translate(${cx} ${y + 24})" stroke="#c9a24a" stroke-width="1.4" fill="none" opacity="${isOpen ? 0.9 : 0.3}">${GLYPH[room.id]}</g>
      ${label}${sub}
    </g>`;
  }).join('');
  return `<svg viewBox="0 0 360 330" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="356" height="326" fill="none" stroke="#c9a24a" stroke-opacity="0.4"/>
    ${rooms}
  </svg>`;
}

function objective(state) {
  if (!clueCount(state)) return 'Начните с кабинета: тело лорда ещё там. Затем поговорите с дворецким.';
  if (!state.events.includes('midgame')) return 'Все говорят, что это Артур. Слишком уж удобно, не так ли?';
  return 'Убийца заметает следы. Проверьте комнату Люси и оранжерею.';
}

export function render(root, ctx) {
  const s = ctx.state;
  const el = document.createElement('section');
  el.className = 'screen';
  el.appendChild(topbar(ctx, { title: 'Блэквуд-холл' }));

  const body = document.createElement('div');
  body.className = 'scroll';
  const avail = availableCharacters(s);
  const people = CASE.characters.map((ch) => {
    const gone = !avail.includes(ch.id);
    const angry = !gone && !canTalk(s, ch.id);
    const fresh = !gone && !s.talked.includes(ch.id);
    return `<button class="person${gone ? ' gone' : ''}${angry ? ' angry' : ''}${fresh ? ' new' : ''}" data-char="${ch.id}" ${gone ? 'disabled' : ''}>
      <span class="ph">${portraitSvg(ch.id)}</span>
      <span>${esc(shortName(ch.name))}</span>
      <small>${gone ? 'без сознания' : angry ? 'обижен(а)' : esc(ch.role)}</small>
    </button>`;
  }).join('');
  body.innerHTML = `
    <div class="map-wrap">${mapSvg(s)}</div>
    <div class="objective">${esc(objective(s))}<br><small>${esc(progressLine(s))}</small></div>
    <div class="section-title">Допросы</div>
    <div class="people">${people}</div>`;
  el.appendChild(body);
  el.appendChild(bottomnav(ctx, 'map'));
  root.appendChild(el);

  body.querySelectorAll('[data-room]').forEach((g) => {
    g.addEventListener('click', () => {
      const room = CASE.rooms.find((r) => r.id === g.dataset.room);
      if (!unlockedRooms(ctx.state).includes(room.id)) {
        ctx.toast(room.unlock.type === 'clues'
          ? `Дженкинс проводит вас сюда, когда найдёте ${room.unlock.count} улики.`
          : 'Сюда пока незачем идти.');
        return;
      }
      ctx.go('room', { id: room.id });
    });
  });
  body.querySelectorAll('[data-char]').forEach((b) => {
    b.addEventListener('click', () => ctx.go('talk', { id: b.dataset.char }));
  });
}
