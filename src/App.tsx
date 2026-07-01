import { useState, useEffect } from 'react';
import WorkbenchLayout from './components/layout/WorkbenchLayout';
import { WorkbenchProvider, useWorkbenchState, useWorkbenchDispatch } from './context/WorkbenchContext';
import ChessboardContainer from './features/board/ChessboardContainer';
import BoardControls from './features/board/BoardControls';
import { getActiveFen } from './context/selectors';
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation';
import { getOpeningByFen } from './utils/ecoDatabase';
import StatusBar from './components/layout/StatusBar';

function Workbench() {
  const state = useWorkbenchState();
  const dispatch = useWorkbenchDispatch();
  const activeFen = getActiveFen(state);
  
  const activeOpening = getOpeningByFen(activeFen);

  const [isPlaying, setIsPlaying] = useState(false);

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

  const statusBarContent = (
    <StatusBar
      gameLoaded={state.moves.length > 0}
      statusText={
        isSandbox
          ? `Exploring Sandbox Variation (${state.sandboxMoves.length} moves)`
          : state.headers?.white && state.headers?.black
          ? `${state.headers.white} vs ${state.headers.black}`
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

  return (
    <WorkbenchLayout
      boardContent={boardContent}
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
