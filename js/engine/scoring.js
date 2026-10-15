// Accusation evaluation, score and rank.

import { CASE } from '../data/case.js';
import { clone, clueCount } from './state.js';

const answerOf = Object.fromEntries(CASE.questions.map((q) => [q.id, q.answer]));
const whoProof = CASE.questions.find((q) => q.id === 'who').proof;

export function evaluate(answers) {
  const correct = {
    who: answers.who === answerOf.who && whoProof.includes(answers.proof),
    how: answers.how === answerOf.how,
    why: answers.why === answerOf.why,
    framer: answers.framer === answerOf.framer,
    necklace: answers.necklace === answerOf.necklace,
  };
  return { correct, count: Object.values(correct).filter(Boolean).length };
}

export function rankFor(score, count, hintsUsed, reputation) {
  if (count === 5 && hintsUsed <= 1 && reputation >= 70) return 'Великий сыщик';
  if (score >= 80) return 'Старший инспектор';
  if (score >= 60) return 'Инспектор';
  if (score >= 40) return 'Сержант';
  return 'Констебль';
}

export function computeResult(state, answers, now) {
  const { correct, count } = evaluate(answers);
  const cluesFound = clueCount(state);
  const cluesTotal = CASE.clues.length;
  const raw = Math.round(20 * count * (0.5 + state.reputation / 200)) + Math.round((10 * cluesFound) / cluesTotal);
  const score = Math.min(100, raw);
  return {
    score,
    rank: rankFor(score, count, state.hintsUsed, state.reputation),
    correct,
    count,
    timeMs: now - state.startedAt,
    cluesFound,
    cluesTotal,
  };
}

export function finish(state, answers, now) {
  const next = clone(state);
  next.endedAt = now;
  next.finished = { answers: { ...answers }, ...computeResult(state, answers, now) };
  return next;
}
