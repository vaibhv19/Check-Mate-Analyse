# Testing Strategy & Quality Assurance: CheckMate Analyze (v1.0.1)

This document establishes the testing strategy, test harness configurations, mocking protocols, and quality standards for CheckMate Analyze.

---

## 1. Testing Framework Stack

To maintain quick execution feedback and high reliability, our testing pipeline is divided into two primary testing methodologies:

```
                  +---------------------------------------------+
                  |               TESTING HARNESS               |
                  +----------------------+----------------------+
                                         |
                +------------------------+------------------------+
                |                                                 |
  +-------------v-------------+                     +-------------v-------------+
  |    UNIT TESTING (Vitest)  |                     |  COMPONENT TESTING (RTL)  |
  +-------------+-------------+                     +-------------+-------------+
  |  - Rules validation       |                     |  - UI Layout components   |
  |  - PGN parsing            |                     |  - Drag-and-drop board    |
  |  - Move classifications   |                     |  - Keyboard shortcuts     |
  |  - State reducer changes  |                     |  - Dialog confirmations   |
  +---------------------------+                     +---------------------------+
```

### Framework Details:
* **Vitest:** Chosen for high-speed unit tests, ESM compatibility, and native integration with Vite configuration files.
* **React Testing Library (RTL) & jsdom:** Evaluates component behavior by rendering interfaces inside a simulated browser DOM, focusing on user-centric interactions.

---

## 2. Unit Testing Suite (Vitest)

Unit tests focus on validating deterministic logic, such as parser compliance, mathematical formulas, and state reduction rules. Tests are located in `src/test/`.

### A. PGN Ingestion Tests (`pgnParser.test.ts`)
Verifies that chess game inputs are correctly parsed and validated:
* **Tag Header Extraction:** Confirms that metadata (White, Black, Date, Event) are correctly mapped to objects.
* **Move Extraction:** Verifies that moves are parsed into plies with correct SAN (`e4`) and UCI (`e2e4`) representations.
* **Filter Robustness:** Confirms that comments `{ Great move! }` and NAG symbols (`$1`) are ignored during parsing.
* **Error Halting:** Verifies that parsing illegal move sequences throws exceptions.

### B. Move Classification Tests (`moveClassifier.test.ts`)
Validates that played moves are correctly categorized:
* **Perspective Math:** Verifies that ply numbers (odd for White, even for Black) correctly flip engine scores to evaluate white-perspective.
* **Threshold Boundaries:** Tests each transition boundary:
  * $\Delta = 0 \rightarrow$ Best
  * $\Delta = 15 \rightarrow$ Excellent
  * $\Delta = 40 \rightarrow$ Good
  * $\Delta = 100 \rightarrow$ Inaccuracy
  * $\Delta = 200 \rightarrow$ Mistake
  * $\Delta > 200 \rightarrow$ Blunder
* **Special Cases:** Confirms that Book moves and Forced moves bypass centipawn calculations and receive their specific badges.

### C. Reducer State Transitions (`boardNavigation.test.ts` & `sandboxTransition.test.ts`)
Tests the reducer state machine directly:
* **Active index transitions:** Verifies index updates on `SELECT_MOVE`.
* **Sandbox Branching:** Verifies that playing a deviation move clones the game history, enters sandbox mode, and populates `sandboxMoves`.
* **History Slicing:** Confirms that navigating backward in the sandbox and playing a new move slices the history array at the active pointer, discarding old sandbox branches.
* **Sandbox Exit:** Confirms that exiting the sandbox clears the variation history and restores the main game state.

---

## 3. Mocking Strategy

Because the application runs in a web browser environment, external APIs and multi-threaded processes must be mocked to keep tests fast and deterministic.

### A. Web Worker Mocking (Stockfish WASM)
We mock the background Web Worker thread to prevent tests from spawning real WASM instances:
```typescript
import { vi } from 'vitest';

class MockWorker {
  public onmessage: (msg: any) => void = () => {};
  
  public postMessage(command: string) {
    // Intercept UCI commands and return mock responses
    if (command === 'uci') {
      this.onmessage({ data: 'uciok' });
    } else if (command === 'isready') {
      this.onmessage({ data: 'readyok' });
    } else if (command.startsWith('go')) {
      this.onmessage({ data: 'info depth 10 score cp 50 multipv 1 pv e2e4' });
      this.onmessage({ data: 'bestmove e2e4' });
    }
  }
  
  public terminate() {}
}

vi.stubGlobal('Worker', MockWorker);
```

### B. AutoPlay Timer Mocking
Autoplay navigation uses timers (`setTimeout`). Tests use Vitest's mock timers to control execution speed:
```typescript
import { vi } from 'vitest';

vi.useFakeTimers();
// Trigger autoplay...
vi.advanceTimersByTime(2000); // Advance clock to trigger next move
```

---

## 4. Component Testing (React Testing Library)

Component tests verify that state updates are correctly propagated to the UI.

* **Provider Isolation:** Components are wrapped in the context provider to ensure they can access the state:
  ```typescript
  import { render } from '@testing-library/react';
  import { WorkbenchProvider } from './context/WorkbenchContext';
  import Workbench from './App';

  render(
    <WorkbenchProvider>
      <Workbench />
    </WorkbenchProvider>
  );
  ```
* **Keyboard Navigation triggers:** Simulates user keypress events to verify that arrow keys navigate the board:
  ```typescript
  import { fireEvent } from '@testing-library/react';
  fireEvent.keyDown(window, { key: 'ArrowRight' });
  ```

---

## 5. Developer Quality Workflow (Red-Green Loop)

Developers must verify their changes against the test suite:
1. **Run Unit Tests:** `npm run test` (executes the Vitest suite in single-run mode).
2. **Watch Mode:** `npm run test:watch` (re-runs tests automatically when files are saved during development).
3. **Pre-Commit Checks:** Linting and formatting checks must pass before code is committed:
   ```bash
   npm run lint
   npm run format:check
   ```

---

**End of Testing Strategy & Quality Assurance**
