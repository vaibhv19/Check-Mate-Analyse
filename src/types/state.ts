export interface GameHeader {
  event?: string;
  site?: string;
  date?: string;
  round?: string;
  white?: string;
  black?: string;
  result?: string;
  eco?: string;
  opening?: string;
  [key: string]: string | undefined;
}

export interface EngineLine {
  depth: number;
  score: number; // in centipawns
  isMate: boolean;
  mateIn?: number; // if isMate is true
  pv: string[]; // principal variation (move array in SAN/UCI)
}

export interface MoveEvaluation {
  score: number; // main score (from played move perspective)
  isMate: boolean;
  mateIn?: number;
  bestMove: string; // UCI format e.g. "e2e4"
  lines: EngineLine[]; // Multi-PV lines
  depth: number;
}

export type ClassificationType =
  | 'best'
  | 'excellent'
  | 'good'
  | 'inaccuracy'
  | 'mistake'
  | 'blunder'
  | 'book'
  | 'forced';

export interface MoveEntry {
  ply: number;
  san: string; // e.g. "e4"
  uci: string; // e.g. "e2e4"
  fen: string; // FEN string after this move is made
  evaluation?: MoveEvaluation;
  classification?: ClassificationType;
}

export interface WorkbenchState {
  headers: GameHeader | null;
  moves: MoveEntry[]; // original game moves
  activeMoveIndex: number; // -1 represents starting position, 0 represents first move (ply 1), etc.
  
  // Engine status
  engineDepth: number;
  engineNps: number;
  engineStatus: 'idle' | 'initializing' | 'analyzing' | 'error';
  
  // Sandbox exploration state
  isSandbox: boolean;
  sandboxMoves: MoveEntry[]; // moves played in sandbox mode
  sandboxActiveIndex: number; // active index within sandboxMoves (-1 if back at the branch start)
}
