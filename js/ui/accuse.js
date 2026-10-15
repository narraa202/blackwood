// Accusation: five questions, a proof for "who", then the verdict.

import { CASE } from '../data/case.js';
import { getCard } from '../engine/state.js';
import { finish } from '../engine/scoring.js';
import { haptic } from '../telegram.js';
import { playThunder } from '../sound.js';
import { topbar } from './hud.js';
import { esc, kindOf, KIND_LABEL, showModal } from './modal.js';

export function render(root, ctx) {
  const answers = { who: null, proof: null, how: null, why: null, framer: null, necklace: null };
  // Steps: who, proof, how, why, framer, necklace.
  const steps = ['who', 'proof', 'how', 'why', 'framer', 'necklace'];
  let step = -1;

  const el = document.createElement('section');
  el.className = 'screen';
  el.appendChild(topbar(ctx, { title: 'Обвинение', back: 'map' }));
  const body = document.createElement('div');
  body.className = 'scroll accuse';
  el.appendChild(body);
  root.appendChild(el);

  const choose = (key, value) => {
    answers[key] = value;
    haptic('light');
    step += 1;
    draw();
  };

  const draw = () => {
    const key = steps[step];
    const dots = steps.map((_, k) => `<i class="${k <= step ? 'on' : ''}"></i>`).join('');
    let inner;
    if (step === steps.length) {
      const q = Object.fromEntries(CASE.questions.map((x) => [x.id, x]));
      const label = (id, v) => q[id].options.find((o) => o.id === v).label;
      inner = `
        <div class="eyebrow">Ваша версия</div>
        <ul class="verdict-list">
          <li><span>Убийца</span><b>${esc(label('who', answers.who))}</b></li>
          <li><span>Доказательство</span><b>${esc(answers.proof ? getCard(answers.proof).title : 'нет')}</b></li>
          <li><span>Способ</span><b>${esc(label('how', answers.how))}</b></li>
          <li><span>Мотив</span><b>${esc(label('why', answers.why))}</b></li>
          <li><span>Подставил Артура</span><b>${esc(label('framer', answers.framer))}</b></li>
          <li><span>Колье взяли</span><b>${esc(label('necklace', answers.necklace))}</b></li>
        </ul>
        <button class="btn danger block" data-final>Огласить при всех</button>
        <button class="btn ghost block" data-back-step>Изменить ответ</button>`;
    } else if (key === 'proof') {
      const ids = ctx.state.cards;
      inner = `
        <div class="eyebrow">Вопрос 1 · доказательство</div>
        <h2 class="question">Чем вы это докажете?</h2>
        <div class="options proof">${ids.map((id) => `<button class="option ${kindOf(id)}" data-v="${id}">
          <small>${KIND_LABEL[kindOf(id)]}</small>${esc(getCard(id).title)}</button>`).join('')}
          <button class="option" data-v="">Доказательств нет — я просто уверен(а)</button></div>
        <button class="btn ghost block" data-back-step>Назад</button>`;
    } else {
      const q = CASE.questions.find((x) => x.id === key);
      const n = CASE.questions.indexOf(q) + 1;
      inner = `
        <div class="eyebrow">Вопрос ${n} из ${CASE.questions.length}</div>
        <h2 class="question">${esc(q.text)}</h2>
        <div class="options">${q.options.map((o) => `<button class="option" data-v="${o.id}">${esc(o.label)}</button>`).join('')}</div>
        ${step > 0 ? '<button class="btn ghost block" data-back-step>Назад</button>' : ''}`;
    }
    body.innerHTML = `<div class="dots">${dots}</div><div class="accuse-step">${inner}</div>`;
    body.querySelectorAll('[data-v]').forEach((b) => b.addEventListener('click', () => choose(key, b.dataset.v)));
    const back = body.querySelector('[data-back-step]');
    if (back) back.addEventListener('click', () => { step -= 1; draw(); });
    const fin = body.querySelector('[data-final]');
    if (fin) {
      fin.addEventListener('click', () => {
        haptic('heavy');
        playThunder();
        ctx.set(finish(ctx.state, answers, Date.now()));
        ctx.go('result');
      });
    }
    body.scrollTop = 0;
  };

  showModal({
    title: 'Выдвинуть обвинение?',
    html: '<p class="center muted">Все соберутся в гостиной. Обвинение можно выдвинуть только один раз, после этого расследование закончится.</p>',
    actions: [
      { label: 'Я готов(а)', kind: 'danger', value: true },
      { label: 'Ещё поищу улики', kind: 'ghost', value: false },
    ],
  }).then((ok) => {
    if (!ok) { ctx.go('map'); return; }
    step = 0;
    draw();
  });
}
