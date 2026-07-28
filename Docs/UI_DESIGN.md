# UI Design & Design System Tokens: CheckMate Analyze (v1.0.1)

This document details the user interface layout, component hierarchy, accessibility compliance checklist, responsive design grid, and color token systems for CheckMate Analyze.

---

## 1. Interface Layout Configurations

The workbench switches between two primary view layouts depending on whether a game is loaded in the workspace.

### A. Landing Screen Layout (Awaiting Input State)
* **Visual Structure:** A centered card layout on a dark background.
* **Key Components:**
  * **Header:** Logo and subtitle ("The fastest way to understand why you lost a chess game").
  * **PGN Input Area:** High-contrast text input box with placeholder examples.
  * **Controls:** "Analyze Game" button and a "Load Fischer vs Spassky Sample Match" button.
  * **Error Panel:** Shows syntax warnings or illegal move locations if parsing fails.

### B. Workbench Layout (Game Loaded State)
The layout uses a responsive grid that adjusts based on screen width. On desktop, it renders a three-column dashboard:

```
+---------------------------------------------------------------------------------+
|                                 STATUS BAR                                      |
+-------------------------------------------------+-------------------------------+
|                                                 |           MOVE LIST           |
|                                                 |                               |
|                                                 |  1. e4 (Book)   e5 (Book)     |
|                   CHESSBOARD                    |  2. Nf3 (Best)  N6 (Blunder)  |
|                                                 |  3. Bb5 (Best)                |
|                                                 +-------------------------------+
|                                                 |          ENGINE PANEL         |
|                                                 |                               |
|        [ First ][ Prev ][ Next ][ Last ]        |  +3.14 (Depth 15, 290k nps)   |
|                 [ Export PGN ]                  |  1. Bb5 (Played)              |
|                                                 |  2. Bc4 (+2.85)               |
|                                                 |  3. d4 (+2.10)                |
+-------------------------------------------------+-------------------------------+
|                                EVALUATION GRAPH                                 |
|                                (Bottom Panel)                                   |
+---------------------------------------------------------------------------------+
```

---

## 2. Component Hierarchy

The diagram below maps the nesting of components inside the React virtual DOM under the `WorkbenchProvider` context:

```
App
 └── WorkbenchProvider (State Context)
      └── Workbench
           ├── LandingForm (If moves.length === 0)
           │    └── SyntaxErrorPanel (Conditional)
           │
           ├── WorkbenchLayout (If moves.length > 0)
           │    ├── ChessboardContainer [Board View]
           │    │    └── react-chessboard
           │    │
           │    ├── SandboxBanner [Sandbox Alert] (Conditional)
           │    │
           │    ├── BoardControls [Navigation Panel]
           │    │
           │    ├── MoveList [Ply Grid]
           │    │    └── ClassificationBadge (Best, Blunder, etc.)
           │    │
           │    ├── EnginePanel [Stockfish Feed]
           │    │    ├── EvaluationBar [Dynamic centipawn meter]
           │    │    └── PrincipalVariationsList [Lines 1-3]
           │    │
           │    ├── EvaluationGraph [Trend Graph]
           │    │    └── Recharts AreaChart
           │    │
           │    └── StatusBar [Engine & ECO metadata indicator]
           │
           ├── ExportConfirmDialog [Warning modal]
           └── KeyboardShortcutsModal [Shortcuts help sheet]
```

---

## 3. Accessibility Compliance (WCAG 2.1 AA Checklist)

To ensure inclusivity, CheckMate Analyze adheres to WCAG 2.1 AA standards.

### A. Keyboard Navigation Mappings
* **Left Arrow (`ArrowLeft`):** Moves the active move index backward by 1.
* **Right Arrow (`ArrowRight`):** Moves the active move index forward by 1.
* **Up Arrow (`ArrowUp`):** Resets the board to the game start position (`activeMoveIndex = -1`).
* **Down Arrow (`ArrowDown`):** Jumps to the final move of the game.
* **`H` or `h` key:** Toggles the Keyboard Shortcuts help modal.
* **`Tab` Navigation:** Follows a logical flow: Input Area $\rightarrow$ Analyze Button $\rightarrow$ Board Controls $\rightarrow$ Export Button $\rightarrow$ StatusBar.

### B. Contrast Ratios & Semantic HTML
* All text styles must meet a minimum contrast ratio of `4.5:1` against their background.
* Text buttons must use `<button>` elements with distinct hover and focus rings (`focus:ring-2`).
* Chessboard coordinates must be visible and scale with board size.

### C. Screen Reader ARIA Attributes
* **Chessboard:** The container has `aria-label="Chessboard"` and `role="application"`. Squares contain labels detailing their coordinate and piece state (e.g. `aria-label="e4 square containing White Pawn"`).
* **Move List:** Selected moves use `aria-current="step"`, indicating to screen readers which ply is currently loaded on the board.
* **Classification Badges:** Badges include hidden screen-reader-only labels (e.g. `<span className="sr-only">Blunder: evaluation dropped 2.5 centipawns</span>`).

---

## 4. Responsive Breakpoints

We use Tailwind's responsive grid system to stack panels dynamically on smaller viewports.

* **Mobile ($< 768\text{ px}$):**
  * Stacks all elements vertically in a single column.
  * Order: Board $\rightarrow$ Controls $\rightarrow$ Engine Panel $\rightarrow$ Evaluation Graph $\rightarrow$ Move List.
  * Graph height is compressed to $120\text{ px}$ to fit within portrait screens.
* **Tablet ($768\text{ px} \le \text{width} < 1024\text{ px}$):**
  * Left Column: Chessboard + Board Controls.
  * Right Column: Move List + Engine Panel.
  * Bottom Row: Evaluation Graph (span 2 columns).
* **Desktop ($\ge 1024\text{ px}$):**
  * Split screen layout using custom grid heights (`grid-rows-[1fr_auto]`).
  * Layout remains fixed within the viewport height (`h-screen`) to prevent global window scrolling, ensuring the board stays fully visible at all times.

---

## 5. Design System Tokens (Tailwind Theme Integration)

### A. Core Slate Color System
```json
{
  "background": "hsl(224, 71%, 4%)",       // Sleek dark space
  "foreground": "hsl(210, 40%, 98%)",      // Crisp text
  "card": "hsl(222, 47%, 7%)",             // Raised panels
  "border": "hsl(217, 32%, 17%)",          // Subtle dividers
  "primary": "hsl(263, 70%, 50%)",         // Regal violet accent
  "primary-foreground": "hsl(210, 40%, 98%)"
}
```

### B. Move Classification Tokens
Move classifications use high-contrast HSL values to remain readable in both light and dark modes.

| Classification | HSL Token | Hex Code | Meaning / Criteria |
| :--- | :--- | :--- | :--- |
| **Book** | `hsl(190, 90%, 40%)` | `#0ea5e9` | Matches opening theory. |
| **Best** | `hsl(142, 70%, 45%)` | `#22c55e` | Matches engine's top-recommended move. |
| **Excellent** | `hsl(142, 50%, 60%)` | `#86efac` | Centipawn loss is $\le 20\text{ cp}$. |
| **Good** | `hsl(217, 90%, 60%)` | `#3b82f6` | Centipawn loss is between $21\text{ cp}$ and $50\text{ cp}$. |
| **Inaccuracy** | `hsl(45, 90%, 45%)` | `#eab308` | Centipawn loss is between $51\text{ cp}$ and $100\text{ cp}$. |
| **Mistake** | `hsl(25, 90%, 50%)` | `#f97316` | Centipawn loss is between $101\text{ cp}$ and $200\text{ cp}$. |
| **Blunder** | `hsl(0, 85%, 50%)` | `#ef4444` | Centipawn loss is $> 200\text{ cp}$. |
| **Forced** | `hsl(215, 15%, 50%)` | `#64748b` | The only legal move available. |

---

**End of UI Design & Design System Tokens**
