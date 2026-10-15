// Game state and pure transitions. No DOM, no storage.
// Every function returns a new state and never mutates its input.

import { CASE } from '../data/case.js';

export const MAX_PATIENCE = 3;
export const MAX_HINTS = 3;
export const HINT_COST = 15;

const clueById = new Map(CASE.clues.map((c) => [c.id, c]));
const deductionIds = new Set(CASE.deductions.map((d) => d.id));
const allCards = new Map(
  [...CASE.clues, ...CASE.testimonies, ...CASE.deductions].map((c) => [c.id, c]),
);

export function createState(now) {
  return {
    version: 1,
    startedAt: now,
    endedAt: null,
    cards: [],
    talked: [],
    seenTopics: [],
    patience: Object.fromEntries(CASE.characters.map((c) => [c.id, MAX_PATIENCE])),
    lockedAt: {},
    reputation: 100,
    hintsUsed: 0,
    events: [],
    finished: null,
  };
}

export const clone = (state) => structuredClone(state);
export const getCard = (id) => allCards.get(id) || null;
export const hasCard = (state, id) => state.cards.includes(id);
export const clueCount = (state) => state.cards.filter((id) => clueById.has(id)).length;
export const deductionCount = (state) => state.cards.filter((id) => deductionIds.has(id)).length;

export function addCards(state, ids) {
  const next = clone(state);
  const gained = [];
  for (const id of ids) {
    if (allCards.has(id) && !next.cards.includes(id)) {
      next.cards.push(id);
      gained.push(id);
    }
  }
  return { state: next, gained };
}

export function changeReputation(state, delta) {
  const next = clone(state);
  next.reputation = Math.max(0, Math.min(100, next.reputation + delta));
  return next;
}

function roomUnlocked(state, room) {
  const u = room.unlock;
  if (u.type === 'start') return true;
  if (u.type === 'clues') return clueCount(state) >= u.count;
  if (u.type === 'event') return state.events.includes(u.id);
  return false;
}

export function unlockedRooms(state) {
  return CASE.rooms.filter((r) => roomUnlocked(state, r)).map((r) => r.id);
}

export function findClue(state, clueId) {
  const clue = clueById.get(clueId);
  if (!clue) return { state, result: 'unknown' };
  if (hasCard(state, clueId)) return { state, result: 'already' };
  if (!unlockedRooms(state).includes(clue.room)) return { state, result: 'locked' };
  if (clue.requires && !hasCard(state, clue.requires)) return { state, result: 'locked' };
  return { state: addCards(state, [clueId]).state, result: 'new' };
}

export function pendingEvent(state) {
  if (state.events.includes('midgame')) return null;
  const n = state.cards.length;
  if ((state.talked.includes('lucy') && n >= 8) || n >= 12) return 'midgame';
  return null;
}

export function applyEvent(state, id) {
  if (!CASE.events[id] || state.events.includes(id)) return state;
  const next = clone(state);
  next.events.push(id);
  return next;
}

export function availableCharacters(state) {
  return CASE.characters
    .filter((c) => !c.goneAfter || !state.events.includes(c.goneAfter))
    .map((c) => c.id);
}
