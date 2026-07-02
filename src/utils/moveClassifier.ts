import type { MoveEntry, ClassificationType } from '../types/state';
import { calculateMoveDelta } from './moveDeltaCalculator';

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

  // White moved on odd plies (1, 3, 5...), Black moved on even plies (2, 4, 6...)
  const playerColor: 'w' | 'b' = currentMove.ply % 2 === 1 ? 'w' : 'b';

  // Calculate centipawn loss (delta)
  const delta = calculateMoveDelta(
    currentScore,
    currentIsMate,
    currentMateIn,
    parentScore,
    parentIsMate,
    parentMateIn,
    playerColor
  );

  // Checks for forced and opening book moves
  const isForced = false;
  const isBook = false; // Will be set dynamically by opening book matcher if applicable

  return classifyMove(delta, isForced, isBook);
}
