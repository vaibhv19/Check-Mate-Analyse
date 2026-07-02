import type { MoveEntry, ClassificationType } from '../types/state';
import { getScoreValue } from './moveDeltaCalculator';

/**
 * Classifies a played move based on its evaluation loss (delta) compared to the best move,
 * along with positional contexts (e.g., forced moves or opening book lines).
 *
 * Centipawn delta classifications:
 * - Best: delta is 0 (top choice)
 * - Excellent: delta <= 15 cp (very minor loss)
 * - Good: delta <= 40 cp (acceptable move)
 * - Inaccuracy: delta <= 100 cp (minor error)
 * - Mistake: delta <= 200 cp (noticeable error)
 * - Blunder: delta > 200 cp (game-changing error)
 */
export function classifyMove(
  delta: number,
  isForced: boolean,
  isBook: boolean
): ClassificationType {
  if (isBook) return 'book';
  if (isForced) return 'forced';
  
  if (delta === 0) return 'best';
  if (delta <= 15) return 'excellent';
  if (delta <= 40) return 'good';
  if (delta <= 100) return 'inaccuracy';
  if (delta <= 200) return 'mistake';
  return 'blunder';
}

/**
 * Computes the classification for a played move by comparing it with the parent position evaluation.
 */
export function classifyMoveEntry(
  currentMove: MoveEntry,
  parentMove: MoveEntry | null
): ClassificationType | undefined {
  if (!currentMove.evaluation) return undefined;

  // Use standard starting evaluation (30 cp for White advantage) if no parent evaluation exists
  const parentScore = parentMove?.evaluation?.score ?? 30;
  const parentIsMate = parentMove?.evaluation?.isMate ?? false;
  const parentMateIn = parentMove?.evaluation?.mateIn;

  const currentScore = currentMove.evaluation.score;
  const currentIsMate = currentMove.evaluation.isMate;
  const currentMateIn = currentMove.evaluation.mateIn;

  // Get raw values with mate equivalents
  const parentVal = getScoreValue(parentScore, parentIsMate, parentMateIn);
  const currentVal = getScoreValue(currentScore, currentIsMate, currentMateIn);

  // Normalize scores to White's perspective:
  // - Odd plies are Black to move (engine score is relative to Black -> flip sign for White)
  // - Even plies are White to move (engine score is relative to White -> keep sign)
  const isCurrentOdd = currentMove.ply % 2 === 1;
  const currentNorm = isCurrentOdd ? -currentVal : currentVal;

  const isParentOdd = (currentMove.ply - 1) % 2 === 1;
  const parentNorm = isParentOdd ? -parentVal : parentVal;

  // White moved on odd plies (1, 3, 5...), Black moved on even plies (2, 4, 6...)
  const playerColor: 'w' | 'b' = currentMove.ply % 2 === 1 ? 'w' : 'b';

  // Calculate centipawn loss (delta) from player's perspective
  const delta = playerColor === 'w'
    ? parentNorm - currentNorm
    : currentNorm - parentNorm;

  const finalDelta = Math.max(0, delta);

  // Checks for forced and opening book moves
  const isForced = false;
  const isBook = false; // Will be set dynamically by opening book matcher if applicable

  return classifyMove(finalDelta, isForced, isBook);
}
