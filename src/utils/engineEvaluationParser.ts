import type { MoveEvaluation, EngineLine } from '../types/state';

/**
 * Parses a standard UCI 'info' line and updates the active EngineLine set.
 * Returns the parsed depth, NPS, and updated Multi-PV engine lines.
 */
export function parseUciInfoLine(
  line: string,
  currentLines: EngineLine[] = []
): {
  depth: number;
  nps?: number;
  updatedLines: EngineLine[];
} | null {
  if (!line.startsWith('info ') || !line.includes('score')) return null;

  const parts = line.split(/\s+/);
  const depthIdx = parts.indexOf('depth');
  const scoreIdx = parts.indexOf('score');
  const npsIdx = parts.indexOf('nps');
  const pvIdx = parts.indexOf('pv');
  const multipvIdx = parts.indexOf('multipv');

  if (scoreIdx === -1) return null;

  const depth = depthIdx !== -1 ? parseInt(parts[depthIdx + 1], 10) : 0;
  const nps = npsIdx !== -1 ? parseInt(parts[npsIdx + 1], 10) : undefined;
  const multipv = multipvIdx !== -1 ? parseInt(parts[multipvIdx + 1], 10) : 1;

  // Score parsing
  const scoreType = parts[scoreIdx + 1]; // 'cp' or 'mate'
  const scoreValStr = parts[scoreIdx + 2];
  let score = 0;
  let isMate = false;
  let mateIn: number | undefined;

  if (scoreType === 'cp' && scoreValStr) {
    score = parseInt(scoreValStr, 10);
  } else if (scoreType === 'mate' && scoreValStr) {
    const mateVal = parseInt(scoreValStr, 10);
    score = mateVal;
    isMate = true;
    mateIn = Math.abs(mateVal);
  }

  // Principal variation (pv) parsing
  let pvMoves: string[] = [];
  if (pvIdx !== -1) {
    pvMoves = parts.slice(pvIdx + 1).filter((m) => m.trim() !== '');
  }

  const newLine: EngineLine = {
    depth,
    score,
    isMate,
    mateIn,
    pv: pvMoves,
  };

  const updatedLines = [...currentLines];
  const arrayIdx = multipv - 1;
  updatedLines[arrayIdx] = newLine;

  return {
    depth,
    nps,
    updatedLines: updatedLines.filter(Boolean),
  };
}

/**
 * Builds a final MoveEvaluation object once Stockfish reports the best move.
 */
export function finalizeMoveEvaluation(
  lines: EngineLine[],
  bestMove: string,
  depth: number
): MoveEvaluation | null {
  if (lines.length === 0) return null;

  const primaryLine = lines[0];

  return {
    score: primaryLine.score,
    isMate: primaryLine.isMate,
    mateIn: primaryLine.mateIn,
    bestMove,
    lines,
    depth,
  };
}
