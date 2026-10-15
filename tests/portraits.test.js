import { test, assert } from './runner.js';
import { CASE } from '../js/data/case.js';
import { portraitSvg } from '../js/art/portraits.js';

test('art: every character has a distinct, valid portrait', () => {
  const seen = new Set();
  for (const ch of CASE.characters) {
    const svg = portraitSvg(ch.id);
    const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
    assert(!doc.querySelector('parsererror'), `${ch.id} parses`);
    assert(!seen.has(svg), `${ch.id} is distinct`);
    seen.add(svg);
  }
});
