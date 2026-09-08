# Falling Fusion

A hybrid falling-block puzzle game inspired by Tetris and Puyo Puyo mechanics.

## Project Description

**Falling Fusion** combines two falling-piece systems on a single board:

- **Tetrominoes** — Seven standard shapes (I, O, T, S, Z, J, L) that clear full horizontal rows.
- **Blob Pairs** — Two colored blobs that clear when 4+ of the same color form an orthogonally connected group.

Pieces fall automatically. The player moves, rotates, and drops them to clear lines and blob groups. Chain reactions occur when gravity causes new blob groups to form after clearing.

## Installation

```bash
npm install
```

## Development

Start the development server:

```bash
npm run dev
```

Open http://localhost:3000 in a browser.

## Controls

| Key | Action |
|-----|--------|
| ← | Move left |
| → | Move right |
| ↓ | Soft drop (1 pt per cell) |
| ↑ or X | Rotate clockwise |
| Z | Rotate counterclockwise |
| Space | Hard drop (2 pts per cell) |
| P | Pause / Resume |
| R | Restart |

## Testing

### Unit Tests

```bash
npm run test
```

### Test Coverage

```bash
npm run test:coverage
```

### End-to-End Tests

```bash
npm run test:e2e
```

### Type Checking

```bash
npm run typecheck
```

### Full Check

```bash
npm run check
```

## Architecture

### Core Modules

- **`src/engine/`** — Pure TypeScript game engine. No browser dependencies.
  - `types.ts` — All shared types (Cell, Board, GameState, etc.)
  - `board.ts` — Board creation, collision detection, cell operations
  - `engine.ts` — Game state management, movement, locking, resolution, scoring
  - `pieces/tetromino.ts` — Tetromino shape definitions and rotation
  - `pieces/blobPair.ts` — Blob pair creation and rotation
  - `random/prng.ts` — Mulberry32 seeded PRNG
  - `random/sequence.ts` — 7-bag piece queue generator
  - `rules/` — (Future: extensible rule configurations)

- **`src/input/keyboard.ts`** — Maps keyboard events to engine actions

- **`src/rendering/renderer.ts`** — Canvas-based rendering of game state

- **`src/app/controller.ts`** — Wires engine, input, renderer, and game loop together

- **`src/main.ts`** — Application entry point

### Key Design Decisions

- The game engine is **completely browser-independent**. All game rules, state, and resolution run on plain TypeScript data structures.
- Canvas rendering provides clean separation: the engine produces `GameState`, the renderer converts it to pixels.
- Seeded PRNG (Mulberry32) ensures deterministic gameplay for testing and replay.
- 7-bag randomizer guarantees fair tetromino distribution.
- Configuration values (fall intervals, scoring constants) are centralized in `types.ts`.

## Game Rules

### Board

- 10 columns × 22 rows (2 hidden spawn rows + 20 visible playfield rows)
- Coordinate system: (0,0) is top-left, X increases right, Y increases down

### Tetrominoes

- 7 shapes: I, O, T, S, Z, J, L
- Each bag contains exactly one of each shape
- Clockwise/counterclockwise rotation with basic wall kick

### Blob Pairs

- Two adjacent blobs with independent colors (red, blue, green, yellow)
- Rotation orbits the second blob around the first

### Resolution Order

After each piece locks:

1. **Row clearing** — Full rows (containing any mix of solid or blob cells) are cleared simultaneously
2. **Blob group detection** — Orthogonally connected groups of 4+ same-color blobs are cleared
3. **Gravity** — Unsupported cells fall vertically
4. **Chain detection** — Repeat steps 2-3 until no more groups qualify

### Scoring

| Action | Points |
|--------|--------|
| 1 line | 100 |
| 2 lines | 300 |
| 3 lines | 500 |
| 4 lines | 800 |
| >4 lines | 200 × lines |
| Blob clear | 10 × blobs × chain_number |
| Soft drop | 1 × cells |
| Hard drop | 2 × cells |

### Level Progression

- Level increases every 10 locked pieces
- Fall interval: `max(100ms, 800ms - (level-1) × 60ms)`

## Deterministic Seeds

Append `?seed=12345` to the URL for reproducible gameplay:

```
http://localhost:3000/?seed=42
```

Same seed → same piece sequence → same outcomes with identical inputs.

## Extension Points

- **New piece types**: Add to `src/engine/types.ts` and `src/engine/pieces/`
- **New renderer**: Implement the `Renderer` interface (same GameState input)
- **Different rules**: Modify resolution logic in `src/engine/engine.ts`
- **AI player**: Import the engine and implement a player that calls engine functions
