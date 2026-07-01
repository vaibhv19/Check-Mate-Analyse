import type { WorkbenchState, GameHeader, MoveEntry, MoveEvaluation, ClassificationType } from '../types/state';

export type WorkbenchAction =
  | { type: 'LOAD_GAME'; payload: { headers: GameHeader; moves: MoveEntry[] } }
  | { type: 'SELECT_MOVE'; payload: number }
  | { type: 'UPDATE_EVAL'; payload: { index: number; evaluation: MoveEvaluation; classification?: ClassificationType; isSandbox: boolean } }
  | { type: 'UPDATE_ENGINE_STATUS'; payload: { status: 'idle' | 'initializing' | 'analyzing' | 'error'; depth?: number; nps?: number } }
  | { type: 'ENTER_SANDBOX'; payload: MoveEntry }
  | { type: 'PLAY_SANDBOX_MOVE'; payload: MoveEntry }
  | { type: 'EXIT_SANDBOX' }
  | { type: 'RESET' };

export const initialState: WorkbenchState = {
  headers: null,
  moves: [],
  activeMoveIndex: -1,
  engineDepth: 0,
  engineNps: 0,
  engineStatus: 'idle',
  isSandbox: false,
  sandboxMoves: [],
  sandboxActiveIndex: -1,
};

export function workbenchReducer(state: WorkbenchState, action: WorkbenchAction): WorkbenchState {
  switch (action.type) {
    case 'LOAD_GAME':
      return {
        ...initialState,
        headers: action.payload.headers,
        moves: action.payload.moves,
        activeMoveIndex: -1,
      };

    case 'SELECT_MOVE':
      if (state.isSandbox) {
        return {
          ...state,
          sandboxActiveIndex: action.payload,
        };
      }
      return {
        ...state,
        activeMoveIndex: action.payload,
      };

    case 'UPDATE_EVAL': {
      const { index, evaluation, classification, isSandbox } = action.payload;
      if (isSandbox) {
        const updatedSandboxMoves = state.sandboxMoves.map((m, i) =>
          i === index ? { ...m, evaluation, classification } : m
        );
        return {
          ...state,
          sandboxMoves: updatedSandboxMoves,
        };
      } else {
        const updatedMoves = state.moves.map((m, i) =>
          i === index ? { ...m, evaluation, classification } : m
        );
        return {
          ...state,
          moves: updatedMoves,
        };
      }
    }

    case 'UPDATE_ENGINE_STATUS':
      return {
        ...state,
        engineStatus: action.payload.status,
        engineDepth: action.payload.depth !== undefined ? action.payload.depth : state.engineDepth,
        engineNps: action.payload.nps !== undefined ? action.payload.nps : state.engineNps,
      };

    case 'ENTER_SANDBOX':
      return {
        ...state,
        isSandbox: true,
        sandboxMoves: [action.payload],
        sandboxActiveIndex: 0,
      };

    case 'PLAY_SANDBOX_MOVE':
      return {
        ...state,
        sandboxMoves: [...state.sandboxMoves, action.payload],
        sandboxActiveIndex: state.sandboxMoves.length,
      };

    case 'EXIT_SANDBOX':
      return {
        ...state,
        isSandbox: false,
        sandboxMoves: [],
        sandboxActiveIndex: -1,
      };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}
