// Plays the whole game automatically to prove every card is reachable
// and the case can be solved without soft-locks.
import { test, assert, assertEqual } from './runner.js';
import { CASE } from '../js/data/case.js';
import { createState, findClue, unlockedRooms, pendingEvent, applyEvent, availableCharacters } from '../js/engine/state.js';
import { link } from '../js/engine/board.js';
import { meet, availableTopics, askTopic, present } from '../js/engine/talk.js';
import { finish } from '../js/engine/scoring.js';

function solve(start, { skipLucy = false } = {}) {
  let s = start;
  for (let guard = 0; guard < 50; guard++) {
    const before = s.cards.length + s.events.length;
    const ev = pendingEvent(s);
    if (ev) s = applyEvent(s, ev);
    for (const c of CASE.clues) if (unlockedRooms(s).includes(c.room)) s = findClue(s, c.id).state;
    for (const id of availableCharacters(s)) {
      if (skipLucy && id === 'lucy') continue;
      s = meet(s, id);
      for (const t of availableTopics(s, id)) s = askTopic(s, id, t.id).state;
      const ch = CASE.characters.find((c) => c.id === id);
      for (const p of ch.presents) if (s.cards.includes(p.card)) s = present(s, id, p.card).state;
    }
    for (const d of CASE.deductions) if (s.cards.includes(d.a) && s.cards.includes(d.b)) s = link(s, d.a, d.b).state;
    if (s.cards.length + s.events.length === before) break;
  }
  return s;
}

const total = CASE.clues.length + CASE.testimonies.length + CASE.deductions.length;

test('solver: reaches every card', () => {
  const s = solve(createState(0));
  const missing = [...CASE.clues, ...CASE.testimonies, ...CASE.deductions].map((c) => c.id).filter((id) => !s.cards.includes(id));
  assertEqual(missing, []);
  assertEqual(s.cards.length, total);
  assertEqual(s.reputation, 100);
  assert(s.events.includes('midgame'));
});

test('solver: without Lucy still reaches midgame and every card except t_cane', () => {
  const s = solve(createState(0), { skipLucy: true });
  assert(s.events.includes('midgame'), 'midgame');
  const missing = [...CASE.clues, ...CASE.testimonies, ...CASE.deductions].map((c) => c.id).filter((id) => !s.cards.includes(id));
  assertEqual(missing, ['t_cane']);
});

test('solver: then perfect accusation is Великий сыщик', () => {
  const s = finish(solve(createState(0)), { who: 'finch', proof: 'falsealibi', how: 'digitalis', why: 'embezzlement', framer: 'finch', necklace: 'vivian_julian' }, 1);
  assertEqual(s.finished.rank, 'Великий сыщик');
  assertEqual(s.finished.score, 100);
});
