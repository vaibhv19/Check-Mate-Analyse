import type { GameHeader, MoveEntry } from '../types/state';
import { getScoreValue } from './moveDeltaCalculator';

/**
 * Generates a sanitized dynamic filename based on game headers.
 * e.g., Fischer_vs_Spassky_1992.pgn
 */
export function getExportFilename(headers: GameHeader | null): string {
  if (!headers) return 'chess_analysis.pgn';
  
  // Sanitize player names, replacing spaces and non-alphanumeric chars with underscores
  const white = (headers.White || 'White').trim().split(',')[0].replace(/[^a-zA-Z0-9]/g, '_');
  const black = (headers.Black || 'Black').trim().split(',')[0].replace(/[^a-zA-Z0-9]/g, '_');
  
  let year = 'game';
  if (headers.Date) {
    const parts = headers.Date.split('.');
    if (parts[0] && parts[0].length === 4) {
      year = parts[0];
    } else {
      year = headers.Date.replace(/[^a-zA-Z0-9]/g, '_');
    }
  }

  return `${white}_vs_${black}_${year}.pgn`;
}

/**
 * Compiles game headers and move logs (with evaluations) into a standard annotated PGN text.
 */
export function generateAnnotatedPgn(headers: GameHeader | null, moves: MoveEntry[]): string {
  let pgn = '';

  // 1. Output Headers
  if (headers) {
    Object.entries(headers).forEach(([key, val]) => {
      if (val) {
        pgn += `[${key} "${val}"]\n`;
      }
    });
    pgn += '\n';
  } else {
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '.');
    pgn += `[Event "CheckMate Analyze Export"]\n[Site "Local"]\n[Date "${today}"]\n\n`;
  }

  // 2. Output Moves
  const moveStrings: string[] = [];
  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];
    const isWhite = i % 2 === 0;
    const moveNum = Math.floor(i / 2) + 1;

    let moveText = '';
    if (isWhite) {
      moveText += `${moveNum}. ${move.san}`;
    } else {
      moveText += `${move.san}`;
    }

    // Append evaluation comment if available
    if (move.evaluation) {
      const rawVal = getScoreValue(
        move.evaluation.score,
        move.evaluation.isMate,
        move.evaluation.mateIn
      );
      
      // Normalize to White's perspective:
      // - Ply (i + 1) is odd for White moves (1st, 3rd...) -> resulting FEN has Black to move.
      // - Emscripten reports rawVal relative to Black, so White perspective = -rawVal.
      // - Ply (i + 1) is even for Black moves (2nd, 4th...) -> resulting FEN has White to move.
      // - Emscripten reports rawVal relative to White, so White perspective = rawVal.
      const isPlyOdd = (i + 1) % 2 === 1;
      const whiteScore = isPlyOdd ? -rawVal : rawVal;

      let evalComment = '';
      if (move.evaluation.isMate) {
        const mateSign = whiteScore > 0 ? '+' : '-';
        const mateVal = move.evaluation.mateIn || Math.abs(move.evaluation.score);
        evalComment = `#${mateSign}${mateVal}`;
      } else {
        const pawnScore = whiteScore / 100;
        evalComment = `${pawnScore > 0 ? '+' : ''}${pawnScore.toFixed(2)}`;
      }

      moveText += ` { [%eval ${evalComment}] }`;
    }

    moveStrings.push(moveText);
  }

  // Group moves into standard 80-character line wrapped layout
  let currentLine = '';
  moveStrings.forEach((mStr, idx) => {
    const prefix = (idx % 2 === 0) ? (currentLine ? ' ' : '') : ' ';
    const candidate = currentLine + prefix + mStr;

    if (candidate.length > 80) {
      pgn += currentLine + '\n';
      currentLine = mStr;
    } else {
      currentLine = candidate;
    }
  });

  if (currentLine) {
    pgn += currentLine + '\n';
  }

  return pgn.trim();
}
