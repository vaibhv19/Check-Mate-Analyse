# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.1] - 2026-07-28

This release focuses on auditing, upgrading, and expanding all project architecture, planning, and technical specification documentation to MAANG-portfolio standards. No functional codebase logic changes were made.

### Added
* **Deep Engineering Specifications:**
  * `Docs/ENGINE_PIPELINE_SPEC.md` — Detailed worker execution lifecycle, UCI protocols, and navigation interrupts.
  * `Docs/CENTIPAWN_GRADING_SPEC.md` — Formulated score normalization, played move centipawn loss deltas, and checkmate distance decay.
  * `Docs/STATE_MANAGEMENT_SPEC.md` — Defined flat history tree arrays, reducer actions, and sandbox timeline slicing.
  * `Docs/ERROR_HANDLING_SPEC.md` — Mapped PGN exceptions, worker crash recovery state flows, and chart rendering throttles.
  * `Docs/TESTING_STRATEGY.md` — Standardized Vitest, RTL, worker/timer mocks, and pre-commit checks.
* **Product Alignment & Matrices:**
  * `Docs/FEATURE_LIST.md` — Granular matrix mapping feature paths from inputs to queue rules, sandbox states, and exports.
* **Knowledge base:**
  * `Docs/LEARNING_HANDBOOK.md` — Production-grade handbook with thread isolation sequence diagrams, debugging walkthroughs, and key takeaways.
* **Release Tooling:**
  * `.github/ISSUE_TEMPLATE/bug_report.md` — Standardized bug reporting.
  * `.github/ISSUE_TEMPLATE/feature_request.md` — Standardized feature request templates.

### Changed
* **Upgraded Core Documents:**
  * `README.md` (Root) — Rewritten into an engineering showcase featuring HSL badges, Mermaid boundaries, and deep-dive highlights.
  * `Docs/PRD.md` — Standardized requirements, non-negotiable principles, and Gherkin-syntax user stories.
  * `Docs/TECH_STACK.md` (Uppercase) — Expanded architectural trade-offs for React, Vite, TS, Tailwind, Stockfish, Web Workers, and Recharts.
  * `Docs/APP_FLOW.md` (Uppercase) — Integrated sequence and state diagrams for user move inputs, worker streams, and sandbox forks.
  * `Docs/UI_DESIGN.md` (Uppercase) — Detailed layouts, hierarchies, WCAG 2.1 AA checklists, responsive grids, and design tokens.
  * `Docs/SYSTEM_ARCHITECTURE.md` (Uppercase) — Documented thread boundaries, stateless reducer rules, and recovery behaviors.

### Removed
* Obsolete lowercase files:
  * `Docs/techstack.md` (Replaced by `Docs/TECH_STACK.md`)
  * `Docs/ARCHITECTURE.md` (Replaced by `Docs/SYSTEM_ARCHITECTURE.md`)

---

## [1.0.0] - 2026-07-01

### Added
* Core interactive chessboard with drag-and-drop piece support.
* Local Stockfish WASM background Web Worker engine implementation.
* Multi-PV display panel supporting the top 3 alternative paths.
* Centipawn loss move classification badges (Best, Excellent, Good, Inaccuracy, Mistake, Blunder, Book, Forced).
* Real-time interactive evaluation bar and Recharts evaluation graph.
* Non-destructive Sandbox variation branching mode.
* PGN importer supporting raw copy-paste and file drops.
* Annotated PGN exporter with inline evaluations and classifications as comments.
* Autoplay navigation controls and keyboard arrow navigation.
* Interactive keyboard shortcut guide modal.
* Vercel serverless deployment setup with COOP & COEP isolation headers.
