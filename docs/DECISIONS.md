# Decision Log

## Decision: Use Canvas for rendering

**Reason:** Lower rendering overhead than DOM-based grid, and cleaner separation between game state and presentation.

**Alternative considered:** DOM grid with `<div>` cells.

**Trade-off:** Canvas requires explicit accessibility text outside the game surface (provided in the HTML). DOM grid would have better inherent screen-reader support but higher rendering cost.

## Decision: Vanilla TypeScript over React/Vue

**Reason:** The game is a single-screen application with no component hierarchy needed. A framework would add unnecessary dependencies and complexity.

**Alternative considered:** React or Preact.

**Trade-off:** Framework would provide state management, but the game's state is a single `GameState` object that can be passed directly to the renderer.

## Decision: Mulberry32 PRNG

**Reason:** Fast, simple, and deterministic. Sufficient quality for game randomness. No need for cryptographically secure RNG.

**Alternative considered:** `Math.random()` (rejected — not deterministic), Xoshiro256** (more complex, overkill).

**Trade-off:** Mulberry32 is not statistically perfect but adequate for gameplay.

## Decision: 7-bag randomizer for tetrominoes

**Reason:** Industry standard (used by Tetris Company games). Ensures no long droughts of specific pieces and guarantees each bag contains all 7 types.

**Alternative considered:** Pure random selection per piece.

**Trade-off:** Pure random can produce 7+ consecutive identical pieces, which feels unfair.

## Decision: 22-row board (2 hidden spawn rows + 20 visible)

**Reason:** Standard Tetris dimensions. Hidden spawn rows allow pieces to "fall in" without being visible.

**Alternative considered:** 20 rows with spawn at the top.

**Trade-off:** Hidden rows complicate collision checking slightly but provide cleaner piece introduction.

## Decision: Rotation via cumulative 90° transforms

**Reason:** Simpler than storing 4 rotation states per piece. Each rotation is `rotCW(prevCells)` or `rotCCW(prevCells)`.

**Alternative considered:** Storing all 4 orientations as precomputed arrays.

**Trade-off:** Precomputed arrays are slightly faster but increase code size. For a 10×22 board with small pieces, the difference is negligible.

## Decision: Blob pair rotation orbits second blob around first

**Reason:** Matches Puyo Puyo's rotation behavior. The pivot (first blob) stays in place, second blob rotates around it.

**Alternative considered:** Both blobs rotate around a midpoint.

**Trade-off:** Midpoint rotation feels less natural for the 2-blob pair.

## Decision: Row clear happens before blob clear

**Reason:** Simplifies the resolution pipeline. Row clear first, then blob groups, then gravity, then chain loop.

**Alternative considered:** Simultaneous row and blob detection.

**Trade-off:** Simultaneous detection is more complex and the spec explicitly defines the order.

## Decision: Gravity applies to both blobs and solid cells

**Reason:** Creates interesting gameplay interactions between the two systems. A tetromino that gets split by blob clearing will have its fragments fall independently.

**Alternative considered:** Gravity only for blobs.

**Trade-off:** Only-blob gravity would make the system feel more disjointed.

## Decision: Ghost piece rendering

**Reason:** Player expectation from modern Tetris games. Shows where the piece will land without affecting gameplay.

**Alternative considered:** No ghost piece.

**Trade-off:** Ghost piece is purely visual polish, not required by the spec, but greatly improves playability.

## Decision: Fall interval formula with 100ms minimum

**Reason:** `max(100ms, 800ms - (level-1) * 60ms)` provides a clear, documented progression from 800ms at level 1 to 100ms at level 14+.

**Alternative considered:** Exponential decay or other formulas.

**Trade-off:** Linear decay is simple, documented, and produces playable speeds.
