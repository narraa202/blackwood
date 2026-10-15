// Small art-deco SVG helpers: icons, dividers, frames. Return SVG strings.

const icon = (body) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

export const ICONS = {
  back: icon('<path d="M15 5l-7 7 7 7"/>'),
  soundOn: icon('<path d="M4 10v4h4l5 4V6L8 10H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19 6a8.5 8.5 0 0 1 0 12"/>'),
  soundOff: icon('<path d="M4 10v4h4l5 4V6L8 10H4z"/><path d="M17 9l5 6M22 9l-5 6"/>'),
  map: icon('<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>'),
  board: icon('<rect x="3" y="4" width="18" height="16" rx="1"/><path d="M7 9l5 5 5-6"/><circle cx="7" cy="9" r="1.3" fill="currentColor"/><circle cx="12" cy="14" r="1.3" fill="currentColor"/><circle cx="17" cy="8" r="1.3" fill="currentColor"/>'),
  accuse: icon('<path d="M14 4l6 6M11 7l6 6M12.5 5.5l-4 4 6 6 4-4"/><path d="M10.5 11.5L3 19l2 2 7.5-7.5"/>'),
  lock: icon('<rect x="5" y="11" width="14" height="10" rx="1"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
  hint: icon('<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>'),
  search: icon('<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5.5 5.5"/>'),
  present: icon('<rect x="4" y="6" width="12" height="15" rx="1" transform="rotate(-8 10 13)"/><path d="M14 5h5a1 1 0 0 1 1 1v13"/>'),
  close: icon('<path d="M6 6l12 12M18 6L6 18"/>'),
  check: icon('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
};

export function divider() {
  return `<svg class="divider" viewBox="0 0 180 14" aria-hidden="true">
    <g stroke="#c9a24a" fill="none" stroke-width="1">
      <path d="M0 7h70M110 7h70"/>
      <path d="M90 1l6 6-6 6-6-6z" fill="#c9a24a"/>
      <path d="M76 7l4-4 4 4-4 4zM96 7l4-4 4 4-4 4z"/>
    </g>
  </svg>`;
}

// Stepped art-deco frame drawn over a w×h area.
export function frame(w, h, inset = 10) {
  const i = inset;
  const s = 14;
  const path = (o) => `M${i + o + s} ${i + o} H${w - i - o - s} L${w - i - o} ${i + o + s} V${h - i - o - s} L${w - i - o - s} ${h - i - o} H${i + o + s} L${i + o} ${h - i - o - s} V${i + o + s} Z`;
  return `<g fill="none" stroke="#c9a24a">
    <path d="${path(0)}" stroke-width="1.5"/>
    <path d="${path(6)}" stroke-width="0.7" opacity="0.6"/>
  </g>`;
}

// Sunburst fan used as a decorative header.
export function sunburst(cx, cy, r, rays = 13, color = '#c9a24a', opacity = 0.5) {
  let out = `<g stroke="${color}" stroke-width="1" opacity="${opacity}" fill="none">`;
  for (let k = 0; k < rays; k++) {
    const a = Math.PI + (Math.PI * k) / (rays - 1);
    out += `<line x1="${cx}" y1="${cy}" x2="${(cx + r * Math.cos(a)).toFixed(1)}" y2="${(cy + r * Math.sin(a)).toFixed(1)}"/>`;
  }
  for (const f of [0.35, 0.6, 0.85]) out += `<path d="M${cx - r * f} ${cy}a${r * f} ${r * f} 0 0 1 ${2 * r * f} 0"/>`;
  return out + '</g>';
}
