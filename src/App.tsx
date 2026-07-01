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

  // Determine bounds based on Sandbox or Main Game state
  const isSandbox = state.isSandbox;
  const movesLength = isSandbox ? state.sandboxMoves.length : state.moves.length;
  const currentIndex = isSandbox ? state.sandboxActiveIndex : state.activeMoveIndex;

  const isFirstDisabled = currentIndex === -1;
  const isLastDisabled = currentIndex === movesLength - 1 || movesLength === 0;

  const handleFirst = () => {
    dispatch({ type: 'SELECT_MOVE', payload: -1 });
  };

  const handlePrev = () => {
    dispatch({ type: 'SELECT_MOVE', payload: Math.max(-1, currentIndex - 1) });
  };

  const handleNext = () => {
    dispatch({ type: 'SELECT_MOVE', payload: Math.min(movesLength - 1, currentIndex + 1) });
  };

  const handleLast = () => {
    dispatch({ type: 'SELECT_MOVE', payload: movesLength - 1 });
  };

  const handlePlayToggle = () => {
    // Placeholder for Auto-play toggles (TS-3.2.4)
  };

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
        isPlaying={false}
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
