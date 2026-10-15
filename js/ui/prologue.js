// Prologue: short illustrated slides.

import { CASE } from '../data/case.js';
import { VIGNETTES, PROLOGUE_ART } from '../art/vignettes.js';
import { esc } from './modal.js';

export function render(root, ctx) {
  let i = 0;
  const el = document.createElement('section');
  el.className = 'screen prologue';
  root.appendChild(el);

  const draw = () => {
    const last = i === CASE.prologue.length - 1;
    el.innerHTML = `
      <div class="slide" key="${i}">
        <div class="slide-art">${VIGNETTES[PROLOGUE_ART[i]]}</div>
        <p class="lead">${esc(CASE.prologue[i])}</p>
      </div>
      <div class="prologue-foot">
        <div class="dots">${CASE.prologue.map((_, k) => `<i class="${k === i ? 'on' : ''}"></i>`).join('')}</div>
        <button class="btn primary" data-next>${last ? 'К делу' : 'Далее'}</button>
        ${last ? '' : '<button class="btn ghost" data-skip>Пропустить</button>'}
      </div>`;
    el.querySelector('[data-next]').addEventListener('click', () => {
      if (last) ctx.go('map');
      else { i += 1; draw(); }
    });
    const skip = el.querySelector('[data-skip]');
    if (skip) skip.addEventListener('click', () => ctx.go('map'));
  };
  draw();
}
