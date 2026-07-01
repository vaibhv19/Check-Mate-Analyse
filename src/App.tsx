import WorkbenchLayout from './components/layout/WorkbenchLayout';
import { WorkbenchProvider } from './context/WorkbenchContext';

function App() {
  return (
    <WorkbenchProvider>
      <WorkbenchLayout />
    </WorkbenchProvider>
  );
}

export default App;
