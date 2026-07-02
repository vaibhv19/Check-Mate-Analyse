import { useWorkbenchState } from '@/context/WorkbenchContext';
import { getScoreValue } from '@/utils/moveDeltaCalculator';

export default function EvaluationBar() {
  const state = useWorkbenchState();

  const activeIndex = state.isSandbox ? state.sandboxActiveIndex : state.activeMoveIndex;
  const activeMove = state.isSandbox
    ? state.sandboxMoves[activeIndex]
    : state.moves[activeIndex];

  const evaluation = activeMove?.evaluation;

  // 1. Calculate White-perspective evaluation score
  let scoreVal = 0.3; // default slight white advantage
  let displayStr = '+0.3';
  let isMate = false;
  let isWhiteWinning = true;

  if (state.moves.length > 0 && evaluation) {
    const rawVal = getScoreValue(
      evaluation.score,
      evaluation.isMate,
      evaluation.mateIn
    );

    // Normalize to White's perspective: odd plies flip rawVal, even plies keep it
    const isOdd = (activeIndex + 1) % 2 === 1;
    const whiteScore = isOdd ? -rawVal : rawVal;
    
    isMate = evaluation.isMate;
    isWhiteWinning = whiteScore >= 0;

    // Clamp score to +/- 10 pawns (1000 centipawns)
    const clampedScore = Math.max(-1000, Math.min(1000, whiteScore));
    scoreVal = clampedScore / 100;

    if (isMate) {
      const mateVal = evaluation.mateIn || Math.abs(evaluation.score);
      const mateSign = whiteScore > 0 ? '+' : '-';
      displayStr = `#${mateSign}${mateVal}`;
    } else {
      displayStr = `${scoreVal > 0 ? '+' : ''}${scoreVal.toFixed(1)}`;
    }
  } else if (state.moves.length > 0) {
    // If game is loaded but not evaluated yet, show neutral/loading state
    displayStr = '...';
    scoreVal = 0.0;
  }

  // 2. Convert pawn score to height percentage (0% to 100%) for White's area
  // White area height is 100% when White is winning completely (+10.0)
  // and 0% when Black is winning completely (-10.0)
  let whitePercent = 50; // default equal
  if (isMate) {
    whitePercent = isWhiteWinning ? 100 : 0;
  } else {
    // Map [-10.0, +10.0] pawns to [5%, 95%] to keep a tiny sliver visible for both colors at extreme scores
    const mapped = ((scoreVal + 10) / 20) * 90 + 5;
    whitePercent = Math.max(5, Math.min(95, mapped));
  }

  const blackPercent = 100 - whitePercent;

  // If no game is loaded, hide the evaluation bar
  if (state.moves.length === 0) {
    return null;
  }

  return (
    <div className="w-4 md:w-5 h-full rounded bg-zinc-800 border border-border flex flex-col justify-between overflow-hidden relative shrink-0 select-none shadow-inner font-mono text-[9px] font-bold text-center">
      {/* Black Area (Top) */}
      <div 
        style={{ height: `${blackPercent}%` }} 
        className="bg-[#18181b] transition-all duration-700 ease-out relative w-full flex items-start justify-center pt-2 text-zinc-300"
      >
        {!isWhiteWinning && (
          <span className="z-10 absolute rotate-90 md:rotate-0 tracking-tighter">
            {displayStr}
          </span>
        )}
      </div>

      {/* Divider */}
      <div className="h-[1px] bg-zinc-500/20 w-full shrink-0" />

      {/* White Area (Bottom) */}
      <div 
        style={{ height: `${whitePercent}%` }} 
        className="bg-[#fafafa] transition-all duration-700 ease-out relative w-full flex items-end justify-center pb-2 text-zinc-800"
      >
        {isWhiteWinning && (
          <span className="z-10 absolute rotate-90 md:rotate-0 tracking-tighter">
            {displayStr}
          </span>
        )}
      </div>
    </div>
  );
}
