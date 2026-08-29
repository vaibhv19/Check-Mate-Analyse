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
