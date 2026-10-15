// Interrogation screen: portrait, dialogue, topics, presenting cards.

import { canTalk, meet, availableTopics, askTopic, present, getCharacter, cleanupLock } from '../engine/talk.js';
import { portraitSvg } from '../art/portraits.js';
import { ICONS } from '../art/deco.js';
import { haptic } from '../telegram.js';
import { playWrong } from '../sound.js';
import { topbar, bottomnav } from './hud.js';
import { esc, kindOf, KIND_LABEL } from './modal.js';
import { getCard, availableCharacters } from '../engine/state.js';

const REFUSED = 'Не желает с вами говорить. Найдите что-то новое — тогда, может быть, передумает.';

function pickCard(ctx) {
  return new Promise((resolve) => {
    const groups = ['clue', 'testimony', 'deduction'].map((kind) => {
      const ids = ctx.state.cards.filter((id) => kindOf(id) === kind);
      if (!ids.length) return '';
      return `<div class="pick-group"><div class="pick-title">${KIND_LABEL[kind]}</div>
        ${ids.map((id) => `<button class="pick ${kind}" data-id="${id}">${esc(getCard(id).title)}</button>`).join('')}</div>`;
    }).join('');
    const el = document.createElement('div');
    el.className = 'overlay';
    el.innerHTML = `<div class="modal picker">
      <h2>Что предъявить?</h2>
      ${groups || '<p class="center muted">У вас пока нет улик.</p>'}
      <div class="actions"><button class="btn ghost" data-cancel>Отмена</button></div>
    </div>`;
    document.getElementById('app').appendChild(el);
    const done = (v) => { el.remove(); resolve(v); };
    el.querySelectorAll('[data-id]').forEach((b) => b.addEventListener('click', () => done(b.dataset.id)));
    el.querySelector('[data-cancel]').addEventListener('click', () => done(null));
  });
}

export function render(root, ctx, { id }) {
  const ch = getCharacter(id);
  if (!ch || !availableCharacters(ctx.state).includes(id)) {
    ctx.go('map');
    return;
  }
  const firstMeeting = !ctx.state.talked.includes(id);
  ctx.set(cleanupLock(meet(ctx.state, id)));

  const el = document.createElement('section');
  el.className = 'screen';
  el.appendChild(topbar(ctx, { title: ch.name, back: 'map' }));
  const body = document.createElement('div');
  body.className = 'scroll talk';
  body.innerHTML = `
    <div class="talk-head">
      <div class="talk-portrait">${portraitSvg(id)}</div>
      <div class="talk-role">${esc(ch.role)}</div>
      <div class="patience" aria-label="Терпение"></div>
    </div>
    <div class="bubble"><p></p></div>
    <div class="topics"></div>
    <button class="btn block present-btn">${ICONS.present}<span>Предъявить улику</span></button>`;
  el.appendChild(body);
  el.appendChild(bottomnav(ctx, 'map'));
  root.appendChild(el);

  const bubble = body.querySelector('.bubble');
  const say = (text, mood = '') => {
    bubble.className = `bubble ${mood}`;
    bubble.innerHTML = `<p>${esc(text)}</p>`;
    bubble.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'ease-out' });
  };

  const draw = () => {
    const s = ctx.state;
    const talkable = canTalk(s, id);
    body.querySelector('.patience').innerHTML = Array.from({ length: 3 }, (_, k) =>
      `<i class="${k < s.patience[id] ? 'on' : ''}"></i>`).join('');
    body.querySelector('.talk-portrait').classList.toggle('angry', !talkable);
    const topics = availableTopics(s, id);
    body.querySelector('.topics').innerHTML = topics.map((t) => {
      const seen = s.seenTopics.includes(`${id}:${t.id}`);
      return `<button class="topic${seen ? ' seen' : ''}" data-topic="${t.id}" ${talkable ? '' : 'disabled'}>
        <span>${esc(t.label)}</span>${seen ? ICONS.check : ''}</button>`;
    }).join('');
    body.querySelector('.present-btn').disabled = !talkable;
    body.querySelectorAll('[data-topic]').forEach((b) => b.addEventListener('click', async () => {
      const r = askTopic(ctx.state, id, b.dataset.topic);
      if (!r.text) return;
      ctx.set(r.state);
      say(r.text);
      draw();
      if (r.gained.length) {
        haptic('success');
        await ctx.reveal(r.gained);
      }
    }));
  };

  body.querySelector('.present-btn').addEventListener('click', async () => {
    const cardId = await pickCard(ctx);
    if (!cardId) return;
    const r = present(ctx.state, id, cardId);
    ctx.set(r.state);
    if (r.outcome === 'reveal' || r.outcome === 'already') {
      say(r.text, 'reveal');
      haptic(r.gained.length ? 'success' : 'light');
    } else if (r.outcome === 'wrong') {
      say(r.text, 'wrong');
      haptic('error');
      playWrong();
      const p = body.querySelector('.talk-portrait');
      p.classList.remove('shake');
      void p.offsetWidth;
      p.classList.add('shake');
      ctx.toast(canTalk(ctx.state, id) ? 'Мимо. Репутация −10' : 'Мимо. Репутация −10. Собеседник замкнулся.');
    } else if (r.outcome === 'refused') {
      say(REFUSED, 'wrong');
    }
    draw();
    if (r.gained.length) await ctx.reveal(r.gained);
  });

  if (!canTalk(ctx.state, id)) say(REFUSED, 'wrong');
  else say(firstMeeting ? ch.intro : `${ch.name} ждёт ваших вопросов.`);
  draw();
}
