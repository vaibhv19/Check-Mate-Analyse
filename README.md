# ♟️ CheckMate Analyze

CheckMate Analyze is a premium, state-of-the-art interactive chess game analysis workbench built with **React**, **TypeScript**, and **Vite**. The platform allows chess enthusiasts and analysts to import standard PGN logs, run real-time local Stockfish engine calculations inside the browser, explore sandbox variation branches, review move classifications, and export fully annotated games.

🚀 **Live Site**: [check-mate-analyse.vercel.app](https://check-mate-analyse.vercel.app/)

---

## 🌟 Key Features

### 1. Interactive PGN Parser & Import
- Parse standard PGN files with support for headers (White, Black, Event, Date) and comments.
- Automatically handles standard algebraic notation (SAN) and coordinates.
- Includes a built-in pre-loaded **Grandmaster Sample Game** (Kasparov vs. Topalov, 1999) to get started instantly.

### 2. Multi-PV Stockfish Web Worker Engine
- Runs a local **Stockfish 16 WASM engine** directly in the browser via multithreaded web workers.
- Supports **Multi-PV recommendations** (displays the top 3 alternative paths with depth, score, and move details).
- Accelerated with Cross-Origin Opener Policy (COOP) and Cross-Origin Embedder Policy (COEP) headers on Vercel deployment for CPU multithreading.

### 3. Lichess-Style Move Classification
- Compares engine evaluations of played moves against the best moves using normalized White-perspective centipawn scoring.
- Classifies each move with distinct badges:
  - ✨ **Best**: Played move matches the best engine recommendations.
  - 🌟 **Excellent**: Centipawn loss $\le 15$.
  - 👍 **Good**: Centipawn loss $\le 40$.
  - ⚠️ **Inaccuracy**: Centipawn loss $\le 100$.
  - ❌ **Mistake**: Centipawn loss $\le 200$.
  - 💥 **Blunder**: Centipawn loss $> 200$.
  - 🔄 **Forced**: Only one legal move was available.
  - 📖 **Book**: Matches known openings.

### 4. Real-time Evaluation Bar & Graph
- **Evaluation Bar**: A Lichess-style vertical panel positioned next to the board showing the relative advantage between White and Black, synchronized to the exact height of the board.
- **Evaluation Curve**: A responsive area chart visualization illustrating the evaluation score flow over the entire game sequence, letting you spot critical blunders or turning points instantly.

### 5. Interactive Sandbox Mode
- Intercepts FEN drop movements on the board to let you play alternative lines at any point in the game.
- Automatically forks the timeline and creates sandbox branches without modifying the original game log history.
- Exit sandbox mode at any time with a single click to restore the original game path.

### 6. PGN Exporter with Eval Annotations
- Compiles the analyzed game and exports it to a standard PGN file.
- Appends Stockfish evaluations and depth details directly to the moves as standardized annotations (e.g., `1. e4 { [%eval 0.3] }`).
- Displays a warning modal if you export a game that has not been fully analyzed.

### 7. Accessibility & Shortcuts Guide
- View the complete keybind guide modal by pressing the help button or the `H` key.
- Full keyboard navigation support (Left/Right arrows for move stepping, Space for autoplay toggles).

---

## 🛠️ Technology Stack

- **Core**: React 18, TypeScript, Vite
- **Styling**: TailwindCSS, CSS Variables, Custom Aspect Ratios
- **Chess Logic**: Chess.js (Rules and FEN generation), React-Chessboard
- **Engine**: Stockfish WASM (compiled for multi-threaded Web Workers)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Testing**: Vitest, JSDom Testing Library

---

## 📂 Project Architecture

```
src/
├── components/          # Shared components (layouts, statusbar)
│   └── layout/
│       └── WorkbenchLayout.tsx  # Main responsive grid dashboard layout
├── context/             # Redux-style Global Workbench State
│   ├── reducer.ts       # Action handlers for FEN, moves, sandbox, and active indexes
│   └── WorkbenchContext.tsx # Context Provider & state access hooks
├── features/            # Feature modular components
│   ├── board/           # Chessboard & BoardControls
│   ├── classification/  # Move classification badges
│   ├── engine/          # Stockfish web worker handlers, recommendations, and EvalBar
│   ├── graph/           # Evaluation Curve Recharts component
│   ├── pgn/             # Export confirm dialogs and import LandingForm
│   ├── sandbox/         # Sandbox banner alert
│   └── shortcuts/       # Keyboard shortcut guides
├── utils/               # Logic utilities
│   ├── moveClassifier.ts     # Centipawn loss and perspective calculators
│   ├── pgnExporter.ts        # PGN string serializer
│   ├── pgnParser.ts          # Regular expressions parser
│   └── stockfishClient.ts    # Web Worker Stockfish runner
└── test/                # Unit and Integration Test suite
```

---

## 🚀 Local Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/vaibhv19/Check-Mate-Analyse.git
   cd Check-Mate-Analyse
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start local development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173/` in your browser.

4. **Build production bundle**:
   ```bash
   npm run build
   ```

5. **Run Lint Checks**:
   ```bash
   npm run lint
   ```

---

## 🧪 Running Tests

The project includes an extensive test suite verifying parsers, classification deltas, board navigation, and sandbox transitions.

To execute tests with **Vitest**:
```bash
npm run test
```

---

## 📦 Deployment Configuration

Deployed on Vercel with COOP & COEP isolation headers in `vercel.json` to enable SharedArrayBuffer multithreading for Stockfish WASM:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cross-Origin-Opener-Policy",
          "value": "same-origin"
        },
        {
          "key": "Cross-Origin-Embedder-Policy",
          "value": "require-corp"
        }
      ]
    }
  ]
}
```

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
