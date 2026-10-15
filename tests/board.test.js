import { test, assert, assertEqual } from './runner.js';
import { createState } from '../js/engine/state.js';
import { link } from '../js/engine/board.js';

const withCards = (cards, extra = {}) => ({ ...createState(0), cards: [...cards], ...extra });

test('board: diary+handbook gives poison', () => {
  const r = link(withCards(['diary', 'handbook']), 'diary', 'handbook');
  assertEqual(r.outcome, 'new');
  assertEqual(r.deduction.id, 'poison');
  assert(r.state.cards.includes('poison'));
  assertEqual(r.state.reputation, 100);
});

test('board: reverse order works', () => {
  const r = link(withCards(['diary', 'handbook']), 'handbook', 'diary');
  assertEqual(r.outcome, 'new');
  assertEqual(r.deduction.id, 'poison');
});

test('board: second link is already without penalty', () => {
  const r1 = link(withCards(['diary', 'handbook']), 'diary', 'handbook');
  const r2 = link(r1.state, 'handbook', 'diary');
  assertEqual(r2.outcome, 'already');
  assertEqual(r2.state.reputation, 100);
  assertEqual(r2.state.cards.filter((c) => c === 'poison').length, 1);
});

test('board: wrong pair costs 5 each time', () => {
  const r1 = link(withCards(['diary', 'iou']), 'diary', 'iou');
  assertEqual(r1.outcome, 'none');
  assertEqual(r1.state.reputation, 95);
  const r2 = link(r1.state, 'diary', 'iou');
  assertEqual(r2.state.reputation, 90);
});

test('board: self link invalid, no penalty', () => {
  const r = link(withCards(['diary']), 'diary', 'diary');
  assertEqual(r.outcome, 'invalid');
  assertEqual(r.state.reputation, 100);
});

test('board: unowned card invalid', () => {
  const r = link(withCards(['diary']), 'diary', 'handbook');
  assertEqual(r.outcome, 'invalid');
  assertEqual(r.state.reputation, 100);
  assert(!r.state.cards.includes('poison'));
});

test('board: reputation never below 0', () => {
  let s = withCards(['diary', 'iou']);
  for (let i = 0; i < 25; i++) s = link(s, 'diary', 'iou').state;
  assertEqual(s.reputation, 0);
});
