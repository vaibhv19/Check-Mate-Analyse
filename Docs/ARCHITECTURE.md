# Architecture Document: CheckMate Analyze

**Project:** CheckMate Analyze  
**Version:** 1.0  
**Status:** Approved  
**Classification:** Internal Technical Documentation

---

## 1. Architecture Overview

CheckMate Analyze is a **Local-First Analysis Workbench**. The architecture is designed to transform the web browser from a simple rendering engine into a high-performance execution environment for chess analysis.

The system follows a "PGN as Source, Engine as Compiler" metaphor. The architecture prioritizes **computational isolation**, ensuring that intensive analysis tasks do not interfere with user interface responsiveness. By maintaining a stateless, client-side-only footprint, the architecture ensures maximum privacy and zero operational overhead.

---

## 2. Design Principles

The following principles govern the structural decisions of the CheckMate Analyze system:

1.  **Thread Separation:** All heavy computation (chess engine analysis) must be logically and physically isolated from the rendering thread.
2.  **Stateless Execution:** The application serves as a transformation layer. It takes PGN input, enriches it with analysis data, and produces a portable output. No data is persisted in a central database.
3.  **Unidirectional Data Flow:** State changes follow a strict path from the Input/Analysis layers to the View layer to maintain consistency across the Board, Move List, and Evaluation Graph.
4.  **Local Authority:** The client environment is the "Source of Truth" for chess rules, move validation, and opening detection.
5.  **Immutability of the Primary Record:** The original game data is stored in a read-only structure; sandbox variations exist in a separate, transient branch to prevent "destructive" analysis.

---

## 3. High-Level Architecture

The system is organized into four primary layers: **Interface**, **Orchestration**, **Domain Logic**, and **Provider Services**.

```text
+-------------------------------------------------------------+
|                      INTERFACE LAYER                        |
|   (Board View, Move List View, Graph View, Controls)        |
+------------------------------+------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                    ORCHESTRATION LAYER                      |
|                  (Workbench Controller)                     |
|      Manages state transitions and component syncing         |
+------------------------------+------------------------------+
                               |
       +-----------------------+-----------------------+
       |                       |                       |
       v                       v                       v
+--------------+       +---------------+       +---------------+
| DOMAIN LOGIC |       | ANALYSIS      |       | PROVIDER      |
|              |       | ORCHESTRATOR  |       | SERVICES      |
| (Rules, PGN  |       |               |       | (ECO DB,      |
|  Validation) |       | (Engine Mgmt) |       |  PGN Parser)  |
+--------------+       +---------------+       +---------------+
       |                       |                       |
       +-----------+-----------+-----------+-----------+
                   |           |           |
                   v           v           v
           +---------------------------------------+
           |           TRANSIENT STATE             |
           |     (In-Memory Game & Eval Data)      |
           +---------------------------------------+
```

---

## 4. Component Responsibilities

### 4.1 Interface Layer

- **Board Component:** Renders the 8x8 grid and handles move inputs (drag-and-drop or click).
- **Analytics Components:** Visual representation of engine data (Move List annotations and Evaluation Graph).
- **Workbench UI:** Manages layout and high-level user triggers (Reset, Export).

### 4.2 Workbench Controller (The Orchestrator)

The central hub of the application. It listens for events from the Interface (e.g., "Move Clicked"), queries the Domain Logic for validity, requests analysis from the Orchestrator, and updates the Transient State.

### 4.3 Domain Logic (The Rules Engine)

The implementation of the Laws of Chess. It is responsible for move validation, position generation (FEN), and game-over detection. It is completely agnostic of the UI and the Analysis Engine.

### 4.4 Analysis Orchestrator

Manages the lifecycle of the chess engine.

- Starts/Stops analysis tasks.
- Handles "Multi-PV" (multiple lines) requests.
- Translates raw engine output into the system’s internal Evaluation data entity.

### 4.5 Provider Services

- **PGN Utility:** Converts raw text/files into structured game objects and vice-versa.
- **Metadata Provider:** Performs lookups against a local database for Opening names (ECO).

---

## 5. Data Flow

### 5.1 Ingestion Flow

1.  **User** provides PGN string.
2.  **PGN Utility** parses text into a **Game Entity**.
3.  **Workbench Controller** validates the game against the **Rules Engine**.
4.  **State** is updated; **Interface** renders the board and move list.
5.  **Analysis Orchestrator** is triggered for the first move.

### 5.2 Analysis Feedback Loop (Progressive)

1.  **Analysis Orchestrator** broadcasts periodic updates.
2.  **Workbench Controller** receives evaluation scores.
3.  **State Manager** enriches the specific **Move Entity** with analysis data.
4.  **Interface** components (Move List and Graph) re-render the specific data points without refreshing the board.

---

## 6. State Management

The application maintains a **Stateless/Transient State**.

- **Game State:** An immutable list of moves and headers.
- **Analysis State:** A mapping of move indices to their respective engine evaluations, classifications, and candidate lines.
- **UI State:** Current move index, active sandbox variations, and visibility toggles.

State is kept entirely in memory. To preserve the "Local-First" principle, any refresh of the browser environment clears the state, effectively resetting the workbench.

---

## 7. Module Boundaries

- **Logical Isolation:** The **Analysis Engine** must run in a separate execution context from the **UI/Rules Engine**. Communication between them occurs via a message-passing interface to prevent main-thread blocking.
- **Dependency Direction:** Higher-level components (UI) depend on the Orchestrator, but the Domain Logic (Rules Engine) must have zero dependencies on the UI or Analysis layers.
- **Privacy Wall:** No component is permitted to initiate external network requests once the application has been initialized.

---

## 8. Error Flow

Errors follow a "Bubble-Up and Notify" strategy:

1.  **Capture:** Errors are caught at the source (e.g., PGN Parser fails, Engine crashes).
2.  **Translation:** Technical errors are translated into "Human-Style" error entities by the **Workbench Controller**.
3.  **Notification:** The Interface Layer renders the error through a global notification component.
4.  **Recovery:** The system provides a "Reset" trigger that re-initializes the Orchestration and State layers to a known good state.

---

## 9. Future Extension Points

The architecture is designed to accommodate the following v2.0 enhancements without structural refactoring:

- **Cloud Persistence Layer:** A new "Persistence Provider" can be injected into the Workbench Controller to mirror the local state to a remote database.
- **AI Insight Layer:** A post-processing module that consumes the Analysis State to generate natural language explanations.
- **Collaborative Sessions:** A communication module using peer-to-peer protocols to sync the State between two clients.

---

## 10. Architecture Decision Summary

| Decision                  | Impact       | Rationale                                                       |
| :------------------------ | :----------- | :-------------------------------------------------------------- |
| **Separated Computation** | Performance  | Prevents CPU-heavy analysis from freezing the UI.               |
| **Client-side Parsing**   | Privacy/Cost | Zero data leaves the device; zero server costs.                 |
| **Stateless Workbench**   | Complexity   | Simplifies the data model by avoiding database synchronization. |
| **Immutable Game Record** | Reliability  | Ensures "What-If" exploration never corrupts the source data.   |
| **Unidirectional Flow**   | Maintenance  | Makes state changes predictable and easier to debug.            |

---

**End of Architecture Document**
