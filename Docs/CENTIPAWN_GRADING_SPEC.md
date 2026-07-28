# Centipawn Grading & Move Classification Specification: CheckMate Analyze (v1.0.1)

This specification defines the mathematical formulations, score transformations, mate evaluation normalization, and classification thresholds used to evaluate move quality in CheckMate Analyze.

---

## 1. Score Perspective Normalization

In the chess engine UCI protocol, evaluation scores are reported from the perspective of the **active player** (the player whose turn it is to move).
* A positive score ($+150\text{ cp}$) indicates the active player is winning.
* A negative score ($-80\text{ cp}$) indicates the active player is losing.

To plot evaluations on a single contiguous graph and calculate move deltas consistently, the workbench normalizes all scores to **White's perspective**.

Let $S_{\text{raw}}$ be the evaluation score returned by the engine, and $T \in \{w, b\}$ be the active player's turn (White or Black). The White-perspective score, $S_{\text{white}}$, is defined as:

$$S_{\text{white}} = \begin{cases} 
      S_{\text{raw}} & \text{if } T = w \\
      -S_{\text{raw}} & \text{if } T = b 
   \end{cases}$$

---

## 2. Mathematical Delta Loss Formulations

Move classification is derived from the **Centipawn Loss** (Delta), which measures the difference in position evaluation between the engine's recommended best move and the move actually played.

Let:
* $S_{\text{best}}$ be the engine's evaluation score of the best candidate move in the position.
* $S_{\text{played}}$ be the engine's evaluation score of the move played by the user.
* $T_{\text{active}} \in \{w, b\}$ be the active player who made the move.

The evaluation loss, $\Delta$, is calculated as:

$$\Delta = \begin{cases} 
      S_{\text{best, white}} - S_{\text{played, white}} & \text{if } T_{\text{active}} = w \\
      S_{\text{played, white}} - S_{\text{best, white}} & \text{if } T_{\text{active}} = b 
   \end{cases}$$

To ensure calculations are robust against small engine fluctuations, the final delta is clamped to a minimum of 0:

$$\Delta_{\text{final}} = \max(0, \Delta)$$

---

## 3. Mate Evaluation Transformation Model

Standard centipawn values are insufficient for evaluating forced checkmate positions. A position with a forced mate-in-3 is infinitely better than a position evaluated at $+10.0\text{ pawn units}$. To compare these evaluations mathematically, mate evaluations are mapped into a high-value spectrum using a dimishing penalty model based on distance.

Let:
* $\text{MATE\_VALUE} = 20000$ (representing the baseline mathematical weight of a checkmate).
* $N$ be the number of plies (half-moves) to checkmate.
* $S_{\text{raw}}$ be the engine score ($S_{\text{raw}} > 0$ for winning, $S_{\text{raw}} < 0$ for losing).

The converted numeric value, $V$, is defined as:

$$V = \begin{cases} 
      \text{MATE\_VALUE} - (N \times 100) & \text{if } S_{\text{raw}} > 0 \text{ (Winning Mate)} \\
      -\text{MATE\_VALUE} + (N \times 100) & \text{if } S_{\text{raw}} < 0 \text{ (Losing Mate)} 
   \end{cases}$$

### Rationale:
* **Distance Penalty ($N \times 100$):** A player who is winning wants to checkmate in the fewest moves possible (minimizing $N$). Therefore, a mate-in-1 ($20000 - 100 = 19900$) is graded higher than a mate-in-3 ($20000 - 300 = 19700$).
* **Losing Mate Optimization:** A player who is facing forced mate wants to delay checkmate as long as possible (maximizing $N$). Thus, being mated in 5 moves ($-20000 + 500 = -19500$) is graded higher than being mated in 1 move ($-20000 + 100 = -19900$).

---

## 4. Move Classification Threshold Matrix

Once the centipawn loss delta ($\Delta_{\text{final}}$) is calculated, the move is categorized into one of the following classification states:

```
                  +----------------------------------+
                  |  Calculate Delta (CP Loss)       |
                  +-----------------+----------------+
                                    |
            +-----------------------+-----------------------+
            | isBook?                                       |
            |-- Yes --> [ Book ]                            |
            |                                               |
            | isForced?                                     |
            |-- Yes --> [ Forced ]                          |
            +-----------------------+-----------------------+
                                    | (No)
            +-----------------------v-----------------------+
            |        Delta (CP Loss) Category Ranges        |
            +-----------------------+-----------------------+
                                    |
            |-- Delta = 0 ------------------> [ Best ]      |
            |-- 0 < Delta <= 15 ------------> [ Excellent ] |
            |-- 15 < Delta <= 40 -----------> [ Good ]      |
            |-- 40 < Delta <= 100 ----------> [ Inaccuracy ]|
            |-- 100 < Delta <= 200 ---------> [ Mistake ]   |
            |-- Delta > 200 ----------------> [ Blunder ]   |
```

### Grade Specifications and Thresholds

| Classification | Delta Range ($\Delta_{\text{final}}$) | Hex Color | UI Badge Text | Analysis Meaning |
| :--- | :--- | :--- | :--- | :--- |
| **Book** | N/A (Opening DB match) | `#0ea5e9` | `Book` | Played move is part of established opening theory. |
| **Forced** | N/A (1 legal move) | `#64748b` | `Forced` | The only legal move available in the position. |
| **Best** | $\Delta_{\text{final}} = 0$ | `#22c55e` | `Best` | Matches the engine's top-recommended line. |
| **Excellent** | $0 < \Delta_{\text{final}} \le 15\text{ cp}$ | `#86efac` | `Excellent` | High-quality move; minor evaluation change. |
| **Good** | $15 < \Delta_{\text{final}} \le 40\text{ cp}$ | `#3b82f6` | `Good` | Acceptable move; maintains the balance. |
| **Inaccuracy** | $40 < \Delta_{\text{final}} \le 100\text{ cp}$ | `#eab308` | `Inaccuracy` | Minor positional slip or sub-optimal choice. |
| **Mistake** | $100 < \Delta_{\text{final}} \le 200\text{ cp}$ | `#f97316` | `Mistake` | Positional error; grants opponent an advantage. |
| **Blunder** | $\Delta_{\text{final}} > 200\text{ cp}$ | `#ef4444` | `Blunder` | Severe tactical oversight; loses material or mate. |

---

**End of Centipawn Grading & Move Classification Specification**
