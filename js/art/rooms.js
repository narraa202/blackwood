// Room scenes. Each clue is a <g class="hotspot" data-clue="ID"> with an
// invisible hit area, so players tap objects in the picture.

const C = {
  gold: '#c9a24a',
  goldSoft: '#e6cf8f',
  wood: '#3a2616',
  woodLight: '#5a3a22',
  woodDark: '#22160c',
  leather: '#5c2019',
  paper: '#efe4cc',
  lamp: '#f2c25b',
  felt: '#1f6b4a',
  glass: '#9fc1b5',
  ink: '#0a0f0d',
};

const defs = `<defs>
  <linearGradient id="r-wall" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#0c211b"/><stop offset="1" stop-color="#173d33"/>
  </linearGradient>
  <linearGradient id="r-floor" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#2b1b0f"/><stop offset="1" stop-color="#140c06"/>
  </linearGradient>
  <radialGradient id="r-lamp" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="${C.lamp}" stop-opacity="0.55"/><stop offset="1" stop-color="${C.lamp}" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="r-fire" cx="0.5" cy="0.6" r="0.5">
    <stop offset="0" stop-color="#ff9a3c" stop-opacity="0.8"/><stop offset="1" stop-color="#ff5a1f" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="r-night" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#050b0a"/><stop offset="1" stop-color="#173b45"/>
  </linearGradient>
  <linearGradient id="r-vignette" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0.6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.55"/>
  </linearGradient>
</defs>`;

function frieze(y = 40) {
  let out = `<g stroke="${C.gold}" stroke-width="1" fill="none" opacity="0.55"><path d="M0 ${y}h400M0 ${y + 10}h400"/>`;
  for (let x = 0; x < 400; x += 20) out += `<path d="M${x} ${y + 10}l10-10 10 10"/>`;
  return out + '</g>';
}

function floor(top = 400) {
  let lines = '';
  for (let k = -6; k <= 6; k++) lines += `<path d="M${200 + k * 22} ${top}L${200 + k * 70} 560"/>`;
  return `<rect y="${top}" width="400" height="${560 - top}" fill="url(#r-floor)"/>
    <g stroke="#000" stroke-opacity="0.35" stroke-width="1">${lines}</g>
    <path d="M0 ${top}h400" stroke="${C.gold}" stroke-width="2"/>
    <path d="M0 ${top - 6}h400" stroke="${C.gold}" stroke-opacity="0.35"/>`;
}

function shell(content, { floorTop = 400, wall = true } = {}) {
  return `<svg viewBox="0 0 400 560" xmlns="http://www.w3.org/2000/svg">${defs}
    ${wall ? '<rect width="400" height="560" fill="url(#r-wall)"/>' : ''}
    ${wall ? frieze() : ''}
    ${floor(floorTop)}
    ${content}
    <rect width="400" height="560" fill="url(#r-vignette)" pointer-events="none"/>
  </svg>`;
}

// Hotspot: object art plus a generous invisible tap area and a faint sparkle.
function hs(id, [x, y, w, h], body, spark = [x + w / 2, y + h / 2]) {
  return `<g class="hotspot" data-clue="${id}">
    <rect class="hit" x="${x}" y="${y}" width="${w}" height="${h}" fill="transparent"/>
    ${body}
    <g class="spark" transform="translate(${spark[0]} ${spark[1]})"><path d="M0-7L1.6-1.6 7 0 1.6 1.6 0 7-1.6 1.6-7 0-1.6-1.6z" fill="${C.goldSoft}"/></g>
    <g class="found-mark" transform="translate(${x + w - 10} ${y + 10})"><circle r="9" fill="${C.gold}"/><path d="M-4 0l3 3 5-6" stroke="${C.ink}" stroke-width="2" fill="none"/></g>
  </g>`;
}

const lampGlow = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#r-lamp)"/>`;

function rainyWindow(x, y, w, h) {
  let rain = '';
  for (let k = 0; k < 9; k++) rain += `<path d="M${x + 8 + k * (w / 9)} ${y + 10 + (k % 3) * 25}l-4 18" />`;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#r-night)"/>
    <g stroke="#9fc1d5" stroke-opacity="0.35">${rain}</g>
    <path d="M${x + w / 2} ${y}v${h}M${x} ${y + h / 2}h${w}" stroke="${C.woodDark}" stroke-width="4"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${C.gold}" stroke-width="2"/>`;
}

function curtains(x, y, w, h) {
  return `<path d="M${x - 14} ${y - 10}h34c-6 ${h / 2} 4 ${h * 0.8} -6 ${h + 20}h-28z" fill="#5c1d1a"/>
    <path d="M${x + w + 14} ${y - 10}h-34c6 ${h / 2} -4 ${h * 0.8} 6 ${h + 20}h28z" fill="#5c1d1a"/>
    <path d="M${x - 20} ${y - 12}h${w + 40}" stroke="${C.gold}" stroke-width="4"/>`;
}

function bookshelf(x, y, w, h, seed = 1) {
  const colors = ['#5c1d1a', '#1f4d40', '#3a2616', '#6b5320', '#2b3550', '#4a1a2c'];
  let out = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${C.woodDark}"/>`;
  const shelves = Math.floor(h / 50);
  for (let s = 0; s < shelves; s++) {
    const sy = y + s * 50;
    let bx = x + 6;
    let k = s * 7 + seed;
    while (bx < x + w - 10) {
      const bw = 6 + ((k * 7) % 7);
      const bh = 30 + ((k * 13) % 12);
      out += `<rect x="${bx}" y="${sy + 46 - bh}" width="${bw}" height="${bh}" fill="${colors[k % colors.length]}"/>`;
      if (k % 4 === 0) out += `<rect x="${bx}" y="${sy + 46 - bh + 6}" width="${bw}" height="2" fill="${C.gold}" opacity="0.6"/>`;
      bx += bw + 1;
      k += 1;
    }
    out += `<rect x="${x}" y="${sy + 46}" width="${w}" height="4" fill="${C.woodLight}"/>`;
  }
  return out + `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${C.gold}" stroke-opacity="0.5"/>`;
}

// ---------- Rooms ----------

function study() {
  return shell(`
    ${curtains(40, 80, 100, 130)}
    ${rainyWindow(40, 80, 100, 130)}
    <!-- portrait frame hiding the safe -->
    ${hs('safe', [160, 70, 100, 110], `
      <rect x="168" y="78" width="70" height="88" fill="${C.woodDark}" stroke="${C.gold}" stroke-width="2"/>
      <circle cx="203" cy="122" r="11" fill="#2a2a2a" stroke="${C.gold}"/>
      <path d="M203 122l6-6" stroke="${C.goldSoft}" stroke-width="2"/>
      <path d="M238 78l20 -6v100l-20-6z" fill="#4a3a20" stroke="${C.gold}"/>
      <path d="M196 150h14" stroke="${C.gold}"/>`)}
    <!-- fireplace -->
    <rect x="270" y="230" width="110" height="170" fill="#2b2b28"/>
    <rect x="262" y="222" width="126" height="14" fill="${C.woodLight}" stroke="${C.gold}"/>
    <rect x="290" y="285" width="70" height="115" fill="#0b0a08"/>
    <ellipse cx="325" cy="384" rx="34" ry="22" fill="url(#r-fire)"/>
    <path d="M304 398c4-16 10-22 12-34 6 10 4 16 10 22 4-10 8-14 8-26 8 12 12 22 10 38z" fill="#ff8a2e" opacity="0.75"/>
    <path d="M296 398h58" stroke="#3a3a36" stroke-width="4"/>
    ${hs('burntletter', [288, 330, 74, 70], `
      <path d="M300 392l10-24 12 10 10-20 10 16 12-12 4 30z" fill="#ff7b2e" opacity="0.8"/>
      <path d="M310 386l26-12 14 8-30 10z" fill="${C.paper}" opacity="0.9"/>
      <path d="M312 384l22-9" stroke="#3a2a1a" stroke-width="1"/>
      <path d="M318 388c4-2 8-1 12-3" stroke="#1a1208" stroke-width="2"/>`, [326, 372])}
    <!-- clock on mantel -->
    <rect x="300" y="196" width="40" height="26" rx="4" fill="${C.wood}" stroke="${C.gold}"/>
    <circle cx="320" cy="209" r="8" fill="${C.paper}"/>
    ${lampGlow(110, 300, 90)}
    <!-- desk -->
    <rect x="60" y="330" width="230" height="16" fill="${C.woodLight}" stroke="${C.gold}" stroke-width="1"/>
    <rect x="70" y="346" width="60" height="70" fill="${C.wood}"/>
    <rect x="220" y="346" width="60" height="70" fill="${C.wood}"/>
    <path d="M80 360h40M80 384h40M230 360h40M230 384h40" stroke="${C.gold}" stroke-opacity="0.6"/>
    <!-- banker's lamp -->
    <path d="M100 330v-28" stroke="${C.gold}" stroke-width="3"/>
    <path d="M78 304h44l-6-14H84z" fill="#1f6b4a" stroke="${C.gold}"/>
    ${hs('diary', [128, 296, 56, 36], `
      <path d="M132 328l24-8 24 8-24 4z" fill="${C.paper}"/>
      <path d="M132 328v-6l24-8v6zM180 328v-6l-24-8v6z" fill="#e3d6b6" stroke="#8a6a22" stroke-width="0.6"/>
      <path d="M138 322l14-4M162 318l12 4" stroke="#5a4a30" stroke-width="0.8"/>`, [156, 312])}
    ${hs('glass', [190, 282, 36, 50], `
      <path d="M198 300c0 14 6 20 10 20s10-6 10-20z" fill="${C.glass}" fill-opacity="0.45" stroke="${C.goldSoft}" stroke-width="1"/>
      <path d="M200 312c2 6 4 8 8 8s6-2 8-8z" fill="#8a4a12" opacity="0.8"/>
      <path d="M208 320v8M201 330h14" stroke="${C.goldSoft}"/>`, [208, 298])}
    ${hs('emptyspot', [232, 300, 48, 34], `
      <ellipse cx="256" cy="324" rx="9" ry="3.5" fill="none" stroke="#8a5a2a" stroke-width="2" opacity="0.9"/>
      <rect x="244" y="318" width="30" height="4" fill="${C.paper}" opacity="0.4"/>`, [256, 316])}
    <!-- body -->
    <ellipse cx="140" cy="470" rx="150" ry="40" fill="${C.lamp}" opacity="0.08"/>
    ${hs('body', [40, 430, 190, 90], `
      <ellipse cx="140" cy="502" rx="100" ry="14" fill="#000" opacity="0.45"/>
      <path d="M150 482l70 8 4 12-74 0z" fill="#1c2636"/>
      <path d="M214 488l14 4-2 10-14-2z" fill="#0a0a0a"/>
      <rect x="74" y="474" width="84" height="30" rx="10" fill="#222d40"/>
      <path d="M78 478l22 10-22 10z" fill="#f3ead7"/>
      <path d="M86 486l6 2-6 2z" fill="#0a0a0a"/>
      <path d="M110 476l-26-24 8-6 28 24z" fill="#222d40"/>
      <circle cx="86" cy="447" r="6" fill="#d9c6a8"/>
      <circle cx="62" cy="488" r="14" fill="#d9c6a8"/>
      <path d="M50 482c2-12 22-16 28-4" stroke="#bfbfbf" stroke-width="4" fill="none"/>
      <path d="M56 494c3 2 7 2 10 0" stroke="#4a5a8a" stroke-width="2"/>
      <path d="M130 476l2 26" stroke="${C.gold}" stroke-width="1" opacity="0.7"/>`, [118, 470])}
    ${hs('key', [232, 456, 52, 46], `
      <circle cx="250" cy="478" r="6" fill="none" stroke="${C.goldSoft}" stroke-width="2.5"/>
      <path d="M256 478h16M266 478v6M270 478v4" stroke="${C.goldSoft}" stroke-width="2.5"/>`, [258, 470])}
    <!-- rug -->
    <ellipse cx="200" cy="520" rx="170" ry="26" fill="none" stroke="${C.gold}" stroke-opacity="0.3"/>
  `);
}

function library() {
  return shell(`
    ${bookshelf(16, 70, 120, 320, 1)}
    ${bookshelf(264, 70, 120, 320, 5)}
    <!-- arched window -->
    <path d="M150 380V150a50 50 0 0 1 100 0v230z" fill="url(#r-night)" stroke="${C.gold}" stroke-width="2"/>
    <path d="M200 100v280M150 240h100" stroke="${C.woodDark}" stroke-width="4"/>
    <!-- ladder -->
    <path d="M110 80l-30 330M140 80l-30 330" stroke="${C.woodLight}" stroke-width="5"/>
    <path d="M106 130h30M100 180h30M95 230h30M89 280h30M84 330h30M78 380h30" stroke="${C.woodLight}" stroke-width="4"/>
    <!-- globe -->
    <circle cx="362" cy="430" r="24" fill="#2b4a5a" stroke="${C.gold}" stroke-width="2"/>
    <path d="M350 418c8 4 14-6 22 2s0 14 6 18" stroke="#6b8a5a" stroke-width="5" fill="none"/>
    <path d="M362 454v30M344 486h36" stroke="${C.gold}" stroke-width="3"/>
    ${lampGlow(190, 400, 110)}
    <!-- reading table -->
    <rect x="30" y="430" width="200" height="14" fill="${C.woodLight}" stroke="${C.gold}"/>
    <path d="M46 444v80M214 444v80" stroke="${C.wood}" stroke-width="10"/>
    <path d="M210 430v-30" stroke="${C.gold}" stroke-width="3"/>
    <path d="M190 402h40l-6-14h-28z" fill="#1f6b4a" stroke="${C.gold}"/>
    ${hs('handbook', [60, 384, 110, 52], `
      <g transform="translate(-30 0)">
      <path d="M100 428l46-10 46 10-46 6z" fill="${C.paper}"/>
      <path d="M100 428v-8l46-10v8zM192 428v-8l-46-10v8z" fill="#ece0c4" stroke="#8a6a22" stroke-width="0.6"/>
      <path d="M146 412v26" stroke="#a01d1d" stroke-width="3"/>
      <path d="M108 420l30-6M154 414l30 6M108 424l30-6" stroke="#5a4a30" stroke-width="0.8"/>
      </g>`, [116, 404])}
    <!-- lectern with will -->
    ${hs('oldwill', [240, 440, 96, 92], `
      <g transform="translate(40 0)">
      <path d="M220 470h56l-10 20h-36z" fill="${C.wood}" stroke="${C.gold}"/>
      <path d="M248 490v40M232 530h32" stroke="${C.wood}" stroke-width="6"/>
      <rect x="226" y="456" width="44" height="18" fill="${C.paper}" transform="rotate(-6 248 465)"/>
      <circle cx="262" cy="470" r="5" fill="#a01d1d"/>
      </g>`, [288, 462])}
  `);
}

function drawing() {
  return shell(`
    <!-- big window -->
    ${curtains(130, 70, 140, 170)}
    ${rainyWindow(130, 70, 140, 170)}
    <!-- chandelier -->
    <path d="M200 52v40" stroke="${C.gold}"/>
    <path d="M160 100c10 16 70 16 80 0" stroke="${C.gold}" stroke-width="2" fill="none"/>
    ${[160, 180, 200, 220, 240].map((x) => `<circle cx="${x}" cy="${x === 200 ? 110 : 102}" r="3" fill="${C.lamp}"/>`).join('')}
    ${lampGlow(200, 110, 90)}
    <!-- paintings -->
    <rect x="30" y="110" width="70" height="90" fill="#2a3a30" stroke="${C.gold}" stroke-width="3"/>
    <path d="M40 190l20-40 14 20 10-14 12 34z" fill="#4a6a50"/>
    <rect x="300" y="110" width="70" height="90" fill="#2a2a3a" stroke="${C.gold}" stroke-width="3"/>
    <circle cx="335" cy="150" r="18" fill="#c9a24a" opacity="0.4"/>
    <!-- sofa -->
    <path d="M60 470v-70c0-14 10-20 24-20h170c14 0 24 6 24 20v70z" fill="#1f4d40" stroke="${C.gold}" stroke-opacity="0.6"/>
    <rect x="48" y="420" width="250" height="60" rx="10" fill="#235847"/>
    <path d="M60 480v20M286 480v20" stroke="${C.wood}" stroke-width="6"/>
    <!-- armchair with Arthur's jacket -->
    ${hs('iou', [250, 380, 140, 120], `
      <path d="M290 500v-90c0-16 12-24 28-24h30c16 0 28 8 28 24v90z" fill="${C.leather}"/>
      <path d="M296 392c10-8 60-8 74 0l-6 50c-20 6-46 6-62 0z" fill="#111" opacity="0.9"/>
      <path d="M333 396l-6 40M333 396l8 38" stroke="#333" stroke-width="2"/>
      <rect x="342" y="410" width="22" height="14" fill="${C.paper}" transform="rotate(14 353 417)"/>
      <path d="M346 416l12 3" stroke="#5a4a30"/>`, [352, 414])}
    <!-- side table with book of poems -->
    ${hs('lovenote', [110, 470, 110, 74], `
      <ellipse cx="166" cy="508" rx="44" ry="10" fill="${C.woodLight}" stroke="${C.gold}"/>
      <path d="M166 518v26" stroke="${C.wood}" stroke-width="6"/>
      <rect x="142" y="494" width="40" height="12" fill="#6b1d3a" transform="rotate(-8 162 500)"/>
      <path d="M160 488l14-2 2 12-14 2z" fill="#f7e6ec" stroke="#b07a8a" stroke-width="0.8"/>`, [166, 494])}
  `);
}

function billiards() {
  return shell(`
    <!-- cue rack -->
    <rect x="28" y="90" width="60" height="200" fill="${C.woodDark}" stroke="${C.gold}" stroke-opacity="0.6"/>
    ${[38, 50, 62, 74].map((x) => `<path d="M${x} 100v180" stroke="#d8b98a" stroke-width="3"/>`).join('')}
    <!-- score card on the wall -->
    ${hs('scorecard', [300, 90, 84, 110], `
      <rect x="310" y="100" width="64" height="88" fill="${C.paper}" stroke="${C.gold}" stroke-width="2"/>
      <path d="M318 114h48M342 108v76" stroke="#5a4a30" stroke-width="0.8"/>
      ${[124, 134, 144].map((y) => `<path d="M322 ${y}h12M350 ${y}h10" stroke="#2a2118" stroke-width="1.2"/>`).join('')}
      <path d="M320 152h44" stroke="#a01d1d" stroke-dasharray="3 3"/>
      ${[162, 172].map((y) => `<path d="M322 ${y}h12M350 ${y}h10" stroke="#2a2118" stroke-width="1.2"/>`).join('')}`, [342, 144])}
    <!-- hanging lamps -->
    <path d="M120 40v120M280 40v120" stroke="${C.gold}"/>
    <path d="M90 160h60l-10-22h-40zM250 160h60l-10-22h-40z" fill="#1f6b4a" stroke="${C.gold}"/>
    ${lampGlow(120, 200, 100)}${lampGlow(280, 200, 100)}
    <!-- table -->
    <path d="M70 300h260l40 120H30z" fill="${C.woodLight}" stroke="${C.gold}"/>
    <path d="M84 310h232l32 98H52z" fill="${C.felt}"/>
    <circle cx="160" cy="350" r="7" fill="#f3ead7"/><circle cx="230" cy="370" r="7" fill="#a01d1d"/>
    <circle cx="250" cy="340" r="7" fill="#e6cf8f"/>
    <path d="M140 352l-90 40" stroke="#d8b98a" stroke-width="4"/>
    <path d="M60 420v70M340 420v70M120 420v60M280 420v60" stroke="${C.wood}" stroke-width="12"/>
    <!-- side table with cigars -->
    ${hs('cigarbox', [300, 440, 96, 90], `
      <rect x="312" y="490" width="72" height="10" fill="${C.woodLight}" stroke="${C.gold}"/>
      <path d="M322 500v40M374 500v40" stroke="${C.wood}" stroke-width="5"/>
      <rect x="320" y="470" width="56" height="20" fill="#6b3a1a" stroke="${C.gold}"/>
      <path d="M320 470l8-12h56l-8 12z" fill="#8a4a20" stroke="${C.gold}"/>
      ${[326, 336, 346, 356, 366].map((x) => `<rect x="${x}" y="474" width="7" height="13" rx="3" fill="#4a2a12"/>`).join('')}
      <rect x="338" y="478" width="20" height="5" fill="${C.gold}"/>`, [348, 466])}
    <!-- whisky glass -->
    <path d="M60 470h20l-2 20h-16z" fill="${C.glass}" fill-opacity="0.4" stroke="${C.goldSoft}"/>
  `);
}

function guest() {
  const panel = (y, h, title) => `
    <rect x="16" y="${y}" width="368" height="${h}" fill="#0f2620" stroke="${C.gold}" stroke-width="1.5"/>
    <rect x="22" y="${y + 6}" width="356" height="${h - 12}" fill="none" stroke="${C.gold}" stroke-opacity="0.35"/>
    <rect x="${200 - (title.length * 6 + 24)}" y="${y - 12}" width="${title.length * 12 + 48}" height="22" fill="#0c211b" stroke="${C.gold}"/>
    <text x="200" y="${y + 4}" text-anchor="middle" font-family="Poiret One, serif" font-size="13" letter-spacing="2" fill="${C.goldSoft}">${title}</text>`;
  return `<svg viewBox="0 0 400 560" xmlns="http://www.w3.org/2000/svg">${defs}
    <rect width="400" height="560" fill="url(#r-wall)"/>
    ${panel(26, 160, 'АРТУР')}
    <!-- Arthur's bed -->
    <rect x="40" y="90" width="20" height="80" fill="${C.wood}"/>
    <rect x="60" y="120" width="250" height="34" fill="#e8dcc4"/>
    <rect x="60" y="112" width="60" height="18" rx="6" fill="#f3ead7"/>
    <path d="M120 120h190v34H120z" fill="#5c1d1a"/>
    <rect x="60" y="154" width="250" height="10" fill="#cbbd9e"/>
    <path d="M70 164v12M300 164v12" stroke="${C.wood}" stroke-width="5"/>
    <rect x="330" y="120" width="34" height="46" fill="${C.wood}"/>
    <path d="M336 110h22l-4-12h-14z" fill="#1f6b4a"/>
    ${hs('arthurvial', [180, 140, 110, 44], `
      <rect x="226" y="150" width="30" height="14" fill="${C.paper}" transform="rotate(-4 241 157)"/>
      <rect x="244" y="148" width="10" height="18" rx="2" fill="#5a3a1a" stroke="${C.goldSoft}"/>`, [240, 152])}
    ${panel(214, 160, 'ДОКТОР ФИНЧ')}
    <!-- Doctor's room -->
    <rect x="40" y="250" width="24" height="110" fill="${C.wood}"/>
    <rect x="64" y="300" width="120" height="30" fill="#e8dcc4"/>
    <path d="M64 330h120v10H64z" fill="#cbbd9e"/>
    <path d="M300 236v100" stroke="${C.goldSoft}" stroke-width="3"/>
    <path d="M292 236c0-8 16-8 16 0" stroke="#c0c0c0" stroke-width="4" fill="none"/>
    ${hs('lancet', [196, 266, 80, 70], `
      <rect x="204" y="316" width="64" height="40" fill="${C.wood}"/>
      <rect x="210" y="300" width="42" height="18" fill="#d9d2c0" transform="rotate(-6 231 309)"/>
      <text x="230" y="312" text-anchor="middle" font-size="7" fill="#7a1a1a" font-family="serif" transform="rotate(-6 231 309)">THE LANCET</text>
      <path d="M252 300l6 6-4 8" stroke="#d9d2c0" stroke-width="1.5" fill="none"/>`, [232, 296])}
    ${hs('receipt', [300, 290, 80, 70], `
      <path d="M312 350v-34c0-10 8-16 18-16h20c10 0 18 6 18 16v34z" fill="#2a1a12" stroke="${C.gold}"/>
      <path d="M330 300c0-10 20-10 20 0" stroke="${C.gold}" stroke-width="2" fill="none"/>
      <rect x="342" y="296" width="18" height="24" fill="#f7f0e0" transform="rotate(12 351 308)"/>
      <path d="M346 304h10M346 309h10M346 314h6" stroke="#5a4a30" stroke-width="0.8" transform="rotate(12 351 308)"/>`, [340, 316])}
    ${panel(402, 146, 'ДЖУЛИАН')}
    <!-- Julian's room -->
    <rect x="40" y="440" width="70" height="90" fill="${C.wood}"/>
    <path d="M46 450h58M46 476h58M46 502h58" stroke="${C.gold}" stroke-opacity="0.4"/>
    <rect x="300" y="440" width="60" height="44" fill="url(#r-night)" stroke="${C.gold}"/>
    ${hs('suitcase', [140, 440, 140, 96], `
      <rect x="152" y="470" width="116" height="58" rx="6" fill="#6b4a2a" stroke="${C.gold}"/>
      <path d="M152 488h116" stroke="#4a301a" stroke-width="3"/>
      <path d="M196 470v-10h28v10" stroke="${C.gold}" stroke-width="3" fill="none"/>
      <rect x="204" y="484" width="12" height="9" fill="${C.gold}"/>
      <path d="M168 470v58M252 470v58" stroke="#4a301a" stroke-width="5"/>`, [210, 488])}
    <rect width="400" height="560" fill="url(#r-vignette)" pointer-events="none"/>
  </svg>`;
}

function lucy() {
  return shell(`
    <!-- slanted attic ceiling -->
    <path d="M0 0h400v60L250 180H0z" fill="#0a1714"/>
    <path d="M400 60L250 180" stroke="${C.wood}" stroke-width="6"/>
    <!-- small window -->
    ${rainyWindow(70, 90, 70, 70)}
    <!-- candle -->
    ${lampGlow(300, 320, 80)}
    <!-- bed -->
    <rect x="30" y="360" width="20" height="120" fill="${C.wood}"/>
    <rect x="50" y="410" width="210" height="40" fill="#d8ccb0"/>
    <rect x="50" y="398" width="54" height="20" rx="8" fill="#efe4cc"/>
    <path d="M104 410h156v40H104z" fill="#3a4a6a"/>
    <path d="M60 450v40M250 450v40" stroke="${C.wood}" stroke-width="6"/>
    <!-- apron on a hook with note -->
    <circle cx="200" cy="230" r="4" fill="${C.gold}"/>
    ${hs('lucynote', [160, 226, 84, 120], `
      <path d="M200 232l-28 20 8 80h40l8-80z" fill="#f3ead7"/>
      <path d="M180 270h40v26h-40z" fill="#e3d6b6" stroke="#b8a888"/>
      <rect x="192" y="262" width="20" height="14" fill="#fffaf0" stroke="#8a6a22" stroke-width="0.6" transform="rotate(-8 202 269)"/>`, [202, 270])}
    <!-- nightstand -->
    <rect x="276" y="380" width="64" height="80" fill="${C.wood}" stroke="${C.gold}" stroke-opacity="0.5"/>
    <path d="M300 380v-34" stroke="#f3ead7" stroke-width="8"/>
    <path d="M300 346c-4-8 0-14 0-18 4 4 6 10 0 18z" fill="${C.lamp}"/>
    ${hs('sleepglass', [312, 330, 60, 54], `
      <path d="M322 352h22l-3 28h-16z" fill="${C.glass}" fill-opacity="0.45" stroke="${C.goldSoft}"/>
      <path d="M326 370h14l-1 9h-12z" fill="#e8e8e0" opacity="0.85"/>`, [334, 350])}
    <!-- broken cup on floor -->
    <path d="M200 500l12-6 8 8-10 6zM224 510l10 2-4 8z" fill="#efe4cc"/>
  `, { floorTop: 470 });
}

function conservatory() {
  let lattice = '';
  for (let x = 20; x <= 380; x += 45) lattice += `<path d="M${x} 60V380"/>`;
  for (let y = 100; y <= 380; y += 70) lattice += `<path d="M10 ${y}H390"/>`;
  return shell(`
    <path d="M10 380V120Q200-40 390 120v260z" fill="url(#r-night)"/>
    <g stroke="${C.gold}" stroke-opacity="0.55" stroke-width="2" fill="none">${lattice}
      <path d="M10 380V120Q200-40 390 120v260"/></g>
    <g stroke="#9fc1d5" stroke-opacity="0.35">${Array.from({ length: 14 }, (_, k) => `<path d="M${30 + k * 26} ${80 + (k % 4) * 40}l-5 20"/>`).join('')}</g>
    <!-- plants -->
    <path d="M30 400c0-60 10-120 30-150M60 400c0-50 20-90 50-110M40 300c-20-10-30-30-30-50" stroke="#2a6a4a" stroke-width="6" fill="none"/>
    <ellipse cx="80" cy="300" rx="40" ry="16" fill="#2a6a4a" transform="rotate(-30 80 300)"/>
    <ellipse cx="40" cy="270" rx="34" ry="12" fill="#1f5a3e" transform="rotate(40 40 270)"/>
    <path d="M350 400c0-80-10-120-20-160" stroke="#2a6a4a" stroke-width="6" fill="none"/>
    <ellipse cx="320" cy="250" rx="44" ry="14" fill="#2a6a4a" transform="rotate(30 320 250)"/>
    <ellipse cx="360" cy="280" rx="36" ry="12" fill="#1f5a3e" transform="rotate(-30 360 280)"/>
    <!-- bench -->
    <path d="M120 470h110M130 470v40M220 470v40M120 450c20-14 90-14 110 0" stroke="${C.gold}" stroke-opacity="0.5" stroke-width="4" fill="none"/>
    <!-- palm in pot -->
    ${hs('bottle', [236, 300, 120, 140], `
      <path d="M296 380c-30-40-60-50-80-48M296 380c20-50 50-60 70-58M296 380c-10-50 0-70 8-80M296 380c10-30 30-40 50-36" stroke="#2f7a52" stroke-width="5" fill="none"/>
      <path d="M262 380h68l-10 50h-48z" fill="#8a4a2a" stroke="${C.gold}"/>
      <path d="M262 380h68" stroke="${C.gold}" stroke-width="3"/>
      <rect x="306" y="366" width="10" height="20" rx="2" fill="#5a3a1a" stroke="${C.goldSoft}" transform="rotate(18 311 376)"/>`, [304, 372])}
    ${hs('canemarks', [60, 470, 190, 76], `
      <path d="M70 500c40-10 120-12 170 2 0 20-20 34-80 34s-90-14-90-36z" fill="#3a2a1a"/>
      <path d="M100 504c4-2 10-2 12 4 2 6-8 8-12 4zM140 512c4-2 10-2 12 4 2 6-8 8-12 4zM180 504c4-2 10-2 12 4 2 6-8 8-12 4z" fill="#1a120a"/>
      <circle cx="126" cy="520" r="3" fill="#0a0604"/><circle cx="166" cy="528" r="3" fill="#0a0604"/><circle cx="206" cy="518" r="3" fill="#0a0604"/>`, [150, 510])}
  `, { floorTop: 440 });
}

const ROOMS = { study, library, drawing, billiards, guest, lucy, conservatory };

export function roomSvg(roomId) {
  const fn = ROOMS[roomId];
  return fn ? fn() : '';
}
