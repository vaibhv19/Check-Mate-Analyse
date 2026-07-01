import { Chessboard } from 'react-chessboard';
import type { ChessboardOptions } from 'react-chessboard';
import { STARTING_FEN } from '../../types/state';

interface ChessboardContainerProps {
  position?: string;
  orientation?: 'white' | 'black';
  onPieceDrop?: (sourceSquare: string, targetSquare: string, piece: string) => boolean;
  arePiecesDraggable?: boolean;
}

export default function ChessboardContainer({
  position = STARTING_FEN,
  orientation = 'white',
  onPieceDrop,
  arePiecesDraggable = true,
}: ChessboardContainerProps) {
  const boardOptions: ChessboardOptions = {
    position,
    boardOrientation: orientation,
    allowDragging: arePiecesDraggable,
    lightSquareStyle: { backgroundColor: 'var(--color-board-light)' },
    darkSquareStyle: { backgroundColor: 'var(--color-board-dark)' },
    animationDurationInMs: 200,
    onPieceDrop: onPieceDrop
      ? ({ piece, sourceSquare, targetSquare }: { piece: { pieceType: string }; sourceSquare: string; targetSquare: string | null }) => {
          if (!targetSquare) return false;
          return onPieceDrop(sourceSquare, targetSquare, piece.pieceType);
        }
      : undefined,
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-2 min-h-0">
      <div className="h-full w-auto max-h-full max-w-[min(100%,480px)] aspect-square flex items-center justify-center min-h-0 min-w-0">
        <Chessboard options={boardOptions} />
      </div>
    </div>
  );
}
