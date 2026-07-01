# Software Requirements Specification (SRS)
## CheckMate Analyze

**Project:** CheckMate Analyze  
**Version:** 1.0  
**Status:** Approved  
**Date:** July 2026  
**One-Sentence Vision:** "The fastest way to understand why you lost a chess game."

---

## Document Control
| Field | Details |
| :--- | :--- |
| **Document Name** | Software Requirements Specification |
| **Project Name** | CheckMate Analyze |
| **Version** | 1.0 |
| **Status** | Approved |
| **Document Owner** | Lead Systems Analyst |
| **Reviewers** | Senior Product Manager, Technical Lead, QA Lead |
| **Approver** | Project Stakeholder |
| **Last Updated** | 2026-07-01 |
| **Classification** | Internal Project Documentation |

---

## Table of Contents
1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [Functional Requirements](#3-functional-requirements)
4. [Non-Functional Requirements](#4-non-functional-requirements)
5. [External Interface Requirements](#5-external-interface-requirements)
6. [Business Rules](#6-business-rules)
7. [Data Requirements](#7-data-requirements)
8. [Error Handling & Exception Requirements](#8-error-handling--exception-requirements)
9. [State Model](#9-state-model)
10. [Requirement Traceability Matrix (RTM)](#10-requirement-traceability-matrix-rtm)
11. [Appendices](#11-appendices)

---

# 1 Introduction

## 1.1 Purpose
This Software Requirements Specification (SRS) describes the functional and non-functional requirements for Version 1.0 of **CheckMate Analyze**. This document is intended for software architects, developers, and QA engineers as the definitive technical guide for the application’s behavior and constraints.

## 1.2 Scope
CheckMate Analyze is a local-first chess analysis workbench. The application facilitates the parsing of Portable Game Notation (PGN) data and provides engine-powered evaluations, move classifications, and interactive variation exploration. The scope is limited to a client-side web utility; it excludes server-side persistence, user accounts, and social features.

## 1.3 Definitions, Acronyms, and Abbreviations
Refer to [Section 11.1 (Glossary)](#111-glossary) for terminology.

## 1.4 References
*   Product Requirements Document (PRD): CheckMate Analyze v1.0.
*   IEEE Std 29148-2018 (Requirements Engineering).
*   Official PGN Specification (1994).
*   FIDE Laws of Chess.

---

# 2 Overall Description

## 2.1 Product Perspective
CheckMate Analyze operates as a standalone web utility. It follows a "Local-First" architectural philosophy where all data processing, including the chess engine and PGN parsing, occurs within the user's local execution environment.

## 2.2 Product Functions
*   **Ingestion:** Standardized parsing of PGN text and files.
*   **Visualization:** Interactive 8x8 board and chronological move list.
*   **Analysis:** Continuous streaming of position evaluations and candidate lines.
*   **Exploration:** Non-destructive "What-If" branching (Sandbox).
*   **Export:** Production of annotated PGN records.

## 2.3 User Classes and Characteristics
*   **Improvers:** Players seeking to identify tactical errors and blunders.
*   **Coaches/Students:** Users requiring a clean interface to explore "What-If" variations.
*   **Privacy Advocates:** Users who require analysis without transmitting game data to external servers.

## 2.4 Design and Implementation Constraints
*   **Client-Side Execution:** Computation must occur on user hardware.
*   **Statelessness:** No data persists across browser refreshes or session termination.
*   **Browser Limits:** Must operate within standard browser memory and thread constraints.

---

# 3 Functional Requirements

## 3.1 Game Input & Validation

### FR-101: PGN Text Input
*   **Priority:** Critical
*   **Description:** The system shall provide a text input area for pasting PGN strings.
*   **Preconditions:** System is in the Awaiting Input state.
*   **Inputs:** Text string.
*   **Processing:** Capture string and initiate syntax validation.
*   **Outputs:** Loading indicator.
*   **Postconditions:** Transitions to Validating state.
*   **Exceptions:** Empty input results in no transition.
*   **Acceptance Criteria:** Given the landing page is loaded, when a PGN is pasted, then the parsing process starts automatically.

### FR-102: PGN File Upload
*   **Priority:** Critical
*   **Description:** The system shall allow users to select and upload a local `.pgn` file.
*   **Preconditions:** System is in the Awaiting Input state.
*   **Inputs:** Local file reference.
*   **Processing:** Read file contents as text.
*   **Outputs:** Loading indicator.
*   **Acceptance Criteria:** Given the upload control, when a valid .pgn file is selected, then the system reads and parses the content.

### FR-103: Syntax and Legality Validation
*   **Priority:** Critical
*   **Description:** The system shall validate PGN syntax and ensure all move sequences follow the Laws of Chess.
*   **Preconditions:** Raw data is captured.
*   **Inputs:** Raw text.
*   **Processing:** Syntax check; move-by-move legality check; header extraction.
*   **Outputs:** Internal Game Object or Error Message.
*   **Acceptance Criteria:** Given a PGN with an illegal move, when parsed, then the system identifies the specific move number and halts the load.

## 3.2 Game Visualization

### FR-201: Interactive Chessboard
*   **Priority:** Critical
*   **Description:** The system shall render an 8x8 chessboard reflecting the current game position.
*   **Preconditions:** Game Object loaded successfully.
*   **Acceptance Criteria:** Given a loaded game, when a move is selected, then the board displays the corresponding piece positions.

### FR-202: Navigation and Sync
*   **Priority:** High
*   **Description:** Selecting a move in the list or using keyboard arrows shall synchronize the board and analysis context.
*   **Preconditions:** Game loaded.
*   **Acceptance Criteria:** Given a 40-move game, when the user presses the left arrow key, then the board retreats one ply and the engine begins analyzing the new position.

## 3.3 Game Analysis

### FR-301: Progressive Evaluation Streaming
*   **Priority:** High
*   **Description:** The system shall stream engine scores (centipawns/mate) to the UI as they are calculated.
*   **Acceptance Criteria:** Given an ongoing analysis, when a score is generated, then it appears in the move list immediately without UI blocking.

### FR-302: Move Classification
*   **Priority:** High
*   **Description:** The system shall label moves based on Centipawn loss (Best, Excellent, Good, Inaccuracy, Mistake, Blunder).
*   **Acceptance Criteria:** Given a move that loses 300 centipawns, when analyzed, then it is marked with the "Blunder" label and icon.

## 3.4 What-If Sandbox

### FR-401: Sandbox Branching
*   **Priority:** Medium
*   **Description:** The system shall create a temporary variation when a move is played that deviates from the PGN.
*   **Postconditions:** Original PGN remains immutable.
*   **Acceptance Criteria:** Given a loaded game, when the user plays a new move on the board, then a "What-If" indicator appears and analysis shifts to the new line.

## 3.5 Export & Session

### FR-501: Annotated PGN Export
*   **Priority:** Medium
*   **Description:** The system shall generate a downloadable PGN including evaluations as comments.
*   **Acceptance Criteria:** Given an analyzed game, when Export is triggered, then a file is downloaded containing standard PGN tags and move annotations.

---

# 4 Non-Functional Requirements

## 4.1 Performance
*   **NFR-101:** The application shall be interactive within 500ms of loading.
*   **NFR-102:** Initial evaluation for a move shall appear within 2 seconds of selection.

## 4.2 Reliability
*   **NFR-201:** The system shall recover from background analysis failures without requiring a page refresh.

## 4.3 Security
*   **NFR-301:** All inputs shall be sanitized to prevent cross-site scripting (XSS).

## 4.4 Privacy
*   **NFR-401:** No PGN data or analysis results shall be transmitted to external servers.

## 4.5 Accessibility
*   **NFR-501:** The board and move list shall comply with WCAG 2.1 AA standards for keyboard navigation and screen readers.

## 4.6 Compatibility
*   **NFR-601:** The system shall support Chrome, Firefox, Safari, and Edge (latest 2 versions).

## 4.7 Availability
*   **NFR-701:** Once loaded, all core features shall remain available in an offline state.

## 4.8 Maintainability
*   **NFR-801:** User-facing strings shall be externalized to facilitate future localization.

## 4.9 Scalability (Client-Side)
*   **NFR-901:** The system shall maintain UI responsiveness for games up to 500 moves in length.

## 4.10 Usability
*   **NFR-1001:** Core analysis results shall be accessible within 2 user actions from the landing page.

---

# 5 External Interface Requirements

## 5.1 User Interface Requirements
*   **UIR-101:** The interface shall feature a unified layout: Board (Left/Center), Move List (Right), Evaluation Graph (Bottom).
*   **UIR-102:** A persistent Status Indicator shall display engine depth and analysis state.

## 5.2 Interaction Requirements
*   **CIR-101:** The system shall support drag-and-drop piece movement for sandbox exploration.
*   **CIR-102:** Mouse wheel or touch swipe shall navigate the move list.

## 5.3 File Interface Requirements
*   **FIR-101:** Supported file extension: `.pgn`.
*   **FIR-102:** File encoding: UTF-8.

---

# 6 Business Rules

*   **BR-101: Legal Moves Only:** The system shall never permit or analyze an illegal chess position.
*   **BR-102: Immutability:** Exploration in the Sandbox shall never alter the source PGN data.
*   **BR-103: Objective Metrics:** Classifications must be derived strictly from engine evaluation deltas.
*   **BR-104: No Accounts:** All functionality must be available without user registration.

---

# 7 Data Requirements

## 7.1 Logical Data Entities
*   **DR-101: Game Entity:** Stores headers (Players, Date, Event) and the ordered list of Moves.
*   **DR-102: Position Entity:** Stores piece coordinates, side to move, and castling rights.
*   **DR-103: Evaluation Entity:** Stores numeric scores and principal variations.

## 7.2 Data Lifecycle
1.  **Ingestion:** Raw PGN text is converted into a logical Game Object.
2.  **Analysis:** Position entities are enriched with Evaluation data.
3.  **Exploration:** Temporary Variation objects are created and destroyed during Sandbox sessions.
4.  **Termination:** All memory is cleared upon session reset or browser close.

## 7.3 Data Validation Rules
*   **DR-201:** PGN headers must follow the "Seven Tag Roster" standard.
*   **DR-202:** Move data must be validated against the starting position of the game.

---

# 8 Error Handling & Exception Requirements

## 8.1 Input Errors
*   **ER-101: Invalid PGN Syntax:** System shall display a message indicating the line number of the syntax error.
*   **ER-102: Illegal Move:** System shall identify the illegal move (e.g., "Move 14: White cannot move Bishop through Pawn").

## 8.2 Analysis & Resource Errors
*   **ER-201: Engine Interruption:** System shall provide a "Restart Engine" button if the analysis process terminates unexpectedly.
*   **ER-202: Resource Exhaustion:** For exceptionally long games, the system shall throttle the evaluation graph update frequency to preserve UI responsiveness.

## 8.3 Export Errors
*   **ER-301: Partial Export:** If the user exports before analysis is complete, the system shall warn that some moves will lack annotations.

---

# 9 State Model

## 9.1 Application States
1.  **Awaiting Input:** Default state; landing page showing PGN input area.
2.  **Validating:** Parsing input and checking for legality.
3.  **Game Loaded:** Analysis triggered; board interactive.
4.  **Analyzing:** Engine actively processing moves.
5.  **Reviewing:** User navigating game; engine analyzing current focus.
6.  **Exploration Sandbox:** User playing moves outside the PGN sequence.
7.  **Error:** Displays validation or system failure messages.

## 9.2 State Transition Table
| Current State | Event | Next State |
| :--- | :--- | :--- |
| Awaiting Input | PGN Provided | Validating |
| Validating | Success | Game Loaded |
| Validating | Failure | Error |
| Game Loaded | Deviation Move Played | Exploration Sandbox |
| Exploration Sandbox | "Return to Game" | Reviewing |
| Any State | Reset Triggered | Awaiting Input |

---

# 10 Requirement Traceability Matrix (RTM)

| PRD Requirement | User Story | Business Rule | Functional Req | Non-Functional | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| PGN Analysis | US-01 | BR-101 | FR-101, 103 | NFR-101 | Board loads < 500ms |
| Engine Workbench | US-04 | BR-103 | FR-301, 302 | NFR-102 | Live centipawn streaming |
| "What-If" Exploration | US-06 | BR-102 | FR-401 | NFR-1001 | Deviation move enters sandbox |
| Local Privacy | US-01 | BR-104 | FR-101 | NFR-401 | Zero network data transmission |
| Annotated Export | US-08 | BR-101 | FR-501 | NFR-801 | PGN includes eval comments |

---

# 11 Appendices

## 11.1 Glossary
*   **Centipawn (cp):** Unit of evaluation where 100cp = 1 Pawn.
*   **ECO:** Encyclopedia of Chess Openings.
*   **FEN:** Forsyth-Edwards Notation for single positions.
*   **PGN:** Portable Game Notation for full games.
*   **PV:** Principal Variation (the engine's "best" line).

## 11.2 Acronyms
*   **FIDE:** International Chess Federation.
*   **GUI:** Graphical User Interface.
*   **RTM:** Requirement Traceability Matrix.
*   **WCAG:** Web Content Accessibility Guidelines.

## 11.3 Future Considerations (V2.0+)
*   User Accounts for cloud persistence.
*   Shareable analysis URLs.
*   "Brilliant" and "Great" move heuristics.
*   Self-contained HTML report exports.

***
**End of Document**