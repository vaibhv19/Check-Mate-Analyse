import { describe, it, expect } from 'vitest';
import { workbenchReducer, initialState } from '../context/reducer';
import type { MoveEntry } from '../types/state';

describe('Sandbox Transition and History Slicing Flow', () => {
  const mainMoves: MoveEntry[] = [
    { ply: 1, san: 'e4', uci: 'e2e4', fen: 'FEN_1' },
    { ply: 2, san: 'e5', uci: 'e7e5', fen: 'FEN_2' },
    { ply: 3, san: 'Nf3', uci: 'g1f3', fen: 'FEN_3' },
    { ply: 4, san: 'Nc6', uci: 'b8c6', fen: 'FEN_4' },
  ];

  it('should enter sandbox mode correctly from the middle of the game', () => {
    // 1. Load game and navigate to index 1 (after 1... e5, ply 2)
    let state = workbenchReducer(initialState, {
      type: 'LOAD_GAME',
      payload: { headers: {}, moves: mainMoves },
    });
    state = workbenchReducer(state, { type: 'SELECT_MOVE', payload: 1 }); // activeMoveIndex = 1

    // 2. White plays a deviation (e.g. 2. f4 instead of Nf3)
    const deviationMove: MoveEntry = { ply: 3, san: 'f4', uci: 'f2f4', fen: 'FEN_DEV_F4' };
    state = workbenchReducer(state, { type: 'ENTER_SANDBOX', payload: deviationMove });

    expect(state.isSandbox).toBe(true);
    expect(state.sandboxActiveIndex).toBe(2);
    expect(state.sandboxMoves).toHaveLength(3);
    
    // Sandbox moves should be: 1. e4, 1... e5, 2. f4
    expect(state.sandboxMoves[0].san).toBe('e4');
    expect(state.sandboxMoves[1].san).toBe('e5');
    expect(state.sandboxMoves[2].san).toBe('f4');
    expect(state.sandboxMoves[2].ply).toBe(3);
  });

  it('should slice variation history when playing alternative moves at an earlier index in sandbox', () => {
    // 1. Load game, select ply 2 (index 1), enter sandbox with 2. f4
    let state = workbenchReducer(initialState, {
      type: 'LOAD_GAME',
      payload: { headers: {}, moves: mainMoves },
    });
    state = workbenchReducer(state, { type: 'SELECT_MOVE', payload: 1 });
    const deviationMove1: MoveEntry = { ply: 3, san: 'f4', uci: 'f2f4', fen: 'FEN_DEV_F4' };
    state = workbenchReducer(state, { type: 'ENTER_SANDBOX', payload: deviationMove1 });

    // 2. Play 2... exf4 in sandbox (ply 4)
    const deviationMove2: MoveEntry = { ply: 4, san: 'exf4', uci: 'e5f4', fen: 'FEN_DEV_EXF4' };
    state = workbenchReducer(state, { type: 'PLAY_SANDBOX_MOVE', payload: deviationMove2 });
    expect(state.sandboxMoves).toHaveLength(4);
    expect(state.sandboxActiveIndex).toBe(3);

    // 3. Navigate back to index 2 (2. f4) and play 2... d6 instead of exf4
    state = workbenchReducer(state, { type: 'SELECT_MOVE', payload: 2 }); // select 2. f4
    const deviationMove3: MoveEntry = { ply: 4, san: 'd6', uci: 'd7d6', fen: 'FEN_DEV_D6' };
    state = workbenchReducer(state, { type: 'PLAY_SANDBOX_MOVE', payload: deviationMove3 });

    // Assert history is sliced correctly: exf4 should be removed and d6 appended
    expect(state.sandboxMoves).toHaveLength(4);
    expect(state.sandboxActiveIndex).toBe(3);
    expect(state.sandboxMoves[3].san).toBe('d6');
    expect(state.sandboxMoves.find(m => m.san === 'exf4')).toBeUndefined();
  });

  it('should restore original state upon exiting sandbox mode', () => {
    // 1. Setup sandbox state
    let state = workbenchReducer(initialState, {
      type: 'LOAD_GAME',
      payload: { headers: {}, moves: mainMoves },
    });
    state = workbenchReducer(state, { type: 'SELECT_MOVE', payload: 1 }); // active index is 1
    const deviationMove: MoveEntry = { ply: 3, san: 'f4', uci: 'f2f4', fen: 'FEN_DEV_F4' };
    state = workbenchReducer(state, { type: 'ENTER_SANDBOX', payload: deviationMove });

    // 2. Exit sandbox
    state = workbenchReducer(state, { type: 'EXIT_SANDBOX' });

    expect(state.isSandbox).toBe(false);
    expect(state.sandboxMoves).toHaveLength(0);
    expect(state.sandboxActiveIndex).toBe(-1);
    
    // Primary index should remain at 1
    expect(state.activeMoveIndex).toBe(1);
    expect(state.moves).toHaveLength(4);
    expect(state.moves[2].san).toBe('Nf3'); // Nf3 is preserved, not f4
  });
});
