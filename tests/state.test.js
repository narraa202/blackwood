import { test, assert, assertEqual } from './runner.js';
import {
  createState, findClue, unlockedRooms, pendingEvent, applyEvent,
  availableCharacters, hasCard, clueCount,
} from '../js/engine/state.js';

const find = (s, ...ids) => ids.reduce((acc, id) => findClue(acc, id).state, s);
const withCards = (s, cards, extra = {}) => ({ ...s, cards: [...cards], ...extra });

test('state: fresh state', () => {
  const s = createState(1000);
  assertEqual(s.reputation, 100);
  assertEqual(s.cards, []);
  assertEqual(s.startedAt, 1000);
  assertEqual(s.version, 1);
  assertEqual(unlockedRooms(s), ['study', 'library', 'drawing', 'billiards']);
});

test('state: findClue adds once', () => {
  const s1 = findClue(createState(0), 'glass');
  assertEqual(s1.result, 'new');
  const s2 = findClue(s1.state, 'glass');
  assertEqual(s2.result, 'already');
  assertEqual(s2.state.cards, ['glass']);
  assert(hasCard(s2.state, 'glass'));
});

test('state: guest wing at 4 clues', () => {
  let s = find(createState(0), 'body', 'glass', 'key');
  assert(!unlockedRooms(s).includes('guest'), 'guest locked at 3');
  assertEqual(findClue(s, 'lancet').result, 'locked');
  s = find(s, 'diary');
  assertEqual(clueCount(s), 4);
  assert(unlockedRooms(s).includes('guest'), 'guest open at 4');
  assertEqual(findClue(s, 'lancet').result, 'new');
});

test('state: testimonies do not count toward guest wing', () => {
  const s = withCards(createState(0), ['body', 'glass', 'key', 't_habit', 't_quarrel']);
  assert(!unlockedRooms(s).includes('guest'));
});

test('state: suitcase requires theft', () => {
  const s = find(createState(0), 'body', 'glass', 'key', 'diary');
  assertEqual(findClue(s, 'suitcase').result, 'locked');
  const s2 = withCards(s, [...s.cards, 'theft']);
  assertEqual(findClue(s2, 'suitcase').result, 'new');
});

test('state: midgame triggers', () => {
  const eight = ['body', 'glass', 'key', 'diary', 'safe', 'emptyspot', 't_habit', 't_cane'];
  const base = createState(0);
  assertEqual(pendingEvent(withCards(base, eight, { talked: ['lucy'] })), 'midgame');
  assertEqual(pendingEvent(withCards(base, eight.slice(0, 7), { talked: ['lucy'] })), null);
  assertEqual(pendingEvent(withCards(base, eight)), null, 'no lucy, 8 cards');
  const twelve = [...eight.slice(0, 6), 'burntletter', 'handbook', 'oldwill', 'scorecard', 'cigarbox', 'iou'];
  assertEqual(pendingEvent(withCards(base, twelve)), 'midgame', 'no lucy, 12 cards');
  const after = applyEvent(withCards(base, eight, { talked: ['lucy'] }), 'midgame');
  assertEqual(pendingEvent(after), null);
  assert(unlockedRooms(after).includes('lucy') && unlockedRooms(after).includes('conservatory'));
  assert(!availableCharacters(after).includes('lucy'));
  assert(availableCharacters(base).includes('lucy'));
});

test('state: event rooms locked before event', () => {
  const s = find(createState(0), 'body', 'glass', 'key', 'diary');
  assertEqual(findClue(s, 'bottle').result, 'locked');
  assertEqual(findClue(s, 'lucynote').result, 'locked');
});

test('state: unknown id', () => {
  const s = createState(0);
  const r = findClue(s, 'nope');
  assertEqual(r.result, 'unknown');
  assertEqual(r.state, s);
});

test('state: immutability', () => {
  const s = createState(0);
  const before = JSON.stringify(s);
  findClue(s, 'glass');
  applyEvent(s, 'midgame');
  assertEqual(JSON.stringify(s), before);
});
