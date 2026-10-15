// Cover illustration: Blackwood Hall at night in a storm.

import { frame, sunburst } from './deco.js';

function rainLines(count) {
  let out = '<g class="rain">';
  for (let k = 0; k < count; k++) {
    const x = (k * 37) % 460;
    const y = (k * 53) % 600;
    const d = ((k * 0.13) % 0.7).toFixed(2);
    out += `<line x1="${x}" y1="${y - 600}" x2="${x - 6}" y2="${y - 580}" style="animation-delay:-${d}s"/>`;
  }
  return out + '</g>';
}

export function coverSvg() {
  const windows = [];
  const lit = new Set([1, 4, 6, 9, 13]);
  let n = 0;
  for (const [x0, y0, cols, rows] of [[118, 330, 4, 2], [238, 330, 4, 2], [186, 300, 1, 3]]) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = x0 + c * 14;
        const y = y0 + r * 30;
        const on = lit.has(n++);
        windows.push(`<rect x="${x}" y="${y}" width="7" height="16" rx="3.5" ${on ? 'class="window-lit" fill="#f2c25b"' : 'fill="#0b1512"'}/>`);
      }
    }
  }
  return `<svg viewBox="0 0 400 780" preserveAspectRatio="xMidYMin slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cv-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#050b0a"/>
      <stop offset="0.55" stop-color="#12302a"/>
      <stop offset="1" stop-color="#0a1512"/>
    </linearGradient>
    <radialGradient id="cv-moon" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#f6ecd0"/>
      <stop offset="0.6" stop-color="#e6cf8f" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#e6cf8f" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="cv-glow" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f2c25b" stop-opacity="0.35"/>
      <stop offset="1" stop-color="#f2c25b" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="400" height="780" fill="url(#cv-sky)"/>
  <g transform="translate(0 -30)">
  ${sunburst(200, 300, 260, 19, '#c9a24a', 0.12)}
  <circle cx="290" cy="120" r="70" fill="url(#cv-moon)"/>
  <circle cx="290" cy="120" r="26" fill="#efe2bd"/>
  <g fill="#0a1714" opacity="0.9">
    <ellipse cx="60" cy="150" rx="90" ry="22"/><ellipse cx="120" cy="136" rx="50" ry="20"/>
    <ellipse cx="320" cy="168" rx="110" ry="18"/><ellipse cx="250" cy="160" rx="46" ry="16"/>
    <ellipse cx="360" cy="150" rx="40" ry="16"/>
  </g>
  <!-- hills -->
  <path d="M0 410c60-24 120-30 200-20s150 6 200-14v224H0z" fill="#0b1a16"/>
  <!-- manor -->
  <g fill="#060e0c">
    <path d="M100 420V320l30-24 30 24v100z"/>
    <path d="M220 420V320l30-24 30 24v100z"/>
    <path d="M150 420V312h100v108z"/>
    <path d="M168 312l32-40 32 40z"/>
    <rect x="180" y="250" width="40" height="70"/>
    <path d="M176 252l24-34 24 34z"/>
    <rect x="196" y="200" width="8" height="22"/>
    <rect x="112" y="282" width="8" height="26"/><rect x="262" y="282" width="8" height="26"/>
    <path d="M80 420v-60h20v60zM280 420v-60h20v60z"/>
  </g>
  <rect x="100" y="420" width="200" height="60" fill="url(#cv-glow)" opacity="0.6"/>
  ${windows.join('')}
  <rect x="192" y="380" width="16" height="40" rx="8" fill="#f2c25b" class="window-lit"/>
  <!-- trees -->
  <g fill="#050c0a">
    <path d="M30 430c0-60 14-110 24-110s24 50 24 110z"/>
    <path d="M330 430c0-50 12-96 20-96s20 46 20 96z"/>
    <path d="M362 440c0-40 10-80 16-80s16 40 16 80z"/>
  </g>
  <path d="M0 430h400v380H0z" fill="#07110e"/>
  <path d="M150 810l42-380h16l42 380z" fill="#0d1d18"/>
  </g>
  ${rainLines(70)}
  ${frame(400, 780, 12)}
</svg>`;
}
