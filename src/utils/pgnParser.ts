import { Chess } from 'chess.js';
import type { GameHeader, MoveEntry } from '../types/state';

export interface ParsedGame {
  headers: GameHeader;
  moves: MoveEntry[];
}

/**
 * Parses raw PGN text into game headers and a log of moves with their FEN states.
 * Throws an Error if the PGN parsing fails.
 */
export function parsePgn(pgnText: string): ParsedGame {
  const chess = new Chess();
  
  // loadPgn parses the full PGN including tags, comments, and moves.
  // It returns true/false or throws an error depending on the version,
  // so we wrap it to ensure safety and clear error messages.
  try {
    chess.loadPgn(pgnText);
  } catch (error) {
    throw new Error(`Failed to parse PGN: ${error instanceof Error ? error.message : String(error)}`);
  }

  const rawHeaders = chess.header();
  const headers: GameHeader = {};
  for (const [key, value] of Object.entries(rawHeaders)) {
    if (value !== null) {
      headers[key] = value;
    }
  }

  const history = chess.history({ verbose: true });

  const moves: MoveEntry[] = history.map((move, index) => {
    return {
      ply: index + 1,
      san: move.san,
      uci: `${move.from}${move.to}${move.promotion || ''}`,
      fen: move.after,
    };
  });

  return {
    headers,
    moves,
  };
}
