import { Chess } from 'chess.js';

export interface ValidationError {
  line?: number;
  message: string;
}

export interface LegalityError {
  moveIndex?: number;
  moveSan?: string;
  message: string;
}

/**
 * Checks if the uploaded text conforms to standard PGN syntax rules.
 * Validates bracket matching for tags [] and comments {}, and ensures tags are properly formatted.
 * Returns an array of validation errors.
 */
export function validatePgnSyntax(pgnText: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const lines = pgnText.split(/\r?\n/);
  
  let inComment = false;
  let commentStartLine = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lineNum = i + 1;
    
    // Ignore empty lines or PGN escape lines
    if (line === '' || line.startsWith('%')) {
      continue;
    }
    
    // Tag checking
    if (line.startsWith('[')) {
      if (!line.endsWith(']')) {
        errors.push({
          line: lineNum,
          message: 'Tag header is missing a closing bracket "]"',
        });
      } else {
        const tagContent = line.slice(1, -1).trim();
        const firstQuote = tagContent.indexOf('"');
        const lastQuote = tagContent.lastIndexOf('"');
        
        if (firstQuote === -1 || lastQuote === -1 || firstQuote === lastQuote) {
          errors.push({
            line: lineNum,
            message: 'Tag value must be enclosed in double quotes, e.g. [Key "Value"]',
          });
        } else {
          const key = tagContent.slice(0, firstQuote).trim();
          if (!/^[A-Za-z0-9_]+$/.test(key)) {
            errors.push({
              line: lineNum,
              message: `Invalid tag header name "${key}". Alphanumeric characters and underscores only.`,
            });
          }
        }
      }
    } else if (line.endsWith(']')) {
      if (!line.startsWith('[')) {
        errors.push({
          line: lineNum,
          message: 'Tag header is missing an opening bracket "["',
        });
      }
    }
    
    // Comment braces checking
    for (let charIdx = 0; charIdx < line.length; charIdx++) {
      const char = line[charIdx];
      if (char === '{') {
        if (inComment) {
          errors.push({
            line: lineNum,
            message: 'Nested comments using "{" are not allowed in standard PGN',
          });
        } else {
          inComment = true;
          commentStartLine = lineNum;
        }
      } else if (char === '}') {
        if (!inComment) {
          errors.push({
            line: lineNum,
            message: 'Unmatched closing comment brace "}"',
          });
        } else {
          inComment = false;
        }
      }
    }
  }
  
  if (inComment) {
    errors.push({
      line: commentStartLine,
      message: 'Comment block is missing a closing brace "}"',
    });
  }
  
  return errors;
}

/**
 * Validates the legality of the move sequence in a PGN string.
 * Simulates moves one-by-one to identify the exact move index and SAN string that fails rules.
 * Returns a LegalityError if illegal, or null if legal.
 */
export function checkMoveLegality(pgnText: string): LegalityError | null {
  const chess = new Chess();
  
  // 1. Extract and load FEN header if it exists for custom starting positions
  const fenHeaderMatch = pgnText.match(/\[FEN\s+"(.*?)"\]/i);
  if (fenHeaderMatch && fenHeaderMatch[1]) {
    try {
      chess.load(fenHeaderMatch[1]);
    } catch {
      return { message: `Invalid starting position FEN: ${fenHeaderMatch[1]}` };
    }
  }
  
  // 2. Strip headers, comments, and variations
  let movesText = pgnText.replace(/\[.*?\]/gs, '');
  movesText = movesText.replace(/\{.*?\}/gs, '');
  movesText = movesText.replace(/\(.*?\)/gs, '');
  
  // Clean up move numbers (e.g. "1." or "1..." -> " ")
  movesText = movesText.replace(/\d+(\.+)/g, ' ');
  
  // Split tokens by whitespace
  const tokens = movesText.split(/\s+/).map(t => t.trim()).filter(t => t !== '');
  const resultMarkers = ['1-0', '0-1', '1/2-1/2', '*'];
  
  let moveCounter = 0;
  for (const token of tokens) {
    if (resultMarkers.includes(token)) {
      continue;
    }
    
    try {
      chess.move(token);
      moveCounter++;
    } catch {
      const activeColor = chess.turn() === 'w' ? 'White' : 'Black';
      const fullMoveNumber = Math.floor(moveCounter / 2) + 1;
      const turnNumberStr = chess.turn() === 'w' ? `${fullMoveNumber}.` : `${fullMoveNumber}...`;
      
      return {
        moveIndex: moveCounter,
        moveSan: token,
        message: `Move ${turnNumberStr} ${token} is illegal for ${activeColor} in this position.`,
      };
    }
  }
  
  return null;
}
