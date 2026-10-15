// Save/load in localStorage. Any failure means "no save", never a crash.

import { createState, getCard } from './state.js';

export const SAVE_KEY = 'blackwood.save.v1';

export function save(state) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (_) { /* storage unavailable: play without saving */ }
}

export function load() {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (!s || s.version !== 1 || !Array.isArray(s.cards) || !Array.isArray(s.events)
      || !Array.isArray(s.talked) || !Array.isArray(s.seenTopics) || typeof s.reputation !== 'number') return null;
    // Content may change after launch: fill new fields, drop unknown cards.
    const fresh = createState(s.startedAt || Date.now());
    return {
      ...fresh,
      ...s,
      patience: { ...fresh.patience, ...(s.patience || {}) },
      lockedAt: s.lockedAt || {},
      cards: s.cards.filter((id) => getCard(id)),
    };
  } catch (_) {
    return null;
  }
}

export function clear() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (_) { /* ignore */ }
}
