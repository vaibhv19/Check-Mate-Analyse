import { useWorkbenchState } from '@/context/WorkbenchContext';
import { getActiveFen } from '@/context/selectors';
import { Cpu, Loader2 } from 'lucide-react';

export default function EnginePanel() {
  const state = useWorkbenchState();
  const activeFen = getActiveFen(state);

  const activeIndex = state.isSandbox ? state.sandboxActiveIndex : state.activeMoveIndex;
  const activeMove = state.isSandbox
    ? state.sandboxMoves[activeIndex]
    : state.moves[activeIndex];

  const evaluation = activeMove?.evaluation;
  const isWhiteTurn = activeFen.split(' ')[1] === 'w';

  // Format the centipawn score to a standard chess notation e.g. +0.45 or -1.20
  const formatScore = (score: number, isMate: boolean, mateIn?: number) => {
    if (isMate) {
      const mateVal = mateIn || Math.abs(score);
      // If score is negative, it's black leading mate
      const isNegative = score < 0;
      const normalizedMate = isWhiteTurn ? (isNegative ? -mateVal : mateVal) : (isNegative ? mateVal : -mateVal);
      return `#${normalizedMate > 0 ? '+' : ''}${normalizedMate}`;
    }
    
    // Normalize score to White's perspective
    const scoreVal = isWhiteTurn ? score : -score;
    const pawnScore = scoreVal / 100;
    return `${pawnScore > 0 ? '+' : ''}${pawnScore.toFixed(2)}`;
  };

  // Render different states: engine paused, thinking, or displaying lines
  const renderContent = () => {
    if (state.moves.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-1.5 p-4 text-center">
          <Cpu className="h-6 w-6 opacity-30" />
          <p>No game loaded</p>
        </div>
      );
    }

    if (state.engineStatus === 'initializing') {
      return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2 p-4 text-center">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <p className="text-xs">Initializing local engine...</p>
        </div>
      );
    }

    if (!evaluation || evaluation.lines.length === 0) {
      if (state.engineStatus === 'idle') {
        return (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-1.5 p-4 text-center">
            <Cpu className="h-6 w-6 opacity-40 text-amber-500" />
            <p className="text-xs font-semibold">Engine analysis paused</p>
            <p className="text-[10px] text-muted-foreground/60">Click "Analyze" to resume CPU calculations</p>
          </div>
        );
      }
      return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2 p-4 text-center">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <p className="text-xs">Engine is thinking...</p>
        </div>
      );
    }

    // Sort Multi-PV lines by score (stronger lines for active side first)
    const sortedLines = [...evaluation.lines].sort((a, b) => b.score - a.score);

    return (
      <div className="flex-1 flex flex-col justify-start overflow-y-auto text-xs min-h-0 min-w-0 divide-y divide-border/20">
        {sortedLines.map((line, idx) => {
          const scoreText = formatScore(line.score, line.isMate, line.mateIn);
          const firstMove = line.pv[0] || '—';
          const pvRest = line.pv.slice(1).join(' ');

          return (
            <div key={idx} className="py-2.5 flex items-start gap-3 hover:bg-muted/10 transition-all min-w-0 px-0.5">
              {/* Score Badge */}
              <div className="shrink-0 flex items-center justify-center w-14 py-1.5 rounded font-mono font-bold text-center bg-muted/60 border border-border text-[11px]">
                <span className={line.isMate ? 'text-amber-500' : 'text-foreground'}>
                  {scoreText}
                </span>
              </div>
              
              {/* PV Moves info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-foreground font-sans text-[11px]">
                    line {idx + 1}:
                  </span>
                  <span className="font-mono font-bold text-primary text-[11px]">
                    {firstMove}
                  </span>
                </div>
                <p className="text-muted-foreground font-mono truncate text-[10px] mt-0.5 leading-relaxed tracking-wide">
                  {pvRest || 'Calculating variations...'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="h-full w-full flex flex-col min-h-0 min-w-0">
      {renderContent()}
    </div>
  );
}
