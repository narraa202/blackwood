// Interrogations: topics, presenting cards, patience and lock-outs.

import { CASE } from '../data/case.js';
import {
  clone, hasCard, addCards, changeReputation, deductionCount, availableCharacters, MAX_PATIENCE,
} from './state.js';

export const WRONG_PRESENT_COST = 10;

const charById = new Map(CASE.characters.map((c) => [c.id, c]));
export const getCharacter = (id) => charById.get(id) || null;

const isLocked = (state, charId) =>
  state.lockedAt[charId] !== undefined && deductionCount(state) <= state.lockedAt[charId];

export function canTalk(state, charId) {
  return availableCharacters(state).includes(charId) && !isLocked(state, charId);
}

// Clears lock-outs that a new deduction has lifted, restoring patience.
export function cleanupLock(state) {
  const stale = Object.keys(state.lockedAt).filter((id) => !isLocked(state, id));
  if (!stale.length) return state;
  const next = clone(state);
  for (const id of stale) {
    delete next.lockedAt[id];
    next.patience[id] = MAX_PATIENCE;
  }
  return next;
}

export function meet(state, charId) {
  if (!charById.has(charId) || state.talked.includes(charId)) return state;
  const next = clone(state);
  next.talked.push(charId);
  return next;
}

export function availableTopics(state, charId) {
  const ch = charById.get(charId);
  if (!ch) return [];
  return ch.topics.filter((t) => (t.requires || []).every((r) => hasCard(state, r)));
}

export function askTopic(state, charId, topicId) {
  const topic = availableTopics(state, charId).find((t) => t.id === topicId);
  if (!topic || !canTalk(state, charId)) return { state, text: null, gained: [] };
  let next = cleanupLock(state);
  const key = `${charId}:${topicId}`;
  if (!next.seenTopics.includes(key)) {
    next = clone(next);
    next.seenTopics.push(key);
  }
  const added = topic.gives ? addCards(next, [topic.gives]) : { state: next, gained: [] };
  return { state: added.state, text: topic.text, gained: added.gained };
}

export function present(state, charId, cardId) {
  const ch = charById.get(charId);
  if (!ch || !hasCard(state, cardId)) return { state, outcome: 'invalid', text: null, gained: [] };
  if (!canTalk(state, charId)) return { state, outcome: 'refused', text: null, gained: [] };
  let next = cleanupLock(state);
  const match = ch.presents.find((p) => p.card === cardId);
  if (match) {
    const key = `${charId}:present:${cardId}`;
    if (next.seenTopics.includes(key)) return { state: next, outcome: 'already', text: match.text, gained: [] };
    next = clone(next);
    next.seenTopics.push(key);
    const added = match.gives ? addCards(next, [match.gives]) : { state: next, gained: [] };
    return { state: added.state, outcome: 'reveal', text: match.text, gained: added.gained };
  }
  next = changeReputation(next, -WRONG_PRESENT_COST);
  next.patience[charId] = Math.max(0, next.patience[charId] - 1);
  if (next.patience[charId] === 0) next.lockedAt[charId] = deductionCount(next);
  return { state: next, outcome: 'wrong', text: ch.wrong, gained: [] };
}
