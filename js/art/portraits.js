// Art-deco character portraits (100×100 viewBox), built from shared parts.

const SKIN = '#e2cdb0';
const SKIN_SHADOW = '#c9b08f';

function base(accent, body) {
  let rays = '';
  for (let k = 0; k < 12; k++) {
    const a = Math.PI + (Math.PI * k) / 11;
    rays += `<line x1="50" y1="62" x2="${(50 + 70 * Math.cos(a)).toFixed(1)}" y2="${(62 + 70 * Math.sin(a)).toFixed(1)}"/>`;
  }
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect width="100" height="100" fill="${accent}"/>
    <g stroke="#c9a24a" stroke-width="0.6" opacity="0.35">${rays}</g>
    <circle cx="50" cy="62" r="30" fill="none" stroke="#c9a24a" stroke-width="0.6" opacity="0.4"/>
    ${body}
  </svg>`;
}

const head = (extra = '') => `
  <rect x="44" y="56" width="12" height="12" fill="${SKIN_SHADOW}"/>
  <ellipse cx="50" cy="44" rx="14.5" ry="17.5" fill="${SKIN}"/>
  <path d="M50 46l-2 7h3" stroke="${SKIN_SHADOW}" stroke-width="1.2" fill="none"/>
  ${extra}`;

const eyes = (y = 43, color = '#2a2118') => `
  <path d="M41 ${y}h5M54 ${y}h5" stroke="${color}" stroke-width="1.8" stroke-linecap="round"/>`;
const brows = (y = 38, tilt = 0) => `
  <path d="M40 ${y + tilt}l6 ${-tilt}M54 ${y}l6 ${tilt}" stroke="#2a2118" stroke-width="1.4" stroke-linecap="round"/>`;
const mouth = (d = 'M45 55q5 2 10 0', color = '#8a4a3a') => `<path d="${d}" stroke="${color}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;

const shoulders = (fill) => `<path d="M8 100c3-20 20-32 42-32s39 12 42 32z" fill="${fill}"/>`;
const shirtV = `<path d="M40 68l10 22 10-22z" fill="#f3ead7"/>`;
const bowtie = (c = '#0a0a0a') => `<path d="M43 70l7 3 7-3v7l-7-3-7 3z" fill="${c}"/>`;
const lapels = (c) => `<path d="M40 68l10 22-14-4zM60 68l-10 22 14-4z" fill="${c}"/>`;

const P = {
  jenkins: () => base('#22303a', `
    ${shoulders('#0e0e10')}${shirtV}${lapels('#1c1c22')}${bowtie()}
    ${head(`
      <path d="M36 40c0-8 2-14 4-16M64 40c0-8-2-14-4-16" stroke="#9a9a9a" stroke-width="4" stroke-linecap="round"/>
      <path d="M36 42v8M64 42v8" stroke="#9a9a9a" stroke-width="3"/>
      ${brows(37, 1)}${eyes(43)}${mouth('M45 55h10', '#7a4a3a')}
      <path d="M42 34q8-4 16 0" stroke="${SKIN_SHADOW}" stroke-width="0.8" fill="none"/>`)}`),

  lucy: () => base('#2b3a2f', `
    ${shoulders('#1a1a1e')}<path d="M38 70q12 10 24 0l-2 6q-10 6-20 0z" fill="#f3ead7"/>
    ${head(`
      <path d="M35 44c-2-14 6-24 15-24s17 10 15 24c-2-8-6-12-15-12s-13 4-15 12z" fill="#6b3f22"/>
      <circle cx="50" cy="22" r="6" fill="#6b3f22"/>
      <path d="M34 30q16-14 32 0l-3 4q-13-8-26 0z" fill="#f7f2e6" stroke="#d8ccb0" stroke-width="0.8"/>
      ${brows(38, -1)}${eyes(44)}${mouth('M46 55q4 1 8 0')}
      <circle cx="42" cy="50" r="2.5" fill="#e8a090" opacity="0.5"/><circle cx="58" cy="50" r="2.5" fill="#e8a090" opacity="0.5"/>`)}`),

  arthur: () => base('#3a2026', `
    ${shoulders('#121216')}${shirtV}${lapels('#1e1e26')}
    <path d="M44 71l6 2M56 71l-3 8" stroke="#0a0a0a" stroke-width="2.5" stroke-linecap="round"/>
    ${head(`
      <path d="M35 40c-1-14 7-20 16-20 10 0 16 6 15 18-4-6-12-10-22-8-4 1-7 4-9 10z" fill="#1a1410"/>
      <path d="M44 24q6 4 20 6" stroke="#3a2a20" stroke-width="1"/>
      ${brows(38, 2)}${eyes(44)}${mouth('M45 56q5-2 10 1')}
      <path d="M38 52q12 12 24 0" stroke="#7a6a5a" stroke-width="4" opacity="0.25" fill="none"/>`)}`),

  vivian: () => base('#3b2a3e', `
    <path d="M14 100c4-18 18-28 36-28s32 10 36 28z" fill="${SKIN}"/>
    <path d="M18 100c6-12 18-16 32-16s26 4 32 16z" fill="#0f1f1a"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7, 8].map((k) => `<circle cx="${38 + k * 3}" cy="${74 + Math.sin((k / 8) * Math.PI) * 5}" r="1.6" fill="#f7f2e6"/>`).join('')}
    ${head(`
      <path d="M34 50c-4-20 4-31 16-31s20 11 16 31c-2-4-3-10-4-14-6 2-14 0-22-6-2 6-4 12-6 20z" fill="#0d0a0a"/>
      <path d="M38 30q6 4 12 0t12 2" stroke="#2a2222" stroke-width="1.2" fill="none"/>
      <path d="M34 34q16-6 32 0" stroke="#c9a24a" stroke-width="2" fill="none"/>
      <path d="M62 32c6-10 10-12 14-12-2 4-6 8-12 14" fill="#e6cf8f"/>
      ${brows(38, -1)}${eyes(44, '#1a1010')}
      <path d="M40 41l-2-2M60 41l2-2" stroke="#1a1010" stroke-width="1"/>
      ${mouth('M46 55q4 2 8 0', '#a01d2d')}<path d="M46 55q4-2 8 0" stroke="#a01d2d" stroke-width="1.6" fill="none"/>`)}`),

  julian: () => base('#2a3440', `
    ${shoulders('#4a4f58')}<path d="M42 68l8 20 8-20z" fill="#e8e4da"/>
    <path d="M48 72h4l1 16-3 3-3-3z" fill="#6b1d2a"/>${lapels('#3c4048')}
    ${head(`
      <path d="M35 40c-2-12 5-20 15-20 12 0 18 8 15 20-2-6-4-10-6-10l-2 4-3-5-4 5-3-5-4 6c-4-2-6 0-8 5z" fill="#8a6a42"/>
      ${brows(38, 0)}${eyes(44)}
      <circle cx="43.5" cy="44" r="5" fill="none" stroke="#c9a24a" stroke-width="1.2"/>
      <circle cx="56.5" cy="44" r="5" fill="none" stroke="#c9a24a" stroke-width="1.2"/>
      <path d="M48.5 44h3" stroke="#c9a24a" stroke-width="1"/>
      ${mouth('M46 56q4-1 8 0')}`)}`),

  thorne: () => base('#3a3020', `
    ${shoulders('#6b2020')}<path d="M44 68h12v6H44z" fill="#4a1414"/>
    ${[0, 1, 2].map((k) => `<rect x="${26 + k * 7}" y="80" width="5" height="3" fill="${['#c9a24a', '#2a5a9a', '#e6cf8f'][k]}"/>`).join('')}
    <circle cx="30" cy="90" r="3" fill="#c9a24a"/><circle cx="38" cy="90" r="3" fill="#d8d8d8"/>
    <path d="M10 82h18M72 82h18" stroke="#c9a24a" stroke-width="2"/>
    ${head(`
      <path d="M36 36c0-10 6-16 14-16s14 6 14 16c-3-6-8-8-14-8s-11 2-14 8z" fill="#e8e8e8"/>
      ${brows(37, 1)}${eyes(43)}
      <path d="M38 52c4-4 8-3 12-1 4-2 8-3 12 1-4 3-8 2-12 0-4 2-8 3-12 0z" fill="#f2f2f2"/>`)}`),

  finch: () => base('#1f3a33', `
    ${shoulders('#16161a')}${shirtV}${lapels('#22222a')}
    <path d="M45 70l5 2 5-2-1 6-4-1-4 1z" fill="#3a1a2a"/>
    <path d="M60 86q8 2 14-4" stroke="#c9a24a" stroke-width="1" fill="none"/>
    ${head(`
      <path d="M36 40c-1-10 4-18 14-19 10 1 15 9 14 19-1-6-3-9-6-10-5-1-11-1-16 0-3 1-5 4-6 10z" fill="#9a9690"/>
      <path d="M42 22q8-2 16 0" stroke="${SKIN}" stroke-width="3"/>
      ${brows(38, 1)}${eyes(44)}
      <circle cx="43.5" cy="44" r="4.2" fill="#cfe4e8" fill-opacity="0.25" stroke="#c9a24a" stroke-width="1"/>
      <circle cx="56.5" cy="44" r="4.2" fill="#cfe4e8" fill-opacity="0.25" stroke="#c9a24a" stroke-width="1"/>
      <path d="M48 44h4M60.5 44q6 4 4 16" stroke="#c9a24a" stroke-width="0.8" fill="none"/>
      <path d="M43 56c2 6 4 9 7 9s5-3 7-9c-4 2-10 2-14 0z" fill="#9a9690"/>
      ${mouth('M46 56q4 2 8 0', '#6a3a2a')}`)}`),
};

export function portraitSvg(charId) {
  return P[charId] ? P[charId]() : base('#163a30', '');
}
