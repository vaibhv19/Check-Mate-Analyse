/**
 * Normalizes centipawn and mate evaluations to White's perspective.
 * In UCI protocol:
 * - Engine scores are reported relative to the side to move (active player).
 * - A positive score means the active player is winning.
 * Normalization:
 * - If it is White's turn ('w'), White perspective = engine score.
 * - If it is Black's turn ('b'), White perspective = -engine score.
 */
export function normalizeScore(
  score: number,
  turn: 'w' | 'b'
): number {
  // Turn-based signs are identical for both cp and mate scores in terms of White-perspective translation.
  return turn === 'w' ? score : -score;
}

/**
 * Formats a normalized White-perspective score to standard chess UI display string.
 * e.g., +1.45, -0.20, #+3, #-2, 0.00
 */
export function formatNormalizedScore(score: number, isMate: boolean): string {
  if (isMate) {
    return `#${score > 0 ? '+' : ''}${score}`;
  }
  if (score === 0) return '0.00';
  const pawnScore = score / 100;
  return `${pawnScore > 0 ? '+' : ''}${pawnScore.toFixed(2)}`;
}
