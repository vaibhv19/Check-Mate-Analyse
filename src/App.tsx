import { useState, useEffect } from 'react';
import WorkbenchLayout from './components/layout/WorkbenchLayout';
import { WorkbenchProvider, useWorkbenchState, useWorkbenchDispatch } from './context/WorkbenchContext';
import ChessboardContainer from './features/board/ChessboardContainer';
import BoardControls from './features/board/BoardControls';
import { getActiveFen } from './context/selectors';
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation';
import { getOpeningByFen } from './utils/ecoDatabase';
import StatusBar from './components/layout/StatusBar';
import LandingForm from './features/pgn/LandingForm';
import { parsePgn } from './utils/pgnParser';
import { validatePgnSyntax, checkMoveLegality } from './utils/pgnValidator';

function Workbench() {
  const state = useWorkbenchState();
  const dispatch = useWorkbenchDispatch();
  const activeFen = getActiveFen(state);
  
  const activeOpening = getOpeningByFen(activeFen);

  const [isPlaying, setIsPlaying] = useState(false);
  const [pgnError, setPgnError] = useState<string | null>(null);
  const [syntaxErrors, setSyntaxErrors] = useState<string[]>([]);

  const handleLoadPgn = (pgnText: string) => {
    setPgnError(null);
    setSyntaxErrors([]);

    const syntaxValidation = validatePgnSyntax(pgnText);
    if (syntaxValidation.length > 0) {
      setSyntaxErrors(syntaxValidation.map(e => `Line ${e.line || '?'}: ${e.message}`));
      return;
    }

    const legalityCheck = checkMoveLegality(pgnText);
    if (legalityCheck) {
      setPgnError(legalityCheck.message);
      return;
    }

    try {
      const parsedGame = parsePgn(pgnText);
      dispatch({
        type: 'LOAD_GAME',
        payload: {
          headers: parsedGame.headers,
          moves: parsedGame.moves,
        },
      });
    } catch (err) {
      setPgnError(err instanceof Error ? err.message : 'Unknown parsing error');
    }
  };

  const handleLoadSample = () => {
    const samplePgn = `[Event "F/S Return Match"]
[Site "Belgrade, Serbia JUG"]
[Date "1992.11.04"]
[Round "29"]
[White "Fischer, Robert J."]
[Black "Spassky, Boris V."]
[Result "1/2-1/2"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Nb8 10. d4 Nbd7 1/2-1/2`;
    handleLoadPgn(samplePgn);
  };

  // Determine bounds based on Sandbox or Main Game state
  const isSandbox = state.isSandbox;
  const movesLength = isSandbox ? state.sandboxMoves.length : state.moves.length;
  const currentIndex = isSandbox ? state.sandboxActiveIndex : state.activeMoveIndex;

  const isFirstDisabled = currentIndex === -1;
  const isLastDisabled = currentIndex === movesLength - 1 || movesLength === 0;

  const handleFirst = () => {
    setIsPlaying(false);
    dispatch({ type: 'SELECT_MOVE', payload: -1 });
  };

  const handlePrev = () => {
    setIsPlaying(false);
    dispatch({ type: 'SELECT_MOVE', payload: Math.max(-1, currentIndex - 1) });
  };

  const handleNext = () => {
    dispatch({ type: 'SELECT_MOVE', payload: Math.min(movesLength - 1, currentIndex + 1) });
  };

  const handleLast = () => {
    setIsPlaying(false);
    dispatch({ type: 'SELECT_MOVE', payload: movesLength - 1 });
  };

  const handlePlayToggle = () => {
    if (isLastDisabled && !isPlaying) return;
    setIsPlaying(!isPlaying);
  };

  // Autoplay effect
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (currentIndex >= movesLength - 1) {
        setIsPlaying(false);
      } else {
        dispatch({ type: 'SELECT_MOVE', payload: currentIndex + 1 });
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isPlaying, currentIndex, movesLength, dispatch]);

  useKeyboardNavigation({
    onPrev: handlePrev,
    onNext: handleNext,
    enabled: true,
  });

  const boardContent = (
    <div className="flex flex-col items-center justify-center gap-4 text-center h-full w-full min-h-0">
      <div className="flex-1 min-h-0 w-full flex items-center justify-center">
        <ChessboardContainer position={activeFen} />
      </div>
      <div className="shrink-0 w-full flex justify-center">
        <BoardControls
          onFirst={handleFirst}
          onPrev={handlePrev}
          onNext={handleNext}
          onLast={handleLast}
          onPlayToggle={handlePlayToggle}
          isPlaying={isPlaying}
          isFirstDisabled={isFirstDisabled}
          isLastDisabled={isLastDisabled}
        />
      </div>
    </div>
  );

  const moveListContent = state.moves.length > 0 ? (
    <div className="w-full h-full flex flex-col font-mono text-xs overflow-hidden min-h-0 min-w-0">
      <div className="grid grid-cols-12 gap-1 py-1 border-b border-border/20 text-muted-foreground font-semibold shrink-0">
        <div className="col-span-2">#</div>
        <div className="col-span-5 text-left">White</div>
        <div className="col-span-5 text-left">Black</div>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0 min-w-0 py-1 divide-y divide-border/10">
        {Array.from({ length: Math.ceil(state.moves.length / 2) }).map((_, turnIdx) => {
          const whiteMove = state.moves[turnIdx * 2];
          const blackMove = state.moves[turnIdx * 2 + 1];
          
          return (
            <div key={turnIdx} className="grid grid-cols-12 gap-1 py-1 items-center hover:bg-muted/10 transition-all px-0.5">
              <div className="col-span-2 text-muted-foreground font-medium">{turnIdx + 1}.</div>
              
              {/* White Move */}
              <button
                onClick={() => dispatch({ type: 'SELECT_MOVE', payload: turnIdx * 2 })}
                className={`col-span-5 text-left px-2 py-0.5 rounded transition-all truncate font-medium cursor-pointer ${
                  currentIndex === turnIdx * 2
                    ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                    : 'text-foreground hover:bg-muted/40'
                }`}
              >
                {whiteMove.san}
              </button>
              
              {/* Black Move */}
              {blackMove ? (
                <button
                  onClick={() => dispatch({ type: 'SELECT_MOVE', payload: turnIdx * 2 + 1 })}
                  className={`col-span-5 text-left px-2 py-0.5 rounded transition-all truncate font-medium cursor-pointer ${
                    currentIndex === turnIdx * 2 + 1
                      ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                      : 'text-foreground hover:bg-muted/40'
                  }`}
                >
                  {blackMove.san}
                </button>
              ) : (
                <div className="col-span-5" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  ) : undefined;

  const statusBarContent = (
    <StatusBar
      gameLoaded={state.moves.length > 0}
      statusText={
        isSandbox
          ? `Exploring Sandbox Variation (${state.sandboxMoves.length} moves)`
          : state.headers?.White && state.headers?.Black
          ? `${state.headers.White} vs ${state.headers.Black}`
          : state.moves.length > 0
          ? `Reviewing loaded game (${currentIndex + 1}/${state.moves.length} plies)`
          : 'Awaiting PGN Input'
      }
      openingName={activeOpening?.name}
      ecoCode={activeOpening?.eco}
      engineDepth={state.engineDepth}
      nps={state.engineNps}
    />
  );

  if (state.moves.length === 0) {
    return (
      <LandingForm
        onLoadPgn={handleLoadPgn}
        onLoadSample={handleLoadSample}
        error={pgnError}
        syntaxErrors={syntaxErrors}
      />
    );
  }

  return (
    <WorkbenchLayout
      boardContent={boardContent}
      moveListContent={moveListContent}
      statusBarContent={statusBarContent}
    />
  );
}

function App() {
  return (
    <WorkbenchProvider>
      <Workbench />
    </WorkbenchProvider>
  );
}

export default App;
