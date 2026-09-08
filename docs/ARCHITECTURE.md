# Architecture Document

## Overview

Falling Fusion is a hybrid falling-block puzzle game with a clean separation between game logic (browser-independent engine) and presentation (Canvas rendering + keyboard input).

```
Browser Input
      │
      ▼
Game Controller
      │
      ▼
Game Engine
  ┌───┼─────────────┐
  ▼   ▼             ▼
Board Rules     Pieces        RNG
      │
      ▼
Game State
      │
      ▼
Renderer
```

## Module Breakdown

### Engine Layer (`src/engine/`)

The engine is a pure TypeScript state machine. It knows nothing about browsers, DOM, or rendering.

**Types (`types.ts`)**
- Defines all shared types: `Cell`, `Board`, `ActivePiece`, `GameState`, etc.
- Constants: board dimensions, scoring values, difficulty parameters
- This file has zero dependencies on other engine modules

**Board (`board.ts`)**
- `createEmptyBoard()` — 22×10 array of empty cells
- `wouldCollide()` — Check if piece cells overlap board boundaries or existing cells
- `getFullRows()` — Find rows that are completely filled
- `getPieceCells()` — Convert relative piece offsets to board positions
- `rotateCW()` / `rotateCCW()` — Position rotation utilities

**Engine (`engine.ts`)**
- `createGame()` — Initialize game state with PRNG and piece queue
- Movement: `moveLeft()`, `moveRight()`, `softDrop()`, `gravityStep()`, `hardDrop()`
- Rotation: `rotateCW()`, `rotateCCW()` with wall kick
- `lockPiece()` — Place piece on board → resolve → spawn next
- `resolveBoard()` — Row clear → blob groups → gravity → chains
- State management: `pauseGame()`, `resumeGame()`, `restartGame()`
- Scoring helpers: `calculateLineScore()`, `calculateBlobScore()`

**Pieces**
- `tetromino.ts` — 7 shapes as cell offset arrays, rotation via cumulative 90° transforms
- `blobPair.ts` — Two colored blobs, rotation via coordinate transform

**Random**
- `prng.ts` — Mulberry32 PRNG, deterministic from integer seed
- `sequence.ts` — 7-bag randomizer with T,T,B sequence pattern

### Input Layer (`src/input/`)

`keyboard.ts` — Maps key codes to `InputAction` enum. Handles soft-hold repeat with configurable delay. No knowledge of engine internals, just calls the appropriate engine function.

### Rendering Layer (`src/rendering/`)

`renderer.ts` — `createRenderer()` returns a `Renderer` with:
- `render(state: GameState)` — Paints board, pieces, sidebar (score/level/next), and status text to Canvas
- Supports active piece, ghost piece (landing preview), and blob color rendering

### Controller Layer (`src/app/`)

`controller.ts` — `createController()` wires everything together:
- Creates engine, renderer, input handler
- Runs `requestAnimationFrame` game loop
- Applies gravity based on fall interval (frame-rate independent)
- Handles piece locking when gravity can't move piece down
- Properly disposes all resources on cleanup

## State Flow

```
Game State
  ├── board: Cell[][]
  ├── activePiece: TetrominoPiece | BlobPairPiece | null
  ├── nextQueue: (TetrominoPiece | BlobPairPiece)[]  (≥3 pieces)
  ├── score: number
  ├── level: number
  ├── piecesLocked: number
  ├── status: 'playing' | 'paused' | 'gameover'
  ├── chainCount: number
  └── drop tracking: softDropScored, hardDropped, hardDropCells
```

### Resolution Flow

```
Piece locks
  ↓
Place cells on board
  ↓
Phase 1: Row detection → clear full rows → compact board
  ↓
Phase 2: Blob group detection (Flood fill, orthogonal)
  ↓
Phase 3: Clear qualifying groups (size ≥ 4)
  ↓
Phase 4: Apply gravity (unsupported cells fall)
  ↓
Phase 5: Chain detection — repeat phases 2-4 until stable
  ↓
Spawn next piece from queue
  ↓
Check game over (collision at spawn position)
```

## Design Trade-offs

### Canvas vs DOM Grid
**Chosen: Canvas** — Lower rendering overhead, cleaner separation from game state. Trade-off: requires accessibility text outside the canvas.

### Vanilla TS vs Framework
**Chosen: Vanilla TypeScript** — No framework needed for this scope. Keeps dependencies minimal and renderer independent.

### Mutation vs Immutability
**Chosen: Mutation** — The engine mutates `GameState` in place for simplicity. This is fine for a single-threaded game loop and makes the code more readable. An immutable approach would be preferable for features like replay or multiplayer.

### Per-frame vs Event-driven Updates
**Chosen: Hybrid** — Rendering is requestAnimationFrame-driven, but game logic updates happen on a fixed-interval timer (gravity) and event-driven (input). This ensures frame-rate-independent gameplay.

## Extensibility

New features can be added without major refactoring:

1. **New piece type**: Add to `types.ts` `ActivePiece` union, implement in `pieces/`
2. **Different board size**: Modify constants in `types.ts`
3. **Alternate scoring**: Modify `calculateLineScore()` and `calculateBlobScore()`
4. **AI player**: Import engine, implement input handler that calls engine functions
5. **New renderer**: Implement `Renderer` interface (takes `GameState` → renders)
6. **Replay system**: Record input sequences, replay via `createGame(seed)` with deterministic inputs
