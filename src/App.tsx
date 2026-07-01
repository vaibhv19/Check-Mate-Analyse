import WorkbenchLayout from './components/layout/WorkbenchLayout';
import { WorkbenchProvider, useWorkbenchState } from './context/WorkbenchContext';
import ChessboardContainer from './features/board/ChessboardContainer';
import { getActiveFen } from './context/selectors';

function Workbench() {
  const state = useWorkbenchState();
  const activeFen = getActiveFen(state);

  return (
    <WorkbenchLayout
      boardContent={<ChessboardContainer position={activeFen} />}
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
