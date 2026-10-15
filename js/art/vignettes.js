// Small round vignettes for prologue slides and the midgame event.

const wrap = (body) => `<svg viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <circle cx="70" cy="70" r="66" fill="#0f2620" stroke="#c9a24a" stroke-width="1.5"/>
  <circle cx="70" cy="70" r="60" fill="none" stroke="#c9a24a" stroke-width="0.6" opacity="0.6"/>
  <g stroke="#c9a24a" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round">${body}</g>
</svg>`;

export const VIGNETTES = {
  storm: wrap(`<path d="M38 70a16 16 0 0 1 8-30 22 22 0 0 1 42-4 16 16 0 0 1 14 30z" fill="#163a30"/>
    <path d="M72 70l-10 20h12l-8 22 22-30H76l8-12" fill="#e6cf8f" stroke="#e6cf8f"/>
    <path d="M44 80l-4 10M56 84l-4 10M96 80l-4 10" opacity="0.6"/>`),
  toast: wrap(`<path d="M48 44h44l-22 30z" fill="#163a30"/><path d="M70 74v30M56 106h28"/>
    <path d="M58 52h24" opacity="0.6"/><circle cx="64" cy="36" r="2"/><circle cx="76" cy="30" r="1.6"/><circle cx="70" cy="24" r="1.2"/>`),
  key: wrap(`<circle cx="52" cy="70" r="14" fill="#163a30"/><circle cx="52" cy="70" r="5"/>
    <path d="M66 70h44M98 70v12M88 70v8"/>`),
  lens: wrap(`<circle cx="62" cy="62" r="22" fill="#163a30"/><path d="M78 78l24 24" stroke-width="5"/>
    <path d="M50 56a14 14 0 0 1 10-8" opacity="0.7"/>`),
  maid: wrap(`<path d="M44 96c0-16 12-26 26-26s26 10 26 26z" fill="#163a30"/><circle cx="70" cy="56" r="13" fill="#163a30"/>
    <path d="M56 46c6-8 22-8 28 0" stroke-width="2.4"/><path d="M40 104h60" opacity="0.6"/>
    <path d="M96 40l6 6M102 34l4 2" stroke="#c24a3a"/>`),
};

export const PROLOGUE_ART = ['storm', 'toast', 'key', 'lens'];
