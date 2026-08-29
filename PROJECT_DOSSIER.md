# Check-Mate Analyse

## 1. Project Overview

Check-Mate Analyse is a client-side chess game analysis workbench built with React, TypeScript, and Tailwind CSS. It runs a local WebAssembly (WASM) build of the Stockfish 16 engine directly within a dedicated Web Worker thread in the user's browser. The application ingests Portable Game Notation (PGN) text or files, parses and validates game legalities using `chess.js`, streams real-time Multi-PV engine evaluations, calculates centipawn loss deltas to categorize moves, visualizes evaluation curves using Recharts, provides a non-destructive "What-If" sandbox branching mode, and exports standard annotated PGN files.

## 2. Why I Built It

Standard online chess analysis tools typically gate deep engine analysis behind subscription paywalls, require user accounts, or execute engine calculations on remote servers with network latency. I wanted to build an open, standalone utility that treats chess games like source code—the PGN is the code, the engine is the compiler/linter, and the goal is to pinpoint tactical errors—while keeping all computations entirely local, private, and zero-cost to host.

## 3. Problem / Question

How do you run heavy, CPU-bound alpha-beta minimax search algorithms (Stockfish WASM) in a single-threaded browser runtime without locking the UI thread, causing piece-dragging stutter, or accumulating stale calculation queues when users rapidly traverse move trees?

## 4. What It Actually Does

* **PGN Parsing & Validation**: Accepts raw PGN text or `.pgn` file uploads. Validates tag syntax, comment brace matching, and move legality ply-by-ply using `chess.js`. Halts on illegal moves with exact ply and error feedback.
* **In-Browser Multi-PV Engine Analysis**: Spawns a background Web Worker running `stockfish.js`/`stockfish.wasm` configured for 3 principal variations (`MultiPV 3`) up to a target depth of 15.
* **Score Normalization & Move Classification**: Normalizes UCI side-to-move scores to White's perspective, maps checkmate scores to a high-penalty mathematical scale ($20000 - \text{plies} \times 100$), and classifies each move against the parent position's best evaluation (Best, Excellent $\le 15\text{ cp}$, Good $\le 40\text{ cp}$, Inaccuracy $\le 100\text{ cp}$, Mistake $\le 200\text{ cp}$, Blunder $> 200\text{ cp}$, Book, Forced).
* **Synchronized UI & Visualization**: Features an interactive board (`react-chessboard`), board flipping, an evaluation bar pinned to the board height, a real-time Recharts area graph with interactive click-to-ply jumping, an opening database matcher (ECO codes), and autoplay controls with keyboard navigation.
* **Non-Destructive Sandbox Mode**: Allows users to make alternative moves from any point in the game. Clones the history up to the deviation ply into a separate `sandboxMoves` array, redirecting engine calculations without altering the original game record.
* **Annotated PGN Exporter**: Compiles game headers and plies with inline evaluation comments (e.g., `1. e4 { [%eval +0.30] }`) into a downloadable `.pgn` file with sanitized filenames.

## 5. Architecture

The system is structured as a unidirectional state pipeline with strict physical thread boundaries:

```
+-------------------------------------------------------------------------+
|                              MAIN UI THREAD                             |
|                                                                         |
|  [ LandingForm / File Upload ]                                          |
|                |                                                        |
|                v                                                        |
|  [ PGN Validator & Parser (chess.js) ]                                  |
|                |                                                        |
|                v                                                        |
|  [ WorkbenchContext (useReducer state store) ]                          |
|         |                     ^                      ^                  |
|         v                     |                      |                  |
|  [ React UI Components ]      |                      |                  |
|    ├── ChessboardContainer    | (State Updates)      | (Parsed Evals)   |
|    ├── BoardControls          |                      |                  |
|    ├── EvaluationBar          |                      |                  |
|    ├── EvaluationGraph        |                      |                  |
|    └── EnginePanel            |                      |                  |
|                               v                      |                  |
|                     [ StockfishClient Manager ]      |                  |
+-----------------------------------|------------------|------------------+
                                    | postMessage()    | onmessage()
                                    | (UCI commands)   | (UCI strings)
+-----------------------------------|------------------|------------------+
|                            WORKER THREAD                                |
|                                   v                  |                  |
|                       [ Web Worker (stockfish.js) ] -+                  |
|                                   |                                     |
|                                   v                                     |
|                       [ Stockfish 16 Engine (WASM) ]                    |
+-------------------------------------------------------------------------+
```

* **State Layer (`src/context/reducer.ts`, `selectors.ts`)**: Manages immutable game state, active move index, engine status, sandbox branch state, and board orientation.
* **Engine Management Layer (`src/utils/stockfishClient.ts`, `engineEvaluationParser.ts`)**: Bridges the React lifecycle to the Web Worker over `postMessage`, parsing raw UCI `info depth ... score cp ... pv ...` strings into structured TypeScript objects.
* **Analytics Layer (`src/utils/moveClassifier.ts`, `moveDeltaCalculator.ts`, `ecoDatabase.ts`)**: Computes evaluation losses, maps opening FENs, and assigns tactical classifications.
* **Presentation Layer (`src/features/*`, `src/components/*`)**: Pure and context-connected React 19 components for board rendering, controls, move logs, and charts.

## 6. Important Technical Decisions

* **Client-Side WASM over Cloud API Engine**: Selected local Stockfish compiled to WASM inside a Web Worker instead of a hosted server backend. Eliminates server hosting costs, eliminates network latency for move calculations, guarantees absolute user data privacy, and allows offline analysis.
* **Web Worker Thread Isolation**: Dedicated background worker for Stockfish prevents heavy tree search algorithms from blocking the JavaScript event loop, guaranteeing smooth piece dragging and responsive UI interactions at 60fps.
* **Interrupt Dominance on Navigation**: When a user rapidly clicks or presses arrow keys across moves, the client immediately transmits a UCI `stop` command before sending `position fen ...` and `go depth 15`. This halts obsolete calculations instantly and prevents worker command queue congestion.
* **Dual-Track History for Sandbox**: Rather than using a complex tree data structure for variations, the state model maintains an immutable `moves` array and a transient `sandboxMoves` array. Entering sandbox mode slices `moves` up to `activeMoveIndex`; exiting discards `sandboxMoves` and returns directly to the root game state.
* **Isolation Security Headers on Hosting**: Configured `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` in `vercel.json` to enable browser process isolation required for high-performance WebAssembly worker operations.

## 7. Interesting Engineering Problems

* **Mathematical Score Normalization Across Perspectives**: UCI engines report evaluation scores relative to the side whose turn it is to move in the given position. When White moves (ply 1), the resulting FEN has Black to move, meaning Stockfish reports the score from Black's perspective. To plot a consistent White-advantage curve on Recharts and calculate centipawn losses correctly for both colors, all scores are systematically translated to White's perspective based on ply parity ($V_{\text{white}} = -V_{\text{raw}}$ for odd plies, $+V_{\text{raw}}$ for even plies).
* **Checkmate Value Scaling**: Centipawn integer scales cannot represent mate positions without scale breakage. Implemented a fixed high-water constant (`MATE_VALUE = 20000`) decayed by ply count ($20000 - \text{plies} \times 100$), ensuring mate-in-1 evaluates strictly higher than mate-in-3, and all mates evaluate higher than positional pawn advantages.
* **Zero-Worker Re-render Sync**: Synchronized active move indices, sandbox flags, and move histories into React `useRef` instances inside `Workbench`. This allows asynchronous Web Worker message handlers to evaluate parent-move deltas without triggering unnecessary worker restarts or dependency re-instantiations.

## 8. Failure Modes / Things That Went Wrong

* **UI Stutter with Synchronous UCI Parsing**: High engine output frequency during multi-PV calculations flooded the message queue. Resolved by parsing UCI text streams inside the client dispatcher and batching evaluation dispatches.
* **Graph Scale Distortion from Mate Evaluations**: Unclamped mate scores caused the Recharts area chart Y-axis to expand to thousands of points, flattening normal centipawn variations into a horizontal line. Resolved by clamping chart display bounds to $[-10.0, +10.0]$ pawns while preserving mate notation strings in tooltips.
* **Broken Worker Instantiation on Move Traversal**: Earlier effect lifecycle dependencies recreated the `StockfishClient` worker instance on every move index change, leading to worker spin-up latency and memory pressure. Resolved by decoupling the worker lifecycle (created once on game load) from position updates (`analyzePosition` called on FEN change).

## 9. Verification / Testing

* **Unit & Integration Tests**: 19 automated tests implemented with Vitest and `@testing-library/react` across 4 test suites:
  * `src/test/pgnParser.test.ts`: Header extraction, move parsing, syntax validation, and malformed input rejection.
  * `src/test/moveClassifier.test.ts`: Centipawn delta thresholds, mate classification scaling, book moves, and forced move detection.
  * `src/test/boardNavigation.test.ts`: Reducer move selection, boundary clamping, and autoplay state.
  * `src/test/sandboxTransition.test.ts`: Sandbox branch creation, deviation move appending, and state restoration on exit.
* **Type Checking & Production Build**: Automated `tsc -b && vite build` validating bundle output and TypeScript types with zero errors.
* **Static Analysis**: ESLint 9 configured with TypeScript-ESLint and React Hooks rules.

## 10. Deployment

* **Platform**: Vercel (Production URL: `https://check-mate-analyse.vercel.app/`)
* **Headers**: `vercel.json` configured with `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp`.
* **Static Assets**: Self-contained static bundle served with local `/stockfish.js` and `/stockfish.wasm` assets in `public/`.

## 11. What I Learned

* **Web Worker Protocol Choreography**: Designing robust asynchronous message bridges between React state reducers and UCI engine processes using text-based command protocols (`uci`, `isready`, `ucinewgame`, `position`, `go`, `stop`).
* **State Tree Slicing vs Graph Complexity**: For single-variation analysis, maintaining two flat arrays (`moves` and `sandboxMoves`) provides clean immutability and simple reconciliation compared to nested multi-branch tree structures.
* **Browser-Native Isolation & Security Headers**: Managing COOP/COEP headers to unlock high-performance browser execution contexts for WebAssembly.

## 12. What Changed in My Thinking

* **Shifted from Server-Centric to Local-First Compute**: Initially, offloading chess engine calculations to a backend server seemed standard. Building this showed that WebAssembly Web Workers on client hardware can easily handle heavy analysis tasks with zero server bills and zero user data exposure.
* **Prioritizing Navigation Responsiveness over Exhaustive Computation**: Early designs attempted to queue and calculate every move in the game sequentially. Shifting to an on-demand, navigation-dominant model (stopping the engine immediately when the user changes moves) resulted in a much faster, more natural analysis workflow.

## 13. Distinctive / Interesting Details

* **Interactive Graph-to-Board Scrubbing**: Clicking on any point in the Recharts evaluation curve immediately dispatches a move selection that updates the board, move list, and engine analysis target.
* **Dynamic Annotated PGN Generator**: Assembles PGN text with custom standard comments (`[%eval ...] [%cld ...]`), line-wrapped to 80 characters per PGN standard specifications, with automatic file naming based on game player headers.
* **Built-in Grandmaster Sample Game**: Preloaded Kasparov vs. Topalov (1999) sample game for instant exploration without requiring the user to locate a `.pgn` file.

## 14. Skills Demonstrated

### Engineering Skills
* Web Worker Multithreading & Asynchronous UCI Protocols
* WebAssembly (WASM) Engine Integration
* State Reducer Architecture & Immutable Branching
* Domain Logic Implementation (Chess Rules, Centipawn Math, PGN Ingestion)
* Automated Unit & Integration Testing (Vitest, React Testing Library)
* Responsive Data Visualization (Recharts Area Charts)

### Technologies & Tools
* React 19, TypeScript, Vite
* Tailwind CSS v4, Radix UI, Lucide Icons
* Stockfish 16 WASM, `chess.js`, `react-chessboard`
* Recharts, Vitest, ESLint, Vercel

### Concepts
* Local-First Architecture
* Web Worker Background Processing & Thread Isolation
* Command Pattern & Interrupt Dominance
* Centipawn Loss Delta Calculation & Score Normalization
* Non-Destructive State Branching

### Best Skills for LinkedIn
* WebAssembly (WASM)
* Web Workers
* React 19
* TypeScript
* Frontend Architecture
* State Management (Redux/useReducer patterns)
* Vitest & Integration Testing

---

## 15. GitHub Repository Metadata

### Repository Short Description

Local-first chess analysis workbench running Stockfish WASM via Web Workers.

### Suggested GitHub Topics

* `chess`
* `chess-analysis`
* `stockfish`
* `webassembly`
* `web-workers`
* `react`
* `typescript`
* `local-first`

---

## 16. Public Content

### LinkedIn Project Description

I built Check-Mate Analyse, a local-first chess analysis workbench that runs the Stockfish 16 chess engine directly inside the browser using WebAssembly and Web Workers.

Running intensive alpha-beta minimax search algorithms on the client without freezing UI interactions or piece dragging required strict thread separation. I structured the system so the main React UI thread remains completely decoupled from engine calculations, communicating over an asynchronous UCI protocol bridge. To keep navigation snappy, I implemented navigation interrupt dominance: whenever a user navigates between moves, the engine immediately aborts stale search trees before pivoting to the new board position.

The workbench includes custom PGN syntax and legality parsing, centipawn loss delta calculations for move classifications (from Best to Blunder), real-time evaluation curve charting with Recharts, a non-destructive "What-If" sandbox for exploring alternative move branches, and standard annotated PGN exports.

Building this reinforced the power of local-first web architecture—delivering deep compute and complete user privacy without hosting overhead or server dependencies.

### LinkedIn Featured Description

Local-first chess analysis workbench running Stockfish 16 WASM in a dedicated Web Worker thread. Features real-time multi-PV evaluations, centipawn move classification, interactive evaluation curves, and non-destructive sandbox variations. Live demo: https://check-mate-analyse.vercel.app/

### Resume Bullets

* Architected a local-first chess analysis workbench in React 19 and TypeScript, running Stockfish 16 WASM in a dedicated Web Worker thread to isolate CPU-intensive engine calculations from the main UI thread.
* Implemented an interrupt-dominant UCI protocol bridge that halts stale engine searches during move navigation, preventing obsolete calculations from accumulating and keeping analysis responsive during rapid game traversal.
* Designed a non-destructive variation sandbox with custom PGN parsing and centipawn loss classification algorithms, backed by an automated 19-test Vitest integration suite.

---

## 17. Claims That Should NOT Be Made

* **DO NOT** claim specific user counts, active monthly users, or download statistics (no telemetry/analytics exist).
* **DO NOT** claim arbitrary percentage speedups (e.g., "10x faster than Chess.com") or server cost savings percentages.
* **DO NOT** claim custom Stockfish engine C++ modifications (the project integrates the standard Stockfish WASM distribution).
* **DO NOT** claim cloud sync or multi-device persistence (the app is strictly stateless and local-first).

---

## 18. Evidence / Source References

* **Web Worker & UCI Protocol**: `src/utils/stockfishClient.ts` (`new Worker('/stockfish.js')`, `postMessage`, MultiPV configuration).
* **Interrupt Dominance**: `src/utils/stockfishClient.ts` (`this.sendCommand('stop')` called on `analyzePosition`).
* **Score Normalization & Mate Scaling**: `src/utils/moveDeltaCalculator.ts` (`MATE_VALUE = 20000`), `src/utils/evaluationNormalizer.ts` (`normalizeScore`).
* **Move Classification Thresholds**: `src/utils/moveClassifier.ts` (`classifyMove`, centipawn boundary conditions).
* **Sandbox State Management**: `src/context/reducer.ts` (`ENTER_SANDBOX`, `PLAY_SANDBOX_MOVE`, `EXIT_SANDBOX`).
* **PGN Parsing & Legality**: `src/utils/pgnParser.ts`, `src/utils/pgnValidator.ts` (`validatePgnSyntax`, `checkMoveLegality`).
* **Deployment Security Headers**: `vercel.json` (COOP `same-origin`, COEP `require-corp`).
* **Automated Tests**: `src/test/*.test.ts` (19 test cases passing across 4 test suites).

