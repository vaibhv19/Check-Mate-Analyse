# Product Requirements Document: CheckMate Analyze (MVP)

**Version:** 1.0  
**Status:** Final / Ready for Engineering  
**One-Sentence Vision:** "The fastest way to understand why you lost a chess game."

---

## 1. Executive Summary
CheckMate Analyze is a local-first chess analysis workbench. It is designed to be a high-utility tool that treats a chess game like source code: the PGN is the program, the engine is the compiler, and the user’s goal is to debug their mistakes. It removes the friction of accounts, subscriptions, and social bloat to provide immediate, objective feedback.

---

## 2. Non-Negotiable Product Principles
These principles guide every trade-off and feature decision.

1.  **The Board is Always Usable:** Analysis must never block user interaction. Navigating the game is the priority.
2.  **Analysis Never Blocks Navigation:** The user can jump to any move at any time; the system adapts to the user's location.
3.  **The Original PGN is Immutable:** Exploration and "What-If" scenarios are sandboxed to preserve the integrity of the submitted game.
4.  **Explain Every Recommendation:** Every engine suggestion must be accompanied by the objective data (evaluation, lines) required to understand it.
5.  **Every Feature Must Reinforce Learning:** If a feature doesn't help a user understand their game better or faster, it is out of scope.

---

## 3. User Stories

### **Epic: Game Entry**
*   **US-01:** As a player, I want to paste a PGN so that I can start analyzing my game without creating an account.
*   **US-02:** As a tournament player, I want to upload a PGN file so that I can review my OTB (Over The Board) games.
*   **US-03:** As a student, I want to see the opening name immediately so that I can identify if I left "book" theory too early.

### **Epic: Progressive Analysis**
*   **US-04:** As a player, I want to see evaluations and move classifications appear as I browse, so that I don't have to wait for a full-game scan to complete.
*   **US-05:** As an improver, I want to see an evaluation graph that populates in real-time, so that I can visually identify the "turning points" of the game.

### **Epic: Interactive Exploration**
*   **US-06:** As a learner, I want to play alternative moves from any position, so that I can test my own ideas against the engine's recommendations.
*   **US-07:** As an advanced player, I want to see multiple engine lines (Multi-PV), so that I can understand the relative merits of different candidate moves.

### **Epic: Portable Results**
*   **US-08:** As a student, I want to export my analyzed game, so that I can save my work or send it to my coach for further review.

---

## 4. Functional Requirements

### 4.1 Input & Parsing
*   **FR-01:** The system shall accept PGN data via text paste or file upload.
*   **FR-02:** The system shall parse valid PGNs into an interactive move list and board representation.
*   **FR-03:** The system shall identify the opening name and ECO code based on the initial moves of the PGN.

### 4.2 Local Analysis Engine
*   **FR-04:** The system shall perform engine analysis locally on the user's device.
*   **FR-05:** Analysis shall be progressive, updating the UI (Evaluations, Move Classifications, Graph) as data becomes available.
*   **FR-06:** The system shall support at least three engine lines (Multi-PV) for any given position.
*   **FR-07:** Move classifications shall be derived from objective engine evaluation changes (e.g., Centipawn loss).

### 4.3 The "What-If" Sandbox
*   **FR-08:** The system shall allow users to enter a temporary "What-If" mode from any position in the game.
*   **FR-09:** In "What-If" mode, the user can play any legal move; the engine will provide real-time feedback for the new variation.
*   **FR-10:** The system shall provide a clear "return" mechanism that exits the sandbox and restores the original game state.

### 4.4 Data Export
*   **FR-11:** The system shall allow users to download an annotated PGN containing the evaluations and classifications generated during the session.

---

## 5. Non-Functional Requirements

### 5.1 Performance
*   **NFR-01:** The application shall load and become interactive within a time frame that feels instantaneous to the user.
*   **NFR-02:** Initial engine feedback for the starting move should appear within seconds of game entry.
*   **NFR-03:** The UI must remain responsive (60fps) even while the engine is consuming high CPU resources in the background.

### 5.2 Security & Privacy
*   **NFR-04:** PGN data shall not be transmitted to or stored on any remote server.
*   **NFR-05:** All analysis must occur within the client-side environment.

### 5.3 Compatibility & Accessibility
*   **NFR-06:** The system shall support modern evergreen browsers (Chrome, Firefox, Safari, Edge).
*   **NFR-07:** The board and move list shall be navigable via keyboard.
*   **NFR-08:** UI elements must meet WCAG 2.1 AA standards for color contrast and screen-reader accessibility.

---

## 6. Constraints, Assumptions, and Risks

### 6.1 Constraints
*   **C-01:** Limited by client-side hardware (CPU/RAM).
*   **C-02:** Session data is ephemeral; refreshing the browser will reset the analysis workbench.

### 6.2 Assumptions
*   **A-01:** Users are familiar with basic chess notation (Algebraic notation).
*   **A-02:** Users have access to a PGN from their game source.
*   **A-03:** The browser environment supports the modern standards required for local execution.

### 6.3 Risks
*   **R-01:** Complex PGNs (e.g., games with 200+ moves) may degrade performance on older mobile devices.
*   **R-02:** Inconsistent browser CPU-throttling may lead to variable analysis speeds.

---

## 7. Success Metrics

### Product Metrics
*   **Session Depth:** Percentage of users who engage with "What-If" variations (Target: >30%).
*   **Export Rate:** Percentage of users who download an annotated PGN.
*   **Time to Value:** Time elapsed between landing on the site and first move classification.

### Technical Metrics
*   **Engine Efficiency:** Average Nodes Per Second (NPS) across different device profiles.
*   **Stability:** Rate of engine-worker crashes or PGN parsing errors.
*   **Memory Footprint:** Peak memory usage during deep game analysis.

---

## 8. Out of Scope (Future Roadmap)
*   User accounts and cloud-saved history.
*   Shareable URLs for analysis sessions.
*   Proprietary human-centric metrics (e.g., "Brilliant" moves, Accuracy %).
*   Multi-game database management.
*   Self-contained HTML report exports.

***

**End of PRD**