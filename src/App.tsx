import { useState, useEffect } from 'react';
import WorkbenchLayout from './components/layout/WorkbenchLayout';
import { WorkbenchProvider, useWorkbenchState, useWorkbenchDispatch } from './context/WorkbenchContext';
import ChessboardContainer from './features/board/ChessboardContainer';
import BoardControls from './features/board/BoardControls';
import { getActiveFen } from './context/selectors';
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation';

function Workbench() {
  const state = useWorkbenchState();
  const dispatch = useWorkbenchDispatch();
  const activeFen = getActiveFen(state);

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
    <div className="flex flex-col items-center justify-center gap-4 text-center h-full w-full">
      <ChessboardContainer position={activeFen} />
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
  );

  return (
    <WorkbenchLayout
      boardContent={boardContent}
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
