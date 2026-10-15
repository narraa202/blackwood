import { test, assertEqual } from './runner.js';
import { createState, findClue } from '../js/engine/state.js';
import { save, load, clear, SAVE_KEY } from '../js/engine/storage.js';

test('storage: save/load round trip', () => {
  const s = findClue(createState(123), 'glass').state;
  save(s);
  assertEqual(load(), s);
  clear();
  assertEqual(load(), null);
});

test('storage: garbage JSON is ignored', () => {
  localStorage.setItem(SAVE_KEY, '{not json');
  assertEqual(load(), null);
  clear();
});

test('storage: other version is ignored', () => {
  localStorage.setItem(SAVE_KEY, JSON.stringify({ ...createState(0), version: 2 }));
  assertEqual(load(), null);
  clear();
});

test('storage: wrong shape is ignored', () => {
  localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 1, cards: 'oops' }));
  assertEqual(load(), null);
  localStorage.setItem(SAVE_KEY, 'null');
  assertEqual(load(), null);
  clear();
});
