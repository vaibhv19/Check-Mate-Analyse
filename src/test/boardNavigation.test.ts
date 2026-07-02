import { describe, it, expect } from 'vitest';
import { workbenchReducer, initialState } from '../context/reducer';
import { getActiveFen } from '../context/selectors';
import { STARTING_FEN } from '../types/state';

describe('Board Navigation Integration Flow', () => {
  it('should initialize with default state and starting FEN', () => {
    expect(initialState.activeMoveIndex).toBe(-1);
    expect(initialState.isSandbox).toBe(false);
    expect(getActiveFen(initialState)).toBe(STARTING_FEN);
  });

  it('should load PGN moves and update state on LOAD_GAME', () => {
    const moves = [
      { ply: 1, san: 'e4', uci: 'e2e4', fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1' },
      { ply: 2, san: 'e5', uci: 'e7e5', fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2' },
    ];
    const headers = { Event: 'Test Game', White: 'Player A', Black: 'Player B' };

    const state = workbenchReducer(initialState, {
      type: 'LOAD_GAME',
      payload: { headers, moves },
    });

    expect(state.moves).toHaveLength(2);
    expect(state.headers).toEqual(headers);
    expect(state.activeMoveIndex).toBe(-1);
    // When no move is selected, should return the starting FEN or header FEN
    expect(getActiveFen(state)).toBe(STARTING_FEN);
  });

  it('should update active indices and FEN on SELECT_MOVE', () => {
    const moves = [
      { ply: 1, san: 'e4', uci: 'e2e4', fen: 'FEN_1' },
      { ply: 2, san: 'e5', uci: 'e7e5', fen: 'FEN_2' },
    ];
    const loadedState = workbenchReducer(initialState, {
      type: 'LOAD_GAME',
      payload: { headers: {}, moves },
    });

    // Select first move
    let state = workbenchReducer(loadedState, { type: 'SELECT_MOVE', payload: 0 });
    expect(state.activeMoveIndex).toBe(0);
    expect(getActiveFen(state)).toBe('FEN_1');

    // Select second move
    state = workbenchReducer(state, { type: 'SELECT_MOVE', payload: 1 });
    expect(state.activeMoveIndex).toBe(1);
    expect(getActiveFen(state)).toBe('FEN_2');
  });

  it('should handle navigation selection separately in Sandbox Mode', () => {
    const moves = [
      { ply: 1, san: 'e4', uci: 'e2e4', fen: 'FEN_1' },
      { ply: 2, san: 'e5', uci: 'e7e5', fen: 'FEN_2' },
    ];
    let state = workbenchReducer(initialState, {
      type: 'LOAD_GAME',
      payload: { headers: {}, moves },
    });

    // Select first move
    state = workbenchReducer(state, { type: 'SELECT_MOVE', payload: 0 }); // index 0 (FEN_1)

    // Enter sandbox with a variation move (e.g. 1... c5)
    const sandboxMove = { ply: 2, san: 'c5', uci: 'c7c5', fen: 'FEN_SANDBOX_1' };
    state = workbenchReducer(state, { type: 'ENTER_SANDBOX', payload: sandboxMove });

    expect(state.isSandbox).toBe(true);
    expect(state.sandboxActiveIndex).toBe(1); // 0 (e4) + 1 (c5)
    expect(getActiveFen(state)).toBe('FEN_SANDBOX_1');

    // Navigation inside sandbox
    state = workbenchReducer(state, { type: 'SELECT_MOVE', payload: 0 });
    expect(state.sandboxActiveIndex).toBe(0);
    expect(getActiveFen(state)).toBe('FEN_1');

    // Exit sandbox should restore primary game navigation
    state = workbenchReducer(state, { type: 'EXIT_SANDBOX' });
    expect(state.isSandbox).toBe(false);
    expect(state.activeMoveIndex).toBe(0);
    expect(getActiveFen(state)).toBe('FEN_1');
  });
});
