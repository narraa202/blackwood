// Cover screen: storm, title, start/continue.

import { coverSvg } from '../art/cover.js';
import { ICONS, divider } from '../art/deco.js';
import { isSoundOn, toggleSound, playThunder } from '../sound.js';
import { showModal } from './modal.js';

export function render(root, ctx) {
  const saved = ctx.state;
  const el = document.createElement('section');
  el.className = 'screen cover';
  el.innerHTML = `
    <div class="cover-art">${coverSvg()}</div>
    <div class="cover-flash"></div>
    <button class="icon-btn sound-corner" aria-label="Звук">${isSoundOn() ? ICONS.soundOn : ICONS.soundOff}</button>
    <div class="cover-content">
      <div class="eyebrow">Детектив · 1926</div>
      <h1 class="display cover-title">Смерть<br><span>в Блэквуд-холле</span></h1>
      ${divider()}
      <p class="cover-sub">Одна ночь. Пять подозреваемых. Один убийца.</p>
      <div class="stack" data-actions></div>
    </div>`;
  root.appendChild(el);

  const actions = el.querySelector('[data-actions]');
  const add = (label, cls, fn) => {
    const b = document.createElement('button');
    b.className = `btn ${cls}`;
    b.textContent = label;
    b.addEventListener('click', fn);
    actions.appendChild(b);
  };
  const fresh = () => { ctx.newGame(); ctx.go('prologue'); };
  const confirmFresh = async () => {
    const ok = await showModal({
      title: 'Начать заново?',
      html: '<p class="center muted">Текущее расследование будет потеряно.</p>',
      actions: [{ label: 'Начать заново', kind: 'danger', value: true }, { label: 'Отмена', kind: 'ghost', value: false }],
    });
    if (ok) fresh();
  };

  if (saved && saved.finished) {
    add('Итоги расследования', 'primary', () => ctx.go('result'));
    add('Сыграть снова', 'ghost', confirmFresh);
  } else if (saved) {
    add('Продолжить расследование', 'primary', () => ctx.go('map'));
    add('Начать заново', 'ghost', confirmFresh);
  } else {
    add('Начать расследование', 'primary', fresh);
  }

  const snd = el.querySelector('.sound-corner');
  snd.addEventListener('click', () => {
    snd.innerHTML = toggleSound() ? ICONS.soundOn : ICONS.soundOff;
    if (isSoundOn()) playThunder();
  });

  const flash = el.querySelector('.cover-flash');
  let timer = null;
  const strike = () => {
    flash.classList.remove('on');
    void flash.offsetWidth;
    flash.classList.add('on');
    setTimeout(playThunder, 250);
    timer = setTimeout(strike, 5000 + Math.random() * 5000);
  };
  timer = setTimeout(strike, 1200);
  return () => clearTimeout(timer);
}
