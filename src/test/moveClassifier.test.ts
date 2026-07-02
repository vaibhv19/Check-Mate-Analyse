import { describe, it, expect } from 'vitest';
import { classifyMove, classifyMoveEntry } from '../utils/moveClassifier';
import type { MoveEntry } from '../types/state';

describe('Move Classification Utility', () => {
  describe('classifyMove', () => {
    it('should classify book and forced moves first', () => {
      expect(classifyMove(0, false, true)).toBe('book');
      expect(classifyMove(150, true, false)).toBe('forced');
      // book takes precedence over forced if both are true
      expect(classifyMove(0, true, true)).toBe('book');
    });

    it('should classify by delta thresholds correctly', () => {
      expect(classifyMove(0, false, false)).toBe('best');
      expect(classifyMove(10, false, false)).toBe('excellent');
      expect(classifyMove(15, false, false)).toBe('excellent');
      expect(classifyMove(25, false, false)).toBe('good');
      expect(classifyMove(40, false, false)).toBe('good');
      expect(classifyMove(70, false, false)).toBe('inaccuracy');
      expect(classifyMove(100, false, false)).toBe('inaccuracy');
      expect(classifyMove(150, false, false)).toBe('mistake');
      expect(classifyMove(200, false, false)).toBe('mistake');
      expect(classifyMove(250, false, false)).toBe('blunder');
    });
  });

  describe('classifyMoveEntry', () => {
    it('should return undefined if the current move has no evaluation', () => {
      const currentMove: MoveEntry = {
        ply: 1,
        san: 'e4',
        uci: 'e2e4',
        fen: '...',
      };
      expect(classifyMoveEntry(currentMove, null)).toBeUndefined();
    });

    it('should classify White moves (odd plies) correctly based on White-perspective scores', () => {
      // Ply 1: White moves. Parent is starting position (defaults to 30 cp)
      const currentMove: MoveEntry = {
        ply: 1,
        san: 'e4',
        uci: 'e2e4',
        fen: '...',
        evaluation: {
          score: -30, // White has +30 advantage -> raw score relative to Black is -30
          isMate: false,
          bestMove: 'e2e4',
          lines: [],
          depth: 10,
        },
      };

      // Loss = 30 - 30 = 0 -> best
      expect(classifyMoveEntry(currentMove, null)).toBe('best');

      // If White plays sub-optimally: score drops to -10 cp White perspective (Black is slightly better)
      const currentMoveBad: MoveEntry = {
        ply: 1,
        san: 'a3',
        uci: 'a2a3',
        fen: '...',
        evaluation: {
          score: 10, // White has -10 advantage -> raw score relative to Black is +10
          isMate: false,
          bestMove: 'e2e4',
          lines: [],
          depth: 10,
        },
      };
      // Loss = 30 - (-10) = 40 -> good (delta <= 40)
      expect(classifyMoveEntry(currentMoveBad, null)).toBe('good');
    });

    it('should classify Black moves (even plies) correctly based on White-perspective scores', () => {
      // Parent (White move, ply 1) evaluated at +50 cp
      const parentMove: MoveEntry = {
        ply: 1,
        san: 'e4',
        uci: 'e2e4',
        fen: '...',
        evaluation: {
          score: 50,
          isMate: false,
          bestMove: '',
          lines: [],
          depth: 10,
        },
      };

      // Current move (Black move, ply 2).
      // If Black plays a blunder, White advantage increases to +300 cp
      const currentMoveBlunder: MoveEntry = {
        ply: 2,
        san: 'h6',
        uci: 'h7h6',
        fen: '...',
        evaluation: {
          score: 300,
          isMate: false,
          bestMove: 'e7e5',
          lines: [],
          depth: 10,
        },
      };

      // Black Loss = current - parent = 300 - 50 = 250 -> blunder
      expect(classifyMoveEntry(currentMoveBlunder, parentMove)).toBe('blunder');
    });
  });
});
