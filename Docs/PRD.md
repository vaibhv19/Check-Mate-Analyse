# Product Requirements Document: CheckMate Analyze (v1.0.1)

**Version:** 1.0.1  
**Status:** Approved / Release Baseline  
**Date:** July 2026  
**One-Sentence Vision:** "The fastest, local-first way to inspect and debug chess game mistakes."

---

## 1. Executive Summary

CheckMate Analyze is a professional-grade, local-first chess analysis workbench designed to treat chess games like source code. By considering a PGN file as program source code and the chess engine as a compiler/linter, it allows players to trace variations, identify critical tactical failures (blunders, mistakes), and debug alternative paths without cloud latency, mandatory accounts, or internet connectivity. 

The application runs entirely inside the client browser. It spawns a local Stockfish engine using WebAssembly (WASM) and a background Web Worker, ensuring zero server cost, absolute user privacy, and high-performance computation that keeps the board UI completely responsive.

---

## 2. Non-Negotiable Product Principles

These principles guide every architectural decision, layout choice, and feature trade-off:

1. **Main-Thread Responsiveness (The Board is Always Usable):** UI rendering must maintain a consistent 60fps. Deep engine searches must never block user interactions, board navigation, or piece dragging.
2. **Analysis Adapts to Navigation:** The engine should dynamically abort stale calculations and pivot to analyze whichever position the user is currently viewing, rather than forcing the user to wait for a linear game scan.
3. **Immutability of the Primary Record:** The original game moves submitted by the user are read-only and immutable. All exploration, alternative move testing, and variation paths are isolated within a transient "What-If" sandbox.
4. **Data Privacy and Serverless Autonomy:** The tool must work completely offline once loaded. No game data, FEN, PGN, or move history shall be transmitted to external servers. All computations are executed client-side.
5. **No-Friction Workbench:** There are no login walls, account creation screens, or cookies required to access the workbench. Time-to-value should be measured in seconds from page load to first analysis frame.

---

## 3. Epics and User Stories

### Epic 1: Game Ingestion & Input
*Goal: Provide immediate parsing, validation, and rendering of any chess game source.*

#### US-1.1: Paste PGN Input
As a chess improver, I want to paste raw PGN text into a landing screen input field so that I can immediately visualize and navigate my game.
* **Acceptance Criteria (Gherkin):**
  ```gherkin
  Given the application is in the Awaiting Input state
  When the user pastes a syntactically valid PGN string and clicks "Analyze Game"
  Then the system transitions to the Game Loaded state
  And renders the interactive Chessboard at the starting position
  And populates the Move List with chronological plys
  And displays game metadata (Player names, Elo ratings, Result) in the layout headers
  ```

#### US-1.2: Upload PGN File
As a tournament player, I want to drag and drop or upload a local `.pgn` file so that I can import my over-the-board games directly.
* **Acceptance Criteria (Gherkin):**
  ```gherkin
  Given the landing screen is displayed
  When the user drops or selects a file with a .pgn extension
  Then the system reads the file content as text
  And parses the game moves and headers
  And initializes the workbench layout with the imported game
  ```

#### US-1.3: Real-time Opening and ECO Detection
As a student, I want to see the chess opening name and ECO code display automatically as I navigate the opening moves, so that I can audit my opening theory.
* **Acceptance Criteria (Gherkin):**
  ```gherkin
  Given a game is loaded in the workbench
  When the current board position matches a FEN in the internal ECO opening database
  Then the status bar dynamically updates to show the correct ECO Code and Opening Name
  ```

---

### Epic 2: Progressive Analysis
*Goal: Stream real-time engine evaluations and classify moves objectively.*

#### US-2.1: Non-Blocking Background Engine Stream
As a competitive player, I want to see the local engine's search progress (depth, evaluation, principal variations) update in real-time without the board stuttering.
* **Acceptance Criteria (Gherkin):**
  ```gherkin
  Given a position is active in the move list
  When the Stockfish engine worker analyzes the position
  Then it streams intermediate search statistics (depth, Nodes Per Second) to the status bar
  And updates the multi-line principal variations list with evaluation scores in centipawns or mate steps
  And does not drop the browser frame rate below 50fps during intensive calculations
  ```

#### US-2.2: Automated Move Classification
As a learner, I want the system to categorize my moves based on centipawn loss so that I can easily spot mistakes and blunders.
* **Acceptance Criteria (Gherkin):**
  ```gherkin
  Given a position is evaluated by the local engine
  When the engine calculates the difference in evaluation between the played move and the best candidate move (centipawn loss)
  Then the system assigns a classification (Best, Book, Excellent, Good, Inaccuracy, Mistake, Blunder, Forced)
  And displays the corresponding visual classification badge next to the move in the Move List
  ```

#### US-2.3: Evaluation Trend Graphing
As a player, I want to view a line graph of the evaluation history of the game so that I can identify turning points and shifts in momentum.
* **Acceptance Criteria (Gherkin):**
  ```gherkin
  Given a game is loaded and analysis is ongoing
  When new move evaluations are computed by the engine
  Then the evaluation graph updates in real-time, plotting plies along the X-axis and centipawn/mate values along the Y-axis
  And clicking on any node/point in the graph jumps the board and move list to that corresponding move
  ```

---

### Epic 3: Interactive Sandbox Exploration
*Goal: Allow full, non-destructive exploration of "What-If" scenarios.*

#### US-3.1: Deviate into Sandbox
As an improver, I want to make alternative moves directly on the board from any position in the game to test "what-if" theories without corrupting the original game score.
* **Acceptance Criteria (Gherkin):**
  ```gherkin
  Given a loaded game is active at a specific move index
  When the user makes a move on the board that deviates from the original game path
  Then the system clones the game path up to the current point
  And transitions into the "What-If" Sandbox state
  And displays a clear visual banner indicating sandbox mode is active
  And redirects the engine to analyze the newly played move
  And stores subsequent moves in a separate sandbox variation array
  ```

#### US-3.2: Revert to Main Game
As a student exploring variations, I want to quickly exit the sandbox and resume analyzing the original game.
* **Acceptance Criteria (Gherkin):**
  ```gherkin
  Given the system is in the "What-If" Sandbox state
  When the user clicks the "Exit Sandbox" button on the banner
  Then the system clears the sandbox variation array
  And returns the board and move list to the exact move index and FEN where the deviation began
  And exits the sandbox state
  ```

---

### Epic 4: Portable Annotations & Exports
*Goal: Output the enriched game record for sharing or archiving.*

#### US-4.1: Annotated PGN Export
As a student, I want to download my game as a standard PGN file containing all move evaluations and classifications as inline comments, so that I can import it into other databases or send it to my coach.
* **Acceptance Criteria (Gherkin):**
  ```gherkin
  Given a game has been partially or fully analyzed by the engine
  When the user triggers the "Export PGN" action
  Then the system compiles the game metadata, original moves, and generated evaluation/classification annotations into standard PGN format (e.g., `1. e4 { [%eval 0.15] [%cld Best] } e5 ...`)
  And prompts a browser file download with a sanitized filename matching `{White}_vs_{Black}_{Date}.pgn`
  ```

---

## 4. Functional Requirements (FR)

### 4.1 Ingestion and Parser Rules
* **FR-101 (PGN Format Compliance):** The parser must process PGNs complying with the 1994 Standard (including the Seven Tag Roster).
* **FR-102 (Validation Engine):** The system must execute complete chess rules validation on ingestion. Any illegal move must halt ingestion and output the exact move number and error detail.
* **FR-103 (Multiple Games):** The system shall parse the first game found in the input stream and ignore trailing games (v1.0.1 scope constraint).
* **FR-104 (Fischer Random / Chess960):** Standard chess setup is assumed. Chess960 games are rejected or unsupported in this version.

### 4.2 Local Stockfish Engine Integration
* **FR-201 (Web Assembly Engine):** The application must initialize Stockfish compiled to WASM inside a dedicated Web Worker thread.
* **FR-202 (UCI Communication):** Command passing and message parsing must follow the Universal Chess Interface (UCI) protocol.
* **FR-203 (Multi-PV Configuration):** The engine must be configured to return 3 lines of principal variations (`setoption name MultiPV value 3`) for the current position.
* **FR-204 (Engine Throttling & Stop):** The orchestrator must send a `stop` command immediately upon a change in active move index to prevent the worker from wasting CPU cycles on stale positions.
* **FR-205 (Evaluation Persistence):** Evaluations must be mapped to their specific ply index in the state reducer, ensuring that switching between moves does not lose previously calculated evaluations.

### 4.3 Move Classification Algorithm
* **FR-301 (Classification Thresholds):** Move classifications must be derived by comparing the engine's evaluation score after the played move against the evaluation score of the engine's suggested best move in the parent position:
  * **Book:** Move matches opening database.
  * **Best:** Move matches the engine's top-recommended UCI move.
  * **Excellent:** Centipawn loss is $\le 20\text{ cp}$.
  * **Good:** Centipawn loss is between $21\text{ cp}$ and $50\text{ cp}$.
  * **Inaccuracy:** Centipawn loss is between $51\text{ cp}$ and $100\text{ cp}$.
  * **Mistake:** Centipawn loss is between $101\text{ cp}$ and $200\text{ cp}$.
  * **Blunder:** Centipawn loss is $> 200\text{ cp}$.
  * **Forced:** Only one legal move was available in the parent position.
* **FR-302 (Mate Evaluations):** Mate evaluations must be treated with infinite centipawn priority. A move that allows a mate-in-N or delays a mate-in-N must be scaled exponentially in classification logic.

### 4.4 Sandbox Exploration
* **FR-401 (Non-destructive Branching):** Playing a move on the board that does not match `moves[activeIndex + 1]` must trigger the sandbox, duplicating `moves.slice(0, activeIndex + 1)` to `sandboxMoves`.
* **FR-402 (Engine Direction):** While in sandbox mode, evaluations are committed to the `sandboxMoves` array.
* **FR-403 (Exit Cleanup):** Exiting the sandbox must discard all elements of `sandboxMoves` and restore the board state to the main game `moves`.

### 4.5 Exporter
* **FR-501 (Format Output):** The exported string must embed annotations using standard chess comment formats: `{ [%eval 1.25] [%cld Best] }`.

---

## 5. Non-Functional Requirements (NFR)

### 5.1 Performance & Latency
* **NFR-501 (Load Time):** The static asset bundle must load and render the landing screen in $< 500\text{ ms}$ on standard broadband connections (3G Throttled: $< 2.5\text{ s}$).
* **NFR-502 (Initialization Delay):** The Web Worker and WASM compilation of Stockfish must complete within $< 2\text{ s}$ of game loading.
* **NFR-503 (Frame Rate Stability):** The main thread rendering loops must maintain a frame rate of $\ge 50\text{ fps}$ during active search computations, avoiding input lags or board component stutter.
* **NFR-504 (Engine Depth Target):** The engine should reach search depth 15 for the active position within $< 3\text{ s}$ on standard quad-core mobile or desktop CPUs.

### 5.2 Accessibility (WCAG 2.1 AA Compliance)
* **NFR-521 (Keyboard Navigation):** The application must be fully navigable without a mouse. Arrow keys must traverse moves:
  * `Right Arrow` -> Next ply.
  * `Left Arrow` -> Previous ply.
  * `Up Arrow` -> Jump to starting position.
  * `Down Arrow` -> Jump to last analyzed position.
  * `H` -> Open Keyboard Shortcuts help modal.
* **NFR-522 (Color Contrast):** Text, control buttons, and move classification badges must maintain a minimum contrast ratio of `4.5:1` against their backgrounds.
* **NFR-523 (Screen Reader Compatibility):** All interactive elements must contain semantic HTML and descriptive `aria-labels` (e.g., chessboard squares must announce pieces, and status buttons must declare current states).

### 5.3 System Security & Integrity
* **NFR-531 (Zero Tracking & Privacy):** The application must run without transmitting telemetry, analytics, game data, or cookies to remote domains.
* **NFR-532 (Sanitization):** All text inputs pasted into the PGN loader must be heavily sanitized to prevent Cross-Site Scripting (XSS) injection.
* **NFR-533 (Memory Leak Prevention):** Active Web Workers must be terminated and garbage-collected upon resetting the workspace or switching games, preventing browser tab crashes due to RAM accumulation.

---

## 6. Edge Cases & Handling Protocols

| Incident / Input | System Behavior | User Notification / Resolution |
| :--- | :--- | :--- |
| **Pasted empty PGN or random string** | Halt parser, maintain "Awaiting Input" state. | Render warning banner: "Input string is empty or invalid PGN." |
| **Valid PGN containing illegal move** | Hinder ingestion at the illegal move index. | Render modal: "Parse halted at move X: [San/Uci] is illegal." |
| **Move evaluation returns Mate-in-N** | Map score as `M3` or `-M2`. Translate to large score for graphing. | Display classification using mate delta math. Graph displays mate peaks. |
| **User switches moves rapidly** | Web Worker receives instant `stop` signal, followed by new `position fen` and `go depth 15`. | UI updates statistics instantly. Stale queue items are ignored. |
| **User refreshes browser** | In-memory `WorkbenchState` resets to initial values. | Warning popup triggers if changes exist, warning that progress will be lost. |
| **Web Worker fails to initialize** | State transitions engineStatus to `error`. | Display indicator "Engine offline. Click to restart." |
| **PGN has missing headers** | Parser substitutes standard defaults (e.g., `White "Unknown"`, `Black "Unknown"`). | Render game with default headers without throwing errors. |

---

## 7. Operational Success Metrics

### Product Success Metrics
* **Feature Engagement:** Percentage of users who execute at least one sandbox move per game analysis session (Target: $> 40\%$).
* **Export Utility:** Percentage of users who successfully download annotated PGN files (Target: $> 15\%$).
* **Time-to-Value (TTV):** The duration from loading the app to viewing the first engine evaluation on ply 1 (Target: $< 3.5\text{ s}$).
* **User Retention Signal:** Duration of session workspace interaction (Target: Median session length $> 5\text{ minutes}$).

### Technical Performance Metrics
* **Computational Health:** Zero tab crashes reported on long analysis runs ($>100\text{ moves}$ analyzed to depth 15).
* **Average Nodes Per Second (NPS):** Median client execution speed of Stockfish WASM (Target: $>250,000\text{ nps}$).
* **Worker Recovery Success:** Rate of successful worker restarts without a page reload (Target: $100\%$).

---

**End of PRD**
