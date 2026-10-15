// Regression tests for findings from the final review.
import { test, assert, assertEqual } from './runner.js';
import { CASE } from '../js/data/case.js';
import { createState, useHint, currentHint } from '../js/engine/state.js';
import { present, canTalk } from '../js/engine/talk.js';
import { save, load, clear, SAVE_KEY } from '../js/engine/storage.js';
import { SCREENS } from '../js/ui/screens.js';

test('fix: every screen is loaded eagerly', () => {
  for (const name of ['cover', 'prologue', 'map', 'room', 'talk', 'board', 'event', 'accuse', 'result']) {
    assert(SCREENS[name] && typeof SCREENS[name].render === 'function', name);
  }
});

test('fix: #app height is not forced past the visible Telegram viewport', () => {
  // Synchronous check via a sync XHR keeps the runner simple.
  const xhr = new XMLHttpRequest();
  xhr.open('GET', 'css/style.css', false);
  xhr.send();
  const block = xhr.responseText.match(/#app \{[^}]*\}/)[0];
  assert(!/min-height:\s*100dvh/.test(block), '#app must not use min-height: 100dvh');
});

test('fix: hints never point to a card no deduction or answer needs', () => {
  const useful = new Set([
    ...CASE.deductions.flatMap((d) => [d.a, d.b, d.id]),
    ...CASE.characters.flatMap((c) => c.presents.filter((p) => p.gives).map((p) => p.card)),
  ]);
  for (const h of CASE.hints) assert(useful.has(h.until), `hint until ${h.until}`);
});

test('fix: asking for the same hint again is free', () => {
  const r1 = useHint(createState(0));
  const r2 = useHint(r1.state);
  assertEqual(r2.text, r1.text);
  assertEqual(r2.state.reputation, r1.state.reputation);
  assertEqual(r2.state.hintsUsed, 1);
});

test('fix: load fills missing fields and drops unknown cards', () => {
  const s = createState(0);
  s.cards = ['glass', 'removed_card'];
  delete s.patience;
  delete s.lockedAt;
  localStorage.setItem(SAVE_KEY, JSON.stringify(s));
  const l = load();
  assertEqual(l.cards, ['glass']);
  assertEqual(l.patience.thorne, 3);
  assertEqual(l.lockedAt, {});
  clear();
});

test('fix: a lock-out lifts after any new card, not only a deduction', () => {
  let s = { ...createState(0), cards: ['iou', 'body'] };
  for (let i = 0; i < 3; i++) s = present(s, 'thorne', 'iou').state;
  assert(!canTalk(s, 'thorne'));
  s = { ...s, cards: [...s.cards, 'glass'] };
  assert(canTalk(s, 'thorne'), 'new clue unlocks');
});
