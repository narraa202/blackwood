import { test, assert, assertEqual } from './runner.js';
import { CASE } from '../js/data/case.js';

const cardIds = () => [...CASE.clues, ...CASE.testimonies, ...CASE.deductions].map((c) => c.id);
const isCard = (id) => cardIds().includes(id);
const roomIds = () => CASE.rooms.map((r) => r.id);

test('case: ids are globally unique', () => {
  const ids = cardIds();
  assertEqual(ids.length, new Set(ids).size, 'duplicate card id');
  const chars = CASE.characters.map((c) => c.id);
  assertEqual(chars.length, new Set(chars).size, 'duplicate character id');
});

test('case: every reference exists', () => {
  for (const c of CASE.clues) {
    assert(roomIds().includes(c.room), `clue ${c.id} room ${c.room}`);
    if (c.requires) assert(isCard(c.requires), `clue ${c.id} requires ${c.requires}`);
  }
  for (const d of CASE.deductions) {
    assert(isCard(d.a) && isCard(d.b), `deduction ${d.id}`);
  }
  for (const t of CASE.testimonies) {
    assert(CASE.characters.some((c) => c.id === t.from), `testimony ${t.id} from ${t.from}`);
  }
  for (const ch of CASE.characters) {
    for (const tp of ch.topics) {
      for (const r of tp.requires || []) assert(isCard(r), `${ch.id}.${tp.id} requires ${r}`);
      if (tp.gives) assert(isCard(tp.gives), `${ch.id}.${tp.id} gives ${tp.gives}`);
    }
    for (const p of ch.presents) {
      assert(isCard(p.card), `${ch.id} present ${p.card}`);
      if (p.gives) assert(isCard(p.gives), `${ch.id} present gives ${p.gives}`);
    }
  }
  for (const h of CASE.hints) assert(isCard(h.until), `hint until ${h.until}`);
  for (const q of CASE.questions) {
    assert(q.options.some((o) => o.id === q.answer), `question ${q.id} answer`);
  }
  const who = CASE.questions.find((q) => q.id === 'who');
  for (const p of who.proof) assert(isCard(p), `proof ${p}`);
});

test('case: spec counts', () => {
  assertEqual(CASE.clues.length, 21, 'clues');
  assertEqual(CASE.testimonies.length, 8, 'testimonies');
  assertEqual(CASE.deductions.length, 8, 'deductions');
  assertEqual(CASE.characters.length, 7, 'characters');
  assertEqual(CASE.characters.filter((c) => c.suspect).length, 5, 'suspects');
  assertEqual(CASE.questions.length, 5, 'questions');
  assertEqual(CASE.rooms.length, 7, 'rooms');
});

test('case: answers match spec', () => {
  const a = Object.fromEntries(CASE.questions.map((q) => [q.id, q.answer]));
  assertEqual(a, { who: 'finch', how: 'digitalis', why: 'embezzlement', framer: 'finch', necklace: 'vivian_julian' });
  assertEqual(CASE.questions.find((q) => q.id === 'who').proof, ['framed', 'falsealibi', 'purchase', 'lucywitness']);
});

test('case: each testimony is given only by its own character', () => {
  for (const t of CASE.testimonies) {
    const givers = CASE.characters.filter((ch) =>
      ch.topics.some((tp) => tp.gives === t.id) || ch.presents.some((p) => p.gives === t.id));
    assertEqual(givers.map((g) => g.id), [t.from], `testimony ${t.id}`);
  }
});

test('case: clues are never given by dialogue', () => {
  const clueIds = CASE.clues.map((c) => c.id);
  for (const ch of CASE.characters) {
    for (const x of [...ch.topics, ...ch.presents]) {
      assert(!x.gives || !clueIds.includes(x.gives), `${ch.id} gives clue ${x.gives}`);
    }
  }
});
