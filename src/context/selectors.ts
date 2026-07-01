import type { WorkbenchState } from '../types/state';

/**
 * Resolves the active board FEN based on the current navigation index
 * and whether the user is in normal review or sandbox exploration mode.
 */
export function getActiveFen(state: WorkbenchState): string {
  if (state.isSandbox) {
    if (state.sandboxActiveIndex >= 0 && state.sandboxMoves[state.sandboxActiveIndex]) {
      return state.sandboxMoves[state.sandboxActiveIndex].fen;
    }
    // Sandbox branch root: FEN of the main game at the branch point
    if (state.activeMoveIndex >= 0 && state.moves[state.activeMoveIndex]) {
      return state.moves[state.activeMoveIndex].fen;
    }
    return state.headers?.FEN || 'start';
  }

  if (state.activeMoveIndex >= 0 && state.moves[state.activeMoveIndex]) {
    return state.moves[state.activeMoveIndex].fen;
  }

  return state.headers?.FEN || 'start';
}
