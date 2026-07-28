# State Management Specification: CheckMate Analyze (v1.0.1)

This specification documents the state architecture, state transitions, and in-memory game branching mechanics of CheckMate Analyze.

---

## 1. Architectural Model: Linear Array Trees

While chess games are naturally represented as hierarchical trees of moves (variations), CheckMate Analyze models this structure in-memory using **flat array histories**. This design simplifies serialization, optimizes rendering lookup complexity to $O(1)$ by index, and fits cleanly within a unidirectional React Context reducer.

```
                    [ STARTING POSITION (FEN) ]  activeMoveIndex = -1
                                 |
                                 v
                            [ Move 1. e4 ]               index = 0
                                 |
                                 v
                            [ Move 1... e5 ]             index = 1  <-- Sandbox Anchor
                                 |
           +---------------------+---------------------+
           | (Main Game timeline)                      | (Sandbox variation)
           v                                           v
      [ Move 2. Nf3 ]  index = 2                  [ Move 2. f4 ]  sandboxActiveIndex = 2
           |                                           |
           v                                           v
      [ Move 2... Nc6 ] index = 3                 [ Move 2... exf4 ] sandboxActiveIndex = 3
```

### Data Structures & Attributes (`src/types/state.ts`):
* **`moves` Array:** Stored as `MoveEntry[]`. Represents the primary chronological sequence of the imported PGN game.
* **`sandboxMoves` Array:** Stored as `MoveEntry[]`. Holds the active deviation timeline when the user is in sandbox exploration mode.
* **`activeMoveIndex`:** Pointer to the selected move in the primary game list. Index `-1` represents the starting board configuration.
* **`sandboxActiveIndex`:** Pointer to the selected move in the sandbox variation.
* **`isSandbox`:** Boolean flag toggling the active workbench context.

---

## 2. State Reducer Lifecycle & Transitions

The application state is modified exclusively through the `workbenchReducer` in `src/context/reducer.ts`. 

```
                                    +--------------------+
                                    |    INITIAL STATE   |
                                    +---------+----------+
                                              |
                                              | 'LOAD_GAME'
                                              v
                                    +--------------------+
                                    |    GAME LOADED     |
                                    +----+----------+----+
                                         |          ^
                            'SELECT_MOVE'|          | 'EXIT_SANDBOX'
                                         v          |
  +--------------------+  'ENTER_SANDBOX'+----------+----------+
  |  SANDBOX ACTIVE    |<----------------+   REVIEWING GAME    |
  +---------+----------+                 +---------------------+
            |
            | 'PLAY_SANDBOX_MOVE'
            v
  +--------------------+
  |  SANDBOX APPENDED  |
  +--------------------+
```

### Action Dispatch Rules:
* **`LOAD_GAME`:** Resets the workspace. Sets `moves` to the new PGN moves, sets `activeMoveIndex = -1`, clears the sandbox, and updates the game headers.
* **`SELECT_MOVE`:** Alters navigation focus. If `isSandbox === true`, updates `sandboxActiveIndex = payload`. Otherwise, updates `activeMoveIndex = payload`.
* **`UPDATE_EVAL`:** Commits calculated engine evaluation and classification badges. If `isSandbox` is active, it maps the evaluation to the matching index in `sandboxMoves`. Otherwise, it maps it to `moves`.
* **`ENTER_SANDBOX`:** Clones the game history up to `activeMoveIndex` and appends the deviation move as the first element of `sandboxMoves`. Sets `isSandbox = true`.
* **`PLAY_SANDBOX_MOVE`:** Appends subsequent moves to the sandbox variation history.
* **`EXIT_SANDBOX`:** Clears `sandboxMoves`, resets `sandboxActiveIndex = -1`, and sets `isSandbox = false`.

---

## 3. Immutability Policy & Allocation Strategy

To guarantee that components re-render correctly and prevent reference sharing bugs, the system enforces **strict immutability rules**:

1. **No Direct Mutation:** State properties must never be modified in place. The reducer must return a brand new state object (`return { ...state, property: value }`).
2. **Array Cloning:** Array updates must copy the array using map or slice operators:
   ```typescript
   // Correct array value update
   const updatedMoves = state.moves.map((m, i) =>
     i === index ? { ...m, evaluation } : m
   );
   ```
3. **No Circular References:** `MoveEntry` objects store clean primitive types (numbers, strings) and standard evaluation objects. They never store direct references to board DOM nodes or `chess.js` engine instances, making state fully serializable.

---

## 4. Sandbox Branching & History Slicing Mechanics

When playing alternative moves, the user can navigate backward *within* the sandbox and branch off again. The system handles this using **History Slicing**:

### Slicing Logic (`PLAY_SANDBOX_MOVE`):
When a user is at a move index $K$ in the sandbox and plays a new move:
1. The reducer slices the sandbox array up to index $K$: `sandboxMoves.slice(0, sandboxActiveIndex + 1)`. This throws away any moves played after the current selection.
2. The new move is appended at index $K+1$.
3. `sandboxActiveIndex` is updated to $K+1$.

```typescript
case 'PLAY_SANDBOX_MOVE': {
  // 1. Slice off any sandbox moves that occur after the current navigation index
  const slicedMoves = state.sandboxMoves.slice(0, state.sandboxActiveIndex + 1);
  const newMove = {
    ...action.payload,
    ply: slicedMoves.length + 1, // Calculate correct ply index
  };
  // 2. Append new move to sliced timeline
  const nextMoves = [...slicedMoves, newMove];
  return {
    ...state,
    sandboxMoves: nextMoves,
    sandboxActiveIndex: nextMoves.length - 1, // Shift pointer to end
  };
}
```

### Rationale:
This slicing approach mimics Git branching behavior: navigating back in history moves the HEAD pointer, and making a new commit (playing a move) branches the timeline, discarding the previously explored path.

---

**End of State Management Specification**
