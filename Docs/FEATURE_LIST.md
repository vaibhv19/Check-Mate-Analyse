# Feature List Matrix: CheckMate Analyze (v1.0.1)

This document provides a granular, feature-by-feature specification matrix for all components of CheckMate Analyze, tracing user inputs, background queue interactions, sandbox variations, and export outcomes.

---

## Granular Feature Matrix

| Feature ID | Feature Name | Component / Area | User Ingestion & Inputs | Processing Logic & Rules | Local Engine Queue Impact | Sandbox Behavior | Export Format Impact | Primary Edge Cases |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **FT-101** | Paste PGN Ingest | Input | User pastes PGN string into textarea on LandingForm; clicks "Analyze Game". | Sanitizes input; parses headers and moves using `chess.js`; stores in state (`moves`, `headers`). | Dispatches `LOAD_GAME` action, resets engine status to `initializing`, and triggers first move analysis. | Disabled on Landing Screen. N/A. | N/A (Initial load). | Empty input: rejects action.<br>Syntax error: shows exact line details and halts. |
| **FT-102** | Drag & Drop File Upload | Input | User drops or uploads a `.pgn` file. | File contents read via standard browser `FileReader`; verifies chess legality; saves to state. | Resets queue state; stops any active worker process; initializes new engine instance. | N/A (Initial load). | N/A. | File > 2MB: parsed correctly but triggers performance alert.<br>Non-PGN file format: rejects and displays error modal. |
| **FT-103** | ECO Opening Lookup | Ingestion / Metadata | Automated on move changes. | Matches FEN of the current active position against the `ecoDatabase` mapping. | No queue impact. Runs synchronously in rendering cycle. | Evaluates openings inside the sandbox as well if positions match. | ECO and Opening tags are written to PGN header if detected. | Unknown opening: clears ECO display. |
| **FT-104** | Chronological Move List | UI / Navigation | User clicks on a move button in the grid. | State updates `activeMoveIndex`. Board updates view to corresponding FEN. | Engine queue immediately gets `stop` command, then `go depth 15` command for the clicked move FEN. | If in sandbox, clicking a move in the main move list exits sandbox mode and returns to main game. | Highlighted active move does not alter export. | Move list exceeds 200 items: rendering uses light elements to avoid lag. |
| **FT-105** | Keyboard Navigation | UI / Navigation | Pressing `Left`, `Right`, `Up`, or `Down` arrows. | Maps to standard indices (`activeMoveIndex` increment/decrement). | Engine immediately cancels current calculation and redirects to new FEN. | Traverses sandbox moves if sandbox is active, otherwise traverses main game moves. | N/A. | Arrow pressed when input textarea is focused: ignored. |
| **FT-106** | Engine Switch Toggle | Engine Management | User clicks the engine toggle switch on the status bar. | Updates React state `isEngineEnabled` (true/false). | If toggled OFF, terminates Stockfish Web Worker and dispatches `idle`. If toggled ON, spawns Web Worker. | Disabling engine inside sandbox halts sandbox analysis but preserves Sandbox state. | N/A. | Switching ON/OFF rapidly: debounced to prevent duplicate worker initialization. |
| **FT-107** | Multi-PV Output Panel | Engine Management | Auto-updates during active analysis. | Worker outputs up to 3 parsed lines (`uciInfoLineParser`). Rendered in `EnginePanel`. | Evaluates 3 alternate variations (`MultiPV 3`) concurrently in the Web Worker. | Displays evaluations and lines of deviation moves inside the sandbox. | Multi-PV lines are NOT exported (only the played move evaluation is saved). | Engine score is Mate: formats score as `M{N}` instead of centipawns. |
| **FT-108** | Move Classification | Analytics Engine | Automatic computation upon evaluation stream. | Evaluates played move centipawn loss against the top-recommended engine move. | Triggered upon receiving `info` and `bestmove` message events from the worker. | Classifications apply to sandbox moves and are stored in `sandboxMoves` array. | Classifications are written to exported PGN as custom annotations (`[%cld Blunder]`). | Parent position has only 1 legal move: automatically marked as "Forced". |
| **FT-109** | Live Evaluation Graph | UI / Analytics | Auto-updates on evaluation changes. | Renders centipawn scores on an area chart via `Recharts`. | Updates reactively. Chart updates are throttled to once every 200ms. | Displays main game plot; sandbox branches do not plot on the main graph (prevents graph corruption). | Graph data is not exported. | Mate evaluations: plotted as $+10.0$ or $-10.0$ max value to prevent graph scale distortion. |
| **FT-110** | Sandbox Move Branching | Sandbox | User drags a piece to make a non-game move. | Validates move using `chess.js`; creates sandbox branch by cloning history up to current active move. | Shuts down main game analysis queue; redirects engine worker to new deviation FEN. | Appends new moves to `sandboxMoves`; updates `sandboxActiveIndex`. | Sandbox moves are completely excluded from the exported PGN. | Deviation move is illegal: move rejected, no state change. |
| **FT-111** | Exit Sandbox | Sandbox | User clicks "Exit Sandbox" on the UI banner. | Clears `sandboxMoves` and sets `isSandbox` to false. | Terminates current sandbox engine calculation; redirects engine to FEN of original active move index. | Restores original board view and move list navigation. | N/A. | User exits sandbox: board returns to the exact pre-sandbox move. |
| **FT-112** | Annotated PGN Export | Export | User clicks "Export PGN" in controls. | Synthesizes headers, plies, and evaluations into a text stream. | No engine queue impact (runs on main thread synchronously). | If clicked while in sandbox, exports original game moves (sandbox variations are discarded). | Downloads file `White_vs_Black_YYYY.MM.DD.pgn` containing `[%eval]` and `[%cld]`. | Partially analyzed game: prompt warns user that un-analyzed moves will lack annotations. |

---

## Core Feature Flow Interactions

```
+------------------+       +-------------------+       +--------------------+
|  PGN INGESTION   | ----> | ENGINE DEPLOYMENT | ----> |   NAVIGATION LOOP  |
|  (FT-101/FT-102) |       |     (FT-106)      |       |  (FT-104/FT-105)   |
+------------------+       +-------------------+       +--------------------+
                                                                 |
                                                                 v
+------------------+       +-------------------+       +--------------------+
|    PGN EXPORT    | <---- |  SANDBOX BRANCH   | <---- | ANALYSIS FEEDBACK  |
|     (FT-112)     |       |  (FT-110/FT-111)  |       |  (FT-107/FT-108)   |
+------------------+       +-------------------+       +--------------------+
```

---

## Detailed Logic Rules for Engine Queue and Sandbox Actions

### A. Engine Queue Logic Rules
1. **Interrupt Dominance:** The navigation event dominates the engine. When the user selects Move $N$, any active calculations for Move $M$ are halted instantly via `postMessage('stop')` before a new `go` command is issued.
2. **Analysis Throttling:** Stockfish is allocated a max depth of 15. Once depth 15 is reported, the engine automatically goes to `idle` state, freeing CPU resources.
3. **MultiPV Ordering:** The engine streams 3 lines. The top-rated line (PV 1) represents the score attributed to the played move when calculating classifications.

### B. Sandbox Logic Rules
1. **Root Immutability:** The sandbox clone boundary starts at `moves[0]` to `moves[activeMoveIndex]`.
2. **Dynamic Appending:** Every move played by the user while `isSandbox === true` is pushed to `sandboxMoves`.
3. **No Persisted Branches:** Multiple branches are not supported. If the user makes a new deviation while already in the sandbox, it simply appends to the current `sandboxMoves` branch.

---

**End of Feature List Matrix**
