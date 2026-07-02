import { Chessboard } from 'react-chessboard';
import type { ChessboardOptions } from 'react-chessboard';
import { STARTING_FEN } from '../../types/state';
import EvaluationBar from '../engine/EvaluationBar';
import { useWorkbenchState } from '../../context/WorkbenchContext';

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
  const state = useWorkbenchState();
  const hasMoves = state.moves.length > 0;

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
    <div className={`w-full flex items-center justify-center p-1 md:p-2 ${hasMoves ? 'pl-7 md:pl-9' : ''}`}>
      <div className="relative w-full max-w-[min(100%,520px)] aspect-square">
        {hasMoves && (
          <div className="absolute top-0 bottom-0 -left-6 md:-left-7 w-4 md:w-5">
            <EvaluationBar />
          </div>
        )}
        <Chessboard options={boardOptions} />
      </div>
    </div>
  );
}
