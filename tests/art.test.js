import { test, assert, assertEqual } from './runner.js';
import { CASE } from '../js/data/case.js';
import { roomSvg } from '../js/art/rooms.js';

const parse = (svg) => new DOMParser().parseFromString(svg, 'image/svg+xml');

test('art: every clue has a hotspot in its room', () => {
  for (const room of CASE.rooms) {
    const doc = parse(roomSvg(room.id));
    assert(!doc.querySelector('parsererror'), `${room.id} svg parses`);
    const found = [...doc.querySelectorAll('[data-clue]')].map((n) => n.getAttribute('data-clue')).sort();
    const expected = CASE.clues.filter((c) => c.room === room.id).map((c) => c.id).sort();
    assertEqual(found, expected, room.id);
  }
});

test('art: room svg uses the 400x560 viewBox', () => {
  for (const room of CASE.rooms) {
    assertEqual(parse(roomSvg(room.id)).documentElement.getAttribute('viewBox'), '0 0 400 560', room.id);
  }
});
