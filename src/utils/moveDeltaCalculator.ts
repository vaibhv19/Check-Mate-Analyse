import { normalizeScore } from './evaluationNormalizer';

const MATE_VALUE = 20000;

/**
 * Converts a score (centipawns or mate) into a raw numeric value for delta calculations.
 * Maps mate evaluations to a very large value (MATE_VALUE) penalized by the ply count to mate.
 */
export function getScoreValue(score: number, isMate: boolean, mateIn?: number): number {
  if (isMate) {
    const matePlies = mateIn || Math.abs(score);
    return score > 0 
      ? MATE_VALUE - matePlies * 100 
      : -MATE_VALUE + matePlies * 100;
  }
  return score;
}

/**
 * Calculates the evaluation loss (delta) for a played move compared to the engine's best move.
 * Returns a positive number representing the loss in centipawns.
 */
export function calculateMoveDelta(
  playedScore: number,
  playedIsMate: boolean,
  playedMateIn: number | undefined,
  bestScore: number,
  bestIsMate: boolean,
  bestMateIn: number | undefined,
  turn: 'w' | 'b'
): number {
  const playedVal = getScoreValue(playedScore, playedIsMate, playedMateIn);
  const bestVal = getScoreValue(bestScore, bestIsMate, bestMateIn);

  // Normalize scores to White's perspective
  const playedNorm = normalizeScore(playedVal, turn);
  const bestNorm = normalizeScore(bestVal, turn);

  // Delta (eval loss) is (best_eval - played_eval) from the perspective of the player to move
  const delta = turn === 'w' 
    ? bestNorm - playedNorm 
    : playedNorm - bestNorm;

  // Clamp to 0 in case played move is evaluated as marginally better than bestMove
  return Math.max(0, delta);
}
