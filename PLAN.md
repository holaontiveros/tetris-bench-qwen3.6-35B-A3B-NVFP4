## Goal

Build a complete, playable browser game called "Falling Fusion" that merges Tetromino row-clearing with blob-pair color-matching. The game must be fully testable from TypeScript (no browser required for unit tests), use deterministic RNG, and pass all specified verification gates.

## Architecture

```
┌─────────────────────────────────────────────┐
│              Browser (Vite)                  │
│                                              │
│  ┌──────────┐    ┌──────────┐    ┌────────┐ │
│  │ Keyboard │───▶│  Game    │    │ Canvas │ │
│  │ Input    │    │  Controller│  │Renderer│ │
│  └──────────┘    └──────────┘    └────────┘ │
│                         │                    │
│                  ┌──────┴─────────┐          │
│                  │  Game Engine    │          │
│                  │  (browser-free) │          │
│                  └────────────────┘          │
│                 /      |       \             │
│          ┌──────┐ ┌──────┐ ┌────────┐       │
│          │ Board │ │Pieces│ │  RNG   │       │
│          │  Rules│ │  Defs │ │ (7-bag)│       │
│          └──────┘ └──────┘ └────────┘       │
│                         │                    │
│                  ┌──────┴─────────┐          │
│                  │  Game State     │          │
│                  │  (plain TS)     │          │
│                  └────────────────┘          │
└─────────────────────────────────────────────┘
```

**Separation of concerns:**
- **Engine** (`src/engine/`): Pure TypeScript. No DOM, no Canvas, no browser APIs. Handles all game rules, state transitions, collision, clearing, gravity, chains, scoring.
- **Input** (`src/input/`): Maps keyboard events to engine actions. The only browser dependency for the game flow.
- **Renderer** (`src/rendering/`): Converts GameState to Canvas pixels. Stateless from engine state.
- **Controller** (`src/app/`): Wires engine, input, renderer, and timing loop together. Owns the `requestAnimationFrame` loop and gravity timer.
- **Tests** (`tests/`): Pure TS tests against engine only.
- **E2E** (`e2e/`): Playwright tests against the running browser app.

**Technology choices:**
- Vanilla TypeScript (no UI framework needed for this scope)
- Canvas rendering (cleaner separation from state, lower overhead)
- Vite for bundling and dev server
- Vitest for unit/integration tests
- Playwright for E2E tests

## Data Model

**Cell:**
- `type: 'empty' | 'solid' | 'blob'`
- `color?: BlobColor` — only when type === 'blob'

**Board:**
- `Cell[][]` — 22 rows (rows 0-1 hidden spawn, rows 2-21 visible 20-row playfield) × 10 columns
- `(0,0)` = top-left, X right, Y down

**Tetromino:**
- 7 shapes: I, O, T, S, Z, J, L
- Defined as cell offsets from a pivot
- 4 rotation states each

**BlobPair:**
- 2 adjacent cells, each with independent color
- Falls as one unit
- Rotation: second cell orbits first

**GameState:**
- board, activePiece, nextQueue (≥3 pieces), score, level, piecesLocked, status, chainCount

## Game Loop

1. **Timing**: Frame-rate-independent. Track `lastDropTime` delta. When `delta >= fallInterval`, attempt gravity step.
2. **Input**: Keyboard events map to engine actions. Soft-hold with delay.
3. **Render**: Every `requestAnimationFrame`, read GameState and paint Canvas.
4. **Flow**: Piece lock → Board resolution (row clear → blob groups → gravity → chains) → Spawn next piece.

## Implementation Phases

| Phase | Work | Verification |
|-------|------|--------------|
| 1 | Project init: package.json, tsconfig, vite, directory structure | `npm run typecheck` on empty src |
| 2 | Core types + Board (creation, placement, bounds) | Unit tests for board ops |
| 3 | Tetromino definitions (7 shapes, rotations) | Tests: each shape, O-invariance, wall correction |
| 4 | Blob pair definitions (2-cell, 4 colors) + rotation | Tests: creation, CW/CCW rotation, collision |
| 5 | Seeded PRNG + 7-bag randomizer | Tests: determinism, bag contains all 7 types |
| 6 | Piece sequence generator (T,T,B repeating) + preview queue | Tests: same seed → same sequence |
| 7 | Game engine: movement, collision | Tests: all movements, wall/floor/occupied collision |
| 8 | Piece locking + board placement | Tests: lock places cells, active piece clears |
| 9 | Row detection and clearing | Tests: 0/1/multiple/both-types row clears |
| 10 | Blob group detection (Flood fill) | Tests: group of 3, 4, >4, diagonal, multi-group |
| 11 | Gravity (unsupported cells fall) | Tests: falls, stays, separated cells |
| 12 | Chain detection loop + scoring | Tests: explicit chain scenario, scoring |
| 13 | Difficulty progression (level/interval) | Tests: level increases, interval decreases |
| 14 | Game state: pause, resume, restart, game over | Tests: state transitions, reproducibility |
| 15 | Scoring module | Tests: all scoring rules |
| 16 | Input handler | Integration via E2E |
| 17 | Canvas renderer | Manual: all UI elements visible |
| 18 | Controller (wiring) | No timer leaks on restart |
| 19 | Invariant tests (1000+ sim games) | Invariants hold |
| 20 | E2E tests (Playwright) | `npm run test:e2e` passes |
| 21 | Accessibility + responsive | Manual tests |
| 22 | Documentation | Readability |
| 23 | Full verification | All pass |
| 24 | BENCHMARK_RESULT.md | Factual results |

## Testing Strategy

**Unit tests (Vitest, browser-free):**
- Engine: Board, Tetrominoes, BlobPair, PRNG, Sequence, Row Clear, Blob Groups, Gravity, Chains, Scoring, Game State
- Invariant tests: 1000+ simulated games with seeded RNG

**E2E tests (Playwright):**
- Startup, movement, hard drop, pause, restart, deterministic scenario

**Coverage targets:**
- Core engine: ≥ 80% line coverage
- Entire source: ≥ 70% line coverage

## Risks

1. **Gravity + blob interaction**: Tetromino cells break apart after blob clears; gravity must handle independent cells.
2. **Chain reaction correctness**: Phase 4 iterates detect→clear→gravity→repeat. Off-by-one errors cause wrong scores.
3. **Collision after row clear**: Active piece above cleared row must re-check collision with compacted board.
4. **Blob pair rotation**: Coordinate math for two-cell rotation around pivot; edge cases at board edges.
5. **Timing consistency**: Gravity timer, input handler, render loop must not conflict. Restart must clean up all timers.

## Definition of Done

- [ ] All gameplay mechanics work (movement, rotation, lock, row clear, blob match, gravity, chains, scoring, level, pause, restart, game over)
- [ ] `npm run typecheck` passes (TypeScript strict)
- [ ] `npm run test` passes (all unit/integration tests)
- [ ] `npm run test:coverage` meets targets (engine ≥ 80%, source ≥ 70%)
- [ ] `npm run build` succeeds
- [ ] `npm run test:e2e` passes
- [ ] Manually playable in browser
- [ ] No console errors
- [ ] No timer/listener leaks
- [ ] Deterministic: same seed + inputs → same outputs
- [ ] README.md, docs/ARCHITECTURE.md, docs/DECISIONS.md present
- [ ] BENCHMARK_RESULT.md with factual results

## Requirement Traceability

| Requirement area | Planned module | Planned verification |
|------------------|----------------|----------------------|
| Board (10×20+2 spawn) | src/engine/board.ts | tests/engine/board.test.ts |
| Cell types (empty/solid/blob) | src/engine/types.ts | tests/engine/types.test.ts |
| Tetrominoes (7 shapes) | src/engine/pieces/tetromino.ts | tests/engine/tetromino.test.ts |
| Blob pairs (2-cell, 4 colors) | src/engine/pieces/blobPair.ts | tests/engine/blobPair.test.ts |
| Seeded PRNG + 7-bag | src/engine/random/prng.ts | tests/engine/prng.test.ts |
| Piece sequence (T,T,B) | src/engine/random/sequence.ts | tests/engine/sequence.test.ts |
| Movement & collision | src/engine/engine.ts | tests/engine/engine.test.ts |
| Piece locking | src/engine/engine.ts | tests/engine/engine.test.ts |
| Row clearing | src/engine/rules/boardResolution.ts | tests/engine/boardResolution.test.ts |
| Blob group detection | src/engine/rules/boardResolution.ts | tests/engine/boardResolution.test.ts |
| Gravity | src/engine/rules/boardResolution.ts | tests/engine/boardResolution.test.ts |
| Chain reactions | src/engine/rules/boardResolution.ts | tests/engine/boardResolution.test.ts |
| Scoring | src/engine/rules/scoring.ts | tests/engine/scoring.test.ts |
| Difficulty progression | src/engine/rules/difficulty.ts | tests/engine/difficulty.test.ts |
| Game state (pause/restart/over) | src/engine/engine.ts | tests/engine/engine.test.ts |
| Input handling | src/input/keyboard.ts | e2e/game.spec.ts |
| Canvas rendering | src/rendering/renderer.ts | Manual + e2e |
| Controller + timing | src/app/controller.ts | Manual + e2e |
| Invariant tests | tests/engine/invariants.test.ts | tests/engine/invariants.test.ts |
| Accessibility | src/app/index.html, CSS | e2e + manual |
| Responsive | CSS | Manual |
