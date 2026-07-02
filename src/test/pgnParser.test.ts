import { describe, it, expect } from 'vitest';
import { parsePgn } from '../utils/pgnParser';

describe('PGN Parser Utility', () => {
  it('should parse headers correctly from PGN string', () => {
    const pgn = `[Event "F/S Return Match"]
[Site "Belgrade, Serbia JUG"]
[Date "1992.11.04"]
[Round "29"]
[White "Fischer, Robert J."]
[Black "Spassky, Boris V."]
[Result "1/2-1/2"]

1. e4 e5 2. Nf3 Nc6 1/2-1/2`;

    const parsed = parsePgn(pgn);

    expect(parsed.headers).toBeDefined();
    expect(parsed.headers.White).toBe('Fischer, Robert J.');
    expect(parsed.headers.Black).toBe('Spassky, Boris V.');
    expect(parsed.headers.Date).toBe('1992.11.04');
    expect(parsed.headers.Event).toBe('F/S Return Match');
  });

  it('should extract moves with correct turns, ply indices, SAN and UCI notations', () => {
    const pgn = `1. e4 e5 2. Nf3 Nc6 *`;
    const parsed = parsePgn(pgn);

    expect(parsed.moves).toHaveLength(4);
    
    // First move (White 1. e4)
    expect(parsed.moves[0]).toEqual({
      ply: 1,
      san: 'e4',
      uci: 'e2e4',
      fen: expect.any(String),
    });

    // Second move (Black 1... e5)
    expect(parsed.moves[1]).toEqual({
      ply: 2,
      san: 'e5',
      uci: 'e7e5',
      fen: expect.any(String),
    });

    // Fourth move (Black 2... Nc6)
    expect(parsed.moves[3]).toEqual({
      ply: 4,
      san: 'Nc6',
      uci: 'b8c6',
      fen: expect.any(String),
    });
  });

  it('should ignore annotations, comments, and NAGs correctly', () => {
    const pgn = `1. e4 { Great move! } e5 $1 2. Nf3 Nc6 *`;
    const parsed = parsePgn(pgn);

    expect(parsed.moves).toHaveLength(4);
    expect(parsed.moves[0].san).toBe('e4');
    expect(parsed.moves[1].san).toBe('e5');
  });

  it('should throw an error for malformed PGN text', () => {
    const pgn = `1. e5 e4 (illegal moves order / sequence)`;
    expect(() => parsePgn(pgn)).toThrow();
  });
});
