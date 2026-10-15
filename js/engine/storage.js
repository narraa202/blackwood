// Save/load in localStorage. Any failure means "no save", never a crash.

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
    return s;
  } catch (_) {
    return null;
  }
}

export function clear() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (_) { /* ignore */ }
}
