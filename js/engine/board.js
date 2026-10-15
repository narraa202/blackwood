// Evidence board: linking two owned cards may produce a deduction.

import { CASE } from '../data/case.js';
import { hasCard, addCards, changeReputation } from './state.js';

export const WRONG_LINK_COST = 5;

export function findDeduction(a, b) {
  return CASE.deductions.find((d) => (d.a === a && d.b === b) || (d.a === b && d.b === a)) || null;
}

export function link(state, a, b) {
  if (a === b || !hasCard(state, a) || !hasCard(state, b)) return { state, outcome: 'invalid' };
  const deduction = findDeduction(a, b);
  if (!deduction) return { state: changeReputation(state, -WRONG_LINK_COST), outcome: 'none' };
  if (hasCard(state, deduction.id)) return { state, outcome: 'already', deduction };
  return { state: addCards(state, [deduction.id]).state, outcome: 'new', deduction };
}
