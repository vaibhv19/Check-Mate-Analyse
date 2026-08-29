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
