export interface OpeningInfo {
  eco: string;
  name: string;
}

/**
 * Normalizes a FEN string to only contain the piece placement and active player.
 * E.g., "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" -> "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w"
 */
export function getNormalizedFen(fen: string): string {
  const parts = fen.split(' ');
  if (parts.length < 2) return fen;
  return `${parts[0]} ${parts[1]}`;
}

export const ecoMap: Record<string, OpeningInfo> = {
  // 1. e4
  'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b': { eco: 'B00', name: "King's Pawn Game" },
  
  // 1. e4 e5
  'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w': { eco: 'C20', name: 'Open Game' },
  'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKBNR b': { eco: 'C40', name: "King's Knight Opening" },
  'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQK2R w': { eco: 'C44', name: "Open Game: King's Knight" },
  
  // Ruy Lopez: 1.e4 e5 2.Nf3 Nc6 3.Bb5
  'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b': { eco: 'C60', name: 'Ruy Lopez' },
  
  // Italian Game: 1.e4 e5 2.Nf3 Nc6 3.Bc4
  'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b': { eco: 'C50', name: 'Italian Game' },

  // Scotch Game: 1.e4 e5 2.Nf3 Nc6 3.d4
  'r1bqkbnr/pppp1ppp/2n5/4p3/3PP3/5N2/PPP2PPP/RNBQKBNR b': { eco: 'C44', name: 'Scotch Game' },

  // Sicilian Defense: 1.e4 c5
  'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w': { eco: 'B20', name: 'Sicilian Defense' },
  'rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKBNR b': { eco: 'B27', name: "Sicilian Defense: King's Knight" },

  // French Defense: 1.e4 e6
  'rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w': { eco: 'C00', name: 'French Defense' },
  'rnbqkbnr/pppp1ppp/4p3/8/3PP3/8/PPP2PPP/RNBQKBNR b': { eco: 'C01', name: 'French Defense: Normal Variation' },

  // Caro-Kann Defense: 1.e4 c6
  'rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w': { eco: 'B10', name: 'Caro-Kann Defense' },
  'rnbqkbnr/pp1ppppp/2p5/8/3PP3/8/PPP2PPP/RNBQKBNR b': { eco: 'B12', name: 'Caro-Kann Defense: Classical' },

  // Scandinavian Defense: 1.e4 d5
  'rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w': { eco: 'B01', name: 'Scandinavian Defense' },
  'rnbqkbnr/ppp1pppp/8/3P4/8/8/PPPP1PPP/RNBQKBNR b': { eco: 'B01', name: 'Scandinavian Defense: Main Line' },

  // Alekhine's Defense: 1.e4 Nf6
  'rnbqkbnr/pppppppp/5n2/8/4P3/8/PPPP1PPP/RNBQKBNR w': { eco: 'B02', name: "Alekhine's Defense" },

  // Pirc Defense: 1.e4 d6
  'rnbqkbnr/ppp1pppp/3p4/8/4P3/8/PPPP1PPP/RNBQKBNR w': { eco: 'B07', name: 'Pirc Defense' },

  // Queen's Pawn Game: 1.d4
  'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b': { eco: 'D00', name: "Queen's Pawn Game" },

  // Queen's Gambit: 1.d4 d5 2.c4
  'rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w': { eco: 'D00', name: "Queen's Pawn Game: Closed" },
  'rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b': { eco: 'D06', name: "Queen's Gambit" },
  
  // Queen's Gambit Declined: 1.d4 d5 2.c4 e6
  'rnbqkbnr/ppp2ppp/4p3/3p4/2PP4/8/PP2PPPP/RNBQKBNR w': { eco: 'D30', name: "Queen's Gambit Declined" },

  // Slav Defense: 1.d4 d5 2.c4 c6
  'rnbqkbnr/pp2pppp/2p5/3p4/2PP4/8/PP2PPPP/RNBQKBNR w': { eco: 'D10', name: 'Slav Defense' },

  // Nimzo-Indian Defense: 1.d4 Nf6 2.c4 e6 3.Nc3 Bb4
  'rnbqkbnr/pppppp1p/8/8/2PP4/8/PP2PPPP/RNBQKBNR b': { eco: 'A40', name: "Queen's Pawn Game: Indian Defense" },
  'rnbqkbnr/pppp1ppp/4p3/8/2PP4/8/PP2PPPP/RNBQKBNR w': { eco: 'E00', name: 'Indian Game: East Indian' },
  'rnbqkbnr/pppp1ppp/4p3/8/2PP4/2N5/PP2PPPP/R1BQKBNR b': { eco: 'E20', name: 'Nimzo-Indian Defense' },

  // King's Indian Defense: 1.d4 Nf6 2.c4 g6
  'rnbqkbnr/pppppp1p/6p1/8/2PP4/8/PP2PPPP/RNBQKBNR w': { eco: 'E60', name: "King's Indian Defense" },

  // English Opening: 1.c4
  'rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b': { eco: 'A10', name: 'English Opening' },

  // Reti Opening: 1.Nf3
  'rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R b': { eco: 'A04', name: 'Réti Opening' },
};

/**
 * Returns the opening name and ECO code for a given FEN string, if mapped.
 */
export function getOpeningByFen(fen: string): OpeningInfo | undefined {
  const normalized = getNormalizedFen(fen);
  return ecoMap[normalized];
}
