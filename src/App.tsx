import WorkbenchLayout from './components/layout/WorkbenchLayout';
import { WorkbenchProvider } from './context/WorkbenchContext';
import ChessboardContainer from './features/board/ChessboardContainer';

function App() {
  return (
    <WorkbenchProvider>
      <WorkbenchLayout boardContent={<ChessboardContainer />} />
    </WorkbenchProvider>
  );
}

export default App;
