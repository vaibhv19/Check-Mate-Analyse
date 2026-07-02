import { useWorkbenchState, useWorkbenchDispatch } from '@/context/WorkbenchContext';
import { getScoreValue } from '@/utils/moveDeltaCalculator';
import { AreaChart, Area, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface ChartPoint {
  ply: number;
  moveName: string;
  eval: number; // clamped score in pawns (-10 to +10)
  displayEval: string; // friendly score string e.g. "+1.25" or "#-4"
}

export default function EvaluationGraph() {
  const state = useWorkbenchState();
  const dispatch = useWorkbenchDispatch();

  const moves = state.isSandbox ? state.sandboxMoves : state.moves;
  const currentIndex = state.isSandbox ? state.sandboxActiveIndex : state.activeMoveIndex;

  if (moves.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground/50 font-mono">
        No evaluation data available
      </div>
    );
  }

  // 1. Generate chart points from moves list
  const data: ChartPoint[] = [];

  // Start position (ply 0, index -1)
  data.push({
    ply: 0,
    moveName: 'Start',
    eval: 0.3, // standard slight white advantage at start
    displayEval: '+0.30',
  });

  // Populate plies
  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];
    const ply = i + 1;
    const isOdd = ply % 2 === 1;

    let scoreVal = 0.3; // fallback to start value if not evaluated yet
    let displayStr = '—';

    if (move.evaluation) {
      const rawVal = getScoreValue(
        move.evaluation.score,
        move.evaluation.isMate,
        move.evaluation.mateIn
      );
      
      // Normalize to White's perspective:
      // If ply is odd (1, 3, 5...), White played. The resulting position has Black to move.
      // Emscripten/Stockfish reports score relative to Black (the side to move in FEN).
      // So to get White perspective, we multiply by -1.
      // If ply is even (2, 4, 6...), Black played. The resulting position has White to move.
      // Emscripten/Stockfish reports score relative to White. So it is already White perspective.
      const whiteScore = isOdd ? -rawVal : rawVal;

      // Clamp to +/- 10 pawns (1000 centipawns)
      const clampedScore = Math.max(-1000, Math.min(1000, whiteScore));
      scoreVal = clampedScore / 100;

      if (move.evaluation.isMate) {
        // Format mate display score
        const mateVal = move.evaluation.mateIn || Math.abs(move.evaluation.score);
        const mateSign = whiteScore > 0 ? '+' : '-';
        displayStr = `#${mateSign}${mateVal}`;
      } else {
        displayStr = `${scoreVal > 0 ? '+' : ''}${scoreVal.toFixed(2)}`;
      }
    } else {
      // If parent has evaluation, default to parent's evaluation as approximation
      const parentPoint = data[i];
      if (parentPoint) {
        scoreVal = parentPoint.eval;
        displayStr = parentPoint.displayEval;
      }
    }

    const moveLabel = `${Math.floor(i / 2) + 1}${isOdd ? '.' : '...'} ${move.san}`;

    data.push({
      ply,
      moveName: moveLabel,
      eval: scoreVal,
      displayEval: displayStr,
    });
  }

  // 2. Calculate gradient offset for dual-axis area filling
  const evalValues = data.map((d) => d.eval);
  const maxVal = Math.max(...evalValues);
  const minVal = Math.min(...evalValues);
  
  let offset = 0.5;
  if (maxVal !== minVal) {
    offset = maxVal / (maxVal - minVal);
  }
  // Clamp offset to [0, 1]
  offset = Math.max(0, Math.min(1, offset));

  // 3. Click handler for jumping board to clicked ply
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChartClick = (nextState: any) => {
    if (nextState && nextState.activeTooltipIndex !== undefined && nextState.activeTooltipIndex !== null) {
      const clickedPly = Number(nextState.activeTooltipIndex);
      const targetIndex = clickedPly - 1; // map ply to 0-based moveIndex (-1 is start)
      dispatch({ type: 'SELECT_MOVE', payload: targetIndex });
    }
  };

  return (
    <div className="w-full h-full min-h-0 min-w-0 select-none">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          onClick={handleChartClick}
          margin={{ top: 5, right: 5, left: -25, bottom: 5 }}
          className="cursor-pointer"
        >
          <defs>
            <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset={offset} stopColor="rgb(16, 185, 129)" stopOpacity={0.25} />
              <stop offset={offset} stopColor="rgb(244, 63, 94)" stopOpacity={0.25} />
            </linearGradient>
          </defs>
          <YAxis
            domain={[-10, 10]}
            ticks={[-8, -4, 0, 4, 8]}
            tick={{ fontSize: 9, fontFamily: 'monospace' }}
            stroke="var(--border)"
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="var(--border)" strokeDasharray="3 3" />
          
          {/* Highlight active move ply */}
          <ReferenceLine
            x={currentIndex + 1}
            stroke="var(--primary)"
            strokeWidth={1.5}
            strokeDasharray="2 2"
          />

          <Area
            type="monotone"
            dataKey="eval"
            stroke="url(#splitColor)"
            strokeWidth={1.5}
            fill="url(#splitColor)"
            activeDot={{ r: 4, strokeWidth: 0, fill: 'var(--primary)' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { payload: ChartPoint }[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const point = payload[0].payload;
    return (
      <div className="rounded-lg border border-border bg-card p-2 shadow-lg text-[10px] font-mono leading-none">
        <p className="font-bold text-foreground">{point.moveName}</p>
        <p className="text-primary font-semibold mt-1">Score: {point.displayEval}</p>
        <p className="text-muted-foreground/60 mt-0.5">Ply: {point.ply}</p>
      </div>
    );
  }
  return null;
}
