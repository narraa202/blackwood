import { test, assert, assertEqual } from './runner.js';
import { CASE } from '../js/data/case.js';
import { createState, currentHint, useHint } from '../js/engine/state.js';
import { evaluate, rankFor, computeResult, finish } from '../js/engine/scoring.js';

const PERFECT = { who: 'finch', proof: 'framed', how: 'digitalis', why: 'embezzlement', framer: 'finch', necklace: 'vivian_julian' };
const allClues = CASE.clues.map((c) => c.id);

test('scoring: evaluate perfect answers', () => {
  const e = evaluate(PERFECT);
  assertEqual(e.count, 5);
  assertEqual(e.correct, { who: true, how: true, why: true, framer: true, necklace: true });
});

test('scoring: right suspect wrong proof is not correct', () => {
  const e = evaluate({ ...PERFECT, proof: 'iou' });
  assertEqual(e.correct.who, false);
  assertEqual(e.count, 4);
});

test('scoring: perfect run is Великий сыщик', () => {
  const s = { ...createState(0), cards: allClues };
  const r = computeResult(s, PERFECT, 754000);
  assertEqual(r.score, 100);
  assertEqual(r.rank, 'Великий сыщик');
  assertEqual(r.timeMs, 754000);
  assertEqual([r.cluesFound, r.cluesTotal], [21, 21]);
});

test('scoring: score formula', () => {
  // 4 correct, rep 60, 7 of 21 clues: round(80 * 0.8) + round(10/3) = 64 + 3
  const s = { ...createState(0), cards: allClues.slice(0, 7), reputation: 60 };
  const r = computeResult(s, { ...PERFECT, necklace: 'arthur' }, 0);
  assertEqual(r.score, 67);
  assertEqual(r.rank, 'Инспектор');
});

test('scoring: rank thresholds', () => {
  const ranks = [39, 40, 59, 60, 79, 80].map((sc) => rankFor(sc, 4, 0, 100));
  assertEqual(ranks, ['Констебль', 'Сержант', 'Сержант', 'Инспектор', 'Инспектор', 'Старший инспектор']);
});

test('scoring: 5/5 with 2 hints is not Великий сыщик', () => {
  assertEqual(rankFor(95, 5, 2, 100), 'Старший инспектор');
  assertEqual(rankFor(90, 5, 1, 69), 'Старший инспектор');
  assertEqual(rankFor(90, 5, 1, 70), 'Великий сыщик');
});

test('scoring: score finite at rep 0 and no clues', () => {
  const s = { ...createState(0), reputation: 0 };
  const r = computeResult(s, { who: 'arthur', proof: null, how: 'blow', why: 'debts', framer: 'nobody', necklace: 'killer' }, 0);
  assertEqual(r.score, 0);
  assertEqual(r.rank, 'Констебль');
});

test('scoring: score capped at 100', () => {
  const s = { ...createState(0), cards: allClues };
  assert(computeResult(s, PERFECT, 0).score <= 100);
});

test('scoring: finish sets result and end time', () => {
  const s = finish({ ...createState(10), cards: allClues }, PERFECT, 5000);
  assertEqual(s.endedAt, 5000);
  assertEqual(s.finished.rank, 'Великий сыщик');
  assertEqual(s.finished.timeMs, 4990);
  assertEqual(s.finished.answers, PERFECT);
});

test('hints: current hint follows the critical path', () => {
  const s = createState(0);
  assertEqual(currentHint(s), CASE.hints[0].text);
  assertEqual(currentHint({ ...s, cards: [CASE.hints[0].until] }), CASE.hints[1].text);
  const all = CASE.hints.map((h) => h.until);
  assertEqual(currentHint({ ...s, cards: all }), null);
});

test('hints: useHint costs 15 and stops at 3', () => {
  let s = createState(0);
  for (let i = 0; i < 3; i++) {
    const r = useHint(s);
    assert(r.text, `hint ${i}`);
    s = { ...r.state, cards: [...r.state.cards, CASE.hints[i].until] };
  }
  assertEqual(s.hintsUsed, 3);
  assertEqual(s.reputation, 55);
  const r4 = useHint(s);
  assertEqual(r4.text, null);
  assertEqual(r4.state.reputation, 55);
});

test('hints: no hint left to give costs nothing', () => {
  const s = { ...createState(0), cards: CASE.hints.map((h) => h.until) };
  const r = useHint(s);
  assertEqual(r.text, null);
  assertEqual(r.state.hintsUsed, 0);
});

test('scoring: escaped murderer caps the rank at Сержант', () => {
  const s = { ...createState(0), cards: allClues };
  const r = computeResult(s, { ...PERFECT, proof: 'burntletter' }, 0);
  assertEqual(r.count, 4);
  assertEqual(r.rank, 'Сержант');
  assertEqual(rankFor(90, 4, 0, 100, false), 'Сержант');
  assertEqual(rankFor(30, 4, 0, 100, false), 'Констебль');
});
