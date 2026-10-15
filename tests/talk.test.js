import { test, assert, assertEqual } from './runner.js';
import { createState, applyEvent } from '../js/engine/state.js';
import { link } from '../js/engine/board.js';
import { canTalk, meet, availableTopics, askTopic, present, cleanupLock } from '../js/engine/talk.js';

const withCards = (cards, extra = {}) => ({ ...createState(0), cards: [...cards], ...extra });

test('talk: meet records character once', () => {
  const s = meet(meet(createState(0), 'jenkins'), 'jenkins');
  assertEqual(s.talked, ['jenkins']);
});

test('talk: jenkins habit topic gives t_habit once', () => {
  const r1 = askTopic(createState(0), 'jenkins', 'habit');
  assertEqual(r1.gained, ['t_habit']);
  assert(r1.text.length > 0);
  const r2 = askTopic(r1.state, 'jenkins', 'habit');
  assertEqual(r2.gained, []);
  assertEqual(r2.state.cards.filter((c) => c === 't_habit').length, 1);
  assert(r2.state.seenTopics.includes('jenkins:habit'));
});

test('talk: presenting scorecard to thorne gives t_alibi', () => {
  const r = present(withCards(['scorecard']), 'thorne', 'scorecard');
  assertEqual(r.outcome, 'reveal');
  assertEqual(r.gained, ['t_alibi']);
  assertEqual(r.state.reputation, 100);
});

test('talk: repeat present is already without penalty', () => {
  const r1 = present(withCards(['scorecard']), 'thorne', 'scorecard');
  const r2 = present(r1.state, 'thorne', 'scorecard');
  assertEqual(r2.outcome, 'already');
  assertEqual(r2.state.reputation, 100);
  assertEqual(r2.state.patience.thorne, 3);
});

test('talk: present without a gift still reveals', () => {
  const r = present(withCards(['iou']), 'arthur', 'iou');
  assertEqual(r.outcome, 'reveal');
  assertEqual(r.gained, []);
});

test('talk: cannot present an unowned card', () => {
  const r = present(createState(0), 'thorne', 'scorecard');
  assertEqual(r.outcome, 'invalid');
  assertEqual(r.state.reputation, 100);
});

test('talk: wrong present costs 10 and patience', () => {
  const r = present(withCards(['iou']), 'thorne', 'iou');
  assertEqual(r.outcome, 'wrong');
  assertEqual(r.state.reputation, 90);
  assertEqual(r.state.patience.thorne, 2);
});

test('talk: three wrongs lock out, next deduction unlocks with patience 3', () => {
  let s = withCards(['iou', 'diary', 'handbook']);
  for (let i = 0; i < 3; i++) s = present(s, 'thorne', 'iou').state;
  assertEqual(s.patience.thorne, 0);
  assert(!canTalk(s, 'thorne'), 'locked');
  const refused = present(s, 'thorne', 'iou');
  assertEqual(refused.outcome, 'refused');
  assertEqual(refused.state.reputation, s.reputation, 'no penalty when refused');
  assertEqual(askTopic(s, 'thorne', 'friend').gained, []);
  s = link(s, 'diary', 'handbook').state;
  assert(canTalk(s, 'thorne'), 'unlocked after deduction');
  s = cleanupLock(s);
  assertEqual(s.patience.thorne, 3);
  assertEqual(s.lockedAt.thorne, undefined);
});

test('talk: topic requiring a card hidden until owned', () => {
  const ids = (s) => availableTopics(s, 'finch').map((t) => t.id);
  assert(!ids(createState(0)).includes('drops'));
  assert(ids(withCards(['poison'])).includes('drops'));
  assertEqual(askTopic(createState(0), 'finch', 'drops').text, null);
});

test('talk: lucy refused after midgame', () => {
  const s = applyEvent(createState(0), 'midgame');
  assert(!canTalk(s, 'lucy'));
  assertEqual(askTopic(s, 'lucy', 'saw').gained, []);
});
