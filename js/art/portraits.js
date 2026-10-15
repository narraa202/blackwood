// Character portraits. Placeholder initials until the full art lands.

import { CASE } from '../data/case.js';

export function portraitSvg(charId) {
  const ch = CASE.characters.find((c) => c.id === charId);
  const initials = ch ? ch.name.split(' ').map((w) => w[0]).join('').slice(0, 2) : '?';
  return `<svg viewBox="0 0 100 100"><rect width="100" height="100" fill="#163a30"/>
    <text x="50" y="60" text-anchor="middle" font-size="32" fill="#e6cf8f" font-family="Playfair Display">${initials}</text></svg>`;
}
