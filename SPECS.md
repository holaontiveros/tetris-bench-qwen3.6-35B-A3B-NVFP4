# Local Coding Model Benchmark
## Browser-Based Hybrid Falling-Block Puzzle Game

## 1. Purpose

Build a small but complete browser game inspired by the core mechanics of falling-block puzzle games such as Tetris and Puyo Puyo.

The purpose of this project is not to create a commercial-quality game. It is a benchmark for evaluating an autonomous coding model's ability to:

- Analyze a specification.
- Create a reasonable implementation plan before coding.
- Make architectural decisions.
- Implement non-trivial game logic.
- Keep presentation separated from domain logic.
- Produce human-readable and maintainable code.
- Write meaningful automated tests.
- Debug its own implementation.
- Run and verify the application.
- Measure the result against explicit acceptance criteria.
- Document assumptions and decisions.
- Work autonomously without unnecessary human intervention.
- Leave the project in a state another developer could continue extending.

The model should complete the project from beginning to end without requesting clarification unless an actual technical limitation makes completion impossible.

---

# 2. High-Level Objective

Create a single-player browser-based falling-block puzzle game called:

**Falling Fusion**

Do not use copyrighted names, artwork, sound effects, logos, sprites, or other assets from Tetris, Puyo Puyo, or any commercial game.

The game should combine two types of falling pieces:

1. **Tetromino-style pieces**
2. **Colored blob pairs**

The two piece types share the same board.

Tetromino-style pieces primarily clear complete horizontal rows.

Colored blobs clear when four or more blobs of the same color form an orthogonally connected group.

The resulting game should demonstrate both major gameplay systems without attempting to reproduce every rule of any existing game.

---

# 3. Mandatory Technology

Use:

- TypeScript
- Vite
- Modern browser APIs
- Vitest for unit/integration tests
- Playwright for browser/end-to-end tests

The UI framework is optional.

Acceptable approaches include:

- Vanilla TypeScript
- React
- Preact
- Vue
- Another lightweight browser framework

However:

**The core game engine MUST NOT depend on the UI framework or browser DOM.**

The game engine should be testable entirely from TypeScript without launching a browser.

Do not use a full game engine such as:

- Phaser
- Unity
- Godot
- Pixi-based game frameworks

Lightweight utility libraries are acceptable when justified.

---

# 4. Autonomous Execution Requirement

The model should execute the entire task autonomously.

Do not stop after creating an outline.

Do not stop after generating source files.

Do not ask the user which architecture to choose when the specification already provides enough information to make a reasonable decision.

When something is unspecified:

1. Choose a sensible default.
2. Record the assumption.
3. Continue.

The model should only ask the user a question when proceeding would otherwise be impossible.

---

# 5. Planning Requirement

Planning is a required part of the benchmark.

## Before implementing application code

Create:

`PLAN.md`

The plan MUST exist before substantial implementation begins.

The plan should contain:

### Goal

A short description of the finished product.

### Architecture

Describe the proposed separation between:

- Game state
- Rules
- Piece generation
- Collision detection
- Board resolution
- Input
- Timing
- Rendering
- Browser application
- Tests

### Data model

Describe how the board and pieces will be represented.

### Game loop

Describe how:

- Time progresses.
- Falling occurs.
- Input is processed.
- Pieces lock.
- Board resolution occurs.
- Rendering occurs.

### Implementation phases

For example:

1. Project initialization
2. Core board representation
3. Piece definitions
4. Collision and movement
5. Locking
6. Row clearing
7. Blob clearing
8. Gravity and chains
9. Scoring
10. Browser rendering
11. Controls
12. Tests
13. E2E tests
14. Performance verification
15. Documentation

### Testing strategy

Identify what should be unit-tested versus browser-tested.

### Risks

Identify at least three areas likely to contain bugs.

Examples:

- Rotation near walls.
- Chain reactions.
- Collision after board compaction.
- Piece spawning.
- Timing behavior.
- Deterministic randomness.

### Definition of done

List objective criteria that indicate the project is complete.

Once `PLAN.md` exists, continue implementing the project without waiting for approval.

---

# 6. Game Board

Use a board with:

- Width: **10 cells**
- Visible height: **20 cells**
- Hidden spawn area: **2 additional rows**

Internally the board may therefore contain 22 rows.

The player should only see the normal 20-row playfield.

The coordinate system must be clearly documented.

Recommended convention:

- `(0, 0)` is the top-left cell.
- X increases to the right.
- Y increases downward.

---

# 7. Cell Types

A board cell can be:

### Empty

No object occupies the cell.

### Solid block

A cell originating from a tetromino-style piece.

### Blob

A colored cell originating from a blob pair.

A blob must have a color identity.

Use exactly four gameplay colors.

The exact visual colors are up to the implementation.

The rules engine should not depend on CSS color values.

For example, the engine might use:

```text
red
blue
green
yellow
```

or enum values.

---

# 8. Tetromino-Style Pieces

Implement the seven standard four-cell geometric piece configurations:

- I
- O
- T
- S
- Z
- J
- L

They must be implemented from geometric definitions created for this project rather than copied game assets.

Tetromino pieces should:

- Spawn near the horizontal center.
- Fall automatically.
- Move left and right.
- Soft drop.
- Hard drop.
- Rotate clockwise.
- Rotate counterclockwise.
- Lock when they can no longer descend.

Perfect recreation of an official commercial rotation system is NOT required.

However, rotation should behave sensibly.

At minimum, basic wall correction should be attempted when a rotation would otherwise collide with the left or right wall.

A giant implementation of an official wall-kick specification is unnecessary.

---

# 9. Blob Pieces

Blob pieces consist of exactly two adjacent blobs.

Each blob independently receives one of the four available colors.

The pair falls as one piece.

The pair should support:

- Move left
- Move right
- Soft drop
- Hard drop
- Clockwise rotation
- Counterclockwise rotation

The second blob rotates around the first blob.

When the pair locks, both blobs become independent board cells.

After locking, unsupported blobs should fall according to the board gravity rules described later.

---

# 10. Piece Sequence

Gameplay must include both piece systems.

Use the repeating sequence:

```text
Tetromino
Tetromino
Blob Pair
```

Then repeat.

For example:

```text
T
T
P
T
T
P
T
T
P
...
```

This sequence should be part of the rule configuration rather than deeply hard-coded into rendering code.

---

# 11. Randomness

Game randomness MUST be deterministic when given a seed.

Implement an injectable or encapsulated pseudo-random number generator.

Do not scatter direct calls to:

```text
Math.random()
```

throughout the game engine.

The following should be reproducible from a seed:

- Tetromino order
- Blob colors

Tetrominoes should use a **7-bag randomizer**.

Each bag must contain exactly one of each tetromino type before the next bag begins.

The normal game may generate a random seed on startup.

Tests must use explicit seeds.

A URL mechanism such as this is encouraged:

```text
?seed=12345
```

but is not strictly required.

---

# 12. Piece Preview

Display at least the next **3 pieces**.

The preview must distinguish between:

- Tetromino pieces
- Blob pairs

The preview system should derive from the actual piece queue rather than using a separately generated sequence.

---

# 13. Movement

The active piece must support:

### Move left

Suggested control:

`ArrowLeft`

### Move right

Suggested control:

`ArrowRight`

### Soft drop

Suggested control:

`ArrowDown`

### Hard drop

Suggested control:

`Space`

### Rotate clockwise

Suggested control:

`ArrowUp` or `X`

### Rotate counterclockwise

Suggested control:

`Z`

### Pause

Suggested control:

`P`

### Restart

Suggested control:

`R`

Alternative controls may be added but these controls should work.

---

# 14. Automatic Falling

Pieces fall automatically.

The game should not use rendering frame rate as the direct falling speed.

Use elapsed time or a fixed simulation step.

The game must behave approximately the same at different rendering frame rates.

Do not implement gameplay as:

```text
one cell downward every requestAnimationFrame()
```

---

# 15. Locking

If a falling piece cannot move downward any further, it eventually locks into the board.

A small lock delay is preferred but not mandatory.

Hard drop should lock immediately.

Once locked:

1. Add the piece cells to the board.
2. Run board resolution.
3. Update scoring.
4. Spawn the next piece.

---

# 16. Board Resolution

Board resolution is one of the most important parts of the benchmark.

After a piece locks, perform the following steps.

## Phase 1 — Row detection

Find every completely occupied horizontal row.

A cell counts as occupied whether it contains:

- A solid tetromino block
- A blob

Clear all complete rows simultaneously.

Move cells above cleared rows downward.

---

## Phase 2 — Blob group detection

Search the resulting board for connected blob groups.

Connectivity is orthogonal only:

- Up
- Down
- Left
- Right

Diagonal cells do NOT connect.

A group clears when:

```text
size >= 4
```

All qualifying groups discovered during the same resolution phase should clear simultaneously.

Solid blocks never participate in color matching.

---

## Phase 3 — Gravity

After blob groups are removed, apply gravity.

Any unsupported occupied cell should fall vertically until supported by:

- The bottom of the board
- Another occupied cell

This applies to both:

- Blobs
- Solid cells

Once a piece has locked, its individual cells no longer need to remain geometrically connected.

This intentionally allows interesting interactions between the two systems.

---

## Phase 4 — Chain detection

After gravity finishes:

Search for new qualifying blob groups.

If another clear occurs:

1. Clear those groups.
2. Apply gravity again.
3. Search again.

Continue until no qualifying group remains.

Each subsequent blob-clear phase increases the chain count.

---

# 17. Resolution Order

The exact required order is:

```text
Piece locks
↓
Clear complete rows
↓
Compact board
↓
Find matching blob groups
↓
Clear groups
↓
Apply gravity
↓
Find new matching blob groups
↓
Repeat blob clearing/gravity until stable
↓
Spawn next piece
```

A row clear does NOT need to repeat after blob gravity during the same resolution cycle.

This simplification is intentional.

Document this rule.

---

# 18. Scoring

Use the following scoring system.

## Line clears

For one lock event:

| Lines | Points |
|---|---:|
| 1 | 100 |
| 2 | 300 |
| 3 | 500 |
| 4 | 800 |

If more than four lines somehow clear simultaneously, award:

```text
200 × number of lines
```

---

## Blob clearing

For every blob-clear stage:

```text
10 × number_of_blobs × chain_number
```

Chain numbering starts at 1.

Example:

First clear:

```text
4 blobs × 10 × 1 = 40
```

Second chain:

```text
5 blobs × 10 × 2 = 100
```

Third chain:

```text
4 blobs × 10 × 3 = 120
```

---

## Soft drop

Award:

```text
1 point per manually dropped cell
```

---

## Hard drop

Award:

```text
2 points per dropped cell
```

---

# 19. Difficulty Progression

Track the number of pieces that have locked.

Every **10 locked pieces**, increase the game level.

Level begins at:

```text
1
```

Each level should moderately reduce automatic fall interval.

The exact formula is left to the implementation, but:

- It must be documented.
- It must be deterministic.
- The speed must remain playable.
- The interval must have a sensible minimum.

Example acceptable implementation:

```text
fallInterval = max(100ms, 800ms - ((level - 1) * 60ms))
```

The exact formula does not have to match this example.

---

# 20. Game Over

The game ends when a new piece cannot legally spawn.

When game over occurs:

- Automatic falling stops.
- Player movement stops.
- The final score remains visible.
- A clear "Game Over" state is displayed.
- Restart must remain available.

---

# 21. Pause

When paused:

- Gameplay simulation stops.
- Automatic falling stops.
- Movement controls do not modify the game.
- The UI clearly displays that the game is paused.
- Restart may still function.

---

# 22. Restart

Restart should reset:

- Board
- Score
- Level
- Piece counter
- Current piece
- Piece queue
- Chain state
- Game-over state
- Pause state

When using the same explicit seed, restart should reproduce the same starting sequence.

---

# 23. User Interface

The application should visibly display:

- Main board
- Active piece
- Next pieces
- Score
- Level
- Current game state
- Basic controls

The interface should be clean and usable.

Complex artwork is unnecessary.

CSS should be readable.

Do not prioritize visual polish over correctness.

---

# 24. Rendering

The model may choose:

- HTML Canvas
- DOM grid
- SVG

The renderer must remain separate from the game rules.

The game engine should not contain calls such as:

```text
document.querySelector(...)
canvas.getContext(...)
HTMLElement
```

Core game rules should operate on plain TypeScript data structures.

---

# 25. Architecture Requirements

At minimum, the implementation should make clear conceptual distinctions between:

### Game state

Examples:

- Board
- Current piece
- Queue
- Score
- Level
- Status

### Piece definitions

Responsible for:

- Shapes
- Rotation
- Piece cells
- Piece type

### Board logic

Responsible for:

- Collision
- Occupancy
- Locking
- Row detection
- Group detection
- Gravity

### Game rules

Responsible for:

- Score
- Resolution
- Piece progression
- Game-over conditions

### Random generation

Responsible for:

- Seeded randomness
- Tetromino bags
- Blob colors

### Input

Maps keyboard events to game actions.

### Renderer

Converts game state into visible output.

### Application/bootstrap

Connects:

- Engine
- Timing
- Input
- Renderer

The exact file structure is up to the implementation.

---

# 26. Extensibility Requirement

The architecture should make reasonable future additions possible without rewriting the entire engine.

Examples of potential future features:

- Different board dimensions
- Additional blob colors
- Alternate scoring rules
- Different piece sequences
- AI player
- Multiplayer
- Garbage blocks
- Special blocks
- Alternate renderers
- Replay system
- Game recording
- Different randomizers

Do NOT implement all of these.

The architecture should simply avoid making them unnecessarily difficult.

Configuration values should not be scattered throughout unrelated files.

---

# 27. Human Readability

Code quality is explicitly part of the benchmark.

Prefer:

- Clear names
- Small focused functions
- Explicit types
- Understandable state transitions
- Simple algorithms
- Limited nesting
- Limited side effects
- Comments explaining unusual decisions

Avoid:

- Giant functions
- Giant all-purpose classes
- Excessive abstraction
- Clever but unreadable code
- Unexplained numeric constants
- Duplicated game rules
- Unnecessary design patterns
- Massive dependency trees

Comments should primarily explain **why**, not restate obvious code.

---

# 28. TypeScript Quality

Use TypeScript strict mode.

The project should pass:

```text
tsc --noEmit
```

or an equivalent type-check command.

Avoid:

```text
any
```

unless there is a legitimate documented reason.

Avoid:

```text
@ts-ignore
```

If suppression is genuinely necessary, explain why.

---

# 29. Performance Requirements

The game should remain responsive during normal play.

Target:

```text
60 FPS rendering
```

on a normal modern desktop browser.

The implementation should avoid:

- Reconstructing enormous object graphs every frame.
- Repeated DOM creation every frame when unnecessary.
- Unbounded arrays.
- Per-frame console logging.
- Timers that multiply after restarting.
- Event handlers that accumulate after restarting.
- Performing blob-group searches every rendering frame.

Expensive board-resolution operations should occur when necessary, particularly after locking or clearing.

The board is intentionally small, so prefer clean algorithms over premature optimization.

---

# 30. Determinism Requirement

Given:

- The same seed
- The same initial state
- The same sequence of actions

the game engine should produce the same resulting state.

This should be demonstrated by automated tests.

---

# 31. Unit Test Requirements

Use Vitest.

Tests must test actual behavior rather than merely checking that functions exist.

At minimum test all of the following.

## Board

- Empty board creation
- Cell placement
- Bounds checking
- Collision with left wall
- Collision with right wall
- Collision with bottom
- Collision with existing cells

## Tetrominoes

- Every required piece can be generated
- Rotating a piece changes its cells correctly
- O-piece remains geometrically equivalent after rotation
- Pieces cannot illegally rotate through occupied cells
- Basic wall correction works

## Blob pair

- Pair creation
- Clockwise rotation
- Counterclockwise rotation
- Collision
- Locking

## Piece generation

- Same seed produces same sequence
- Different seeds can produce different sequences
- Each tetromino 7-bag contains all seven types exactly once

## Row clearing

Test:

- No complete rows
- One complete row
- Multiple complete rows
- Rows containing both blobs and solid blocks

## Blob groups

Test:

- Group of 3 does not clear
- Group of 4 clears
- Group greater than 4 clears
- Diagonal blobs do not connect
- Multiple separate groups clear simultaneously
- Different colors do not connect

## Gravity

Test:

- Unsupported cell falls
- Supported cell stays
- Multiple cells settle correctly
- Cells separated by cleared blobs fall correctly

## Chains

Create at least one explicit board state where:

1. One blob group clears.
2. Gravity moves cells.
3. A second group forms.
4. The second group clears.

Verify:

```text
chain count == 2
```

and verify scoring.

## Scoring

Test:

- Single line
- Multiple lines
- Blob clear
- Multi-stage chain
- Soft drop
- Hard drop

## Game state

Test:

- Pause
- Resume
- Restart
- Level progression
- Game over
- Piece queue advancement

---

# 32. Invariant Tests

Include tests that exercise multiple generated states and confirm important invariants.

At minimum verify:

- Board dimensions never change unexpectedly.
- Settled cells remain inside board bounds.
- No two settled cells occupy the same location.
- Active piece cells remain valid after successful moves.
- Resolution eventually reaches a stable state.
- A stable board contains no blob group of size 4 or larger immediately after resolution.

These tests may use deterministic loops instead of a dedicated property-testing library.

---

# 33. Test Coverage

Generate coverage.

Target:

### Core game engine

At least:

```text
80% line coverage
```

### Entire source project

At least:

```text
70% line coverage
```

Do not artificially inflate coverage with meaningless tests.

Report actual coverage in the final benchmark report.

---

# 34. End-to-End Browser Tests

Use Playwright.

At minimum provide E2E tests that verify:

### Application startup

- Page loads without crashing.
- Game board is visible.
- Score is visible.

### Player input

- Moving left modifies the active piece position.
- Moving right modifies the active piece position.

### Hard drop

- Hard drop causes the current piece to lock.
- A new piece becomes active.

### Pause

- Pressing pause enters paused state.
- Gameplay does not advance while paused.

### Restart

- Restart resets the score.
- Restart creates a clean board.

### Game state

At least one deterministic browser test should verify a meaningful gameplay transition.

If exposing a test-friendly deterministic seed or debug configuration makes E2E testing cleaner, doing so is encouraged.

Do not make tests rely on arbitrary long sleeps.

Prefer waiting for observable state changes.

---

# 35. Accessibility Basics

Even though this is primarily a game benchmark, include basic accessibility.

At minimum:

- Control instructions must exist as text.
- Important game state must not be communicated only through color.
- Pause and Game Over should have textual indicators.
- Interactive buttons must be keyboard-accessible.
- The page should have sensible semantic structure.

Full screen-reader gameplay support is not required.

---

# 36. Responsive Behavior

The game should remain usable at approximately:

```text
1280 × 720
```

and:

```text
390 × 844
```

The mobile layout may scale the board.

Touch controls are optional and are not required for completion.

---

# 37. Error Handling

Avoid silently swallowing exceptions.

The game should not normally produce console errors.

Restarting repeatedly should not produce:

- Duplicate event listeners
- Multiple game loops
- Multiple timers
- Increasing game speed due to leaked timers

---

# 38. Project Scripts

The project should expose clear package scripts.

At minimum provide equivalents for:

```text
npm run dev
npm run build
npm run test
npm run test:coverage
npm run test:e2e
npm run typecheck
```

Prefer also:

```text
npm run lint
npm run check
```

`npm run check` should preferably execute the primary quality gates.

For example:

```text
typecheck
lint
unit tests
build
```

Running E2E tests as part of `check` is optional because browser installation can make that slower.

---

# 39. Build Requirement

A production build must succeed.

The resulting project must be a static browser application.

No backend should be required.

It should be possible to host the production build on a static host.

---

# 40. Dependency Requirement

Keep dependencies reasonable.

Every major dependency should serve a clear purpose.

Do not add libraries to solve trivial operations that can be expressed clearly in a few lines.

The final report should mention significant runtime dependencies and why they were chosen.

---

# 41. Documentation

Create:

`README.md`

It must include:

## Project description

Explain the game briefly.

## Installation

Exact commands required.

## Development

How to start the browser application.

## Controls

Document all keyboard controls.

## Testing

Explain how to run:

- Unit tests
- Coverage
- E2E tests
- Type checking

## Architecture

Provide a short explanation of the main modules.

## Game rules

Explain:

- Tetromino clearing
- Blob clearing
- Chains
- Resolution order
- Scoring
- Level progression

## Deterministic seeds

Explain how deterministic testing works.

## Extension points

Briefly describe how a developer could add:

- Another piece type
- Another renderer
- A different rule configuration

---

# 42. Architecture Documentation

Create:

`docs/ARCHITECTURE.md`

It should describe the final architecture after implementation.

Include a simple text diagram such as:

```text
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

The actual architecture may differ.

Explain important design decisions and trade-offs.

---

# 43. Model Decision Log

Create:

`docs/DECISIONS.md`

Record significant decisions made autonomously.

Examples:

```text
Decision:
Use Canvas rather than a DOM grid.

Reason:
Lower rendering overhead and cleaner separation from board state.

Alternative considered:
DOM cells.

Trade-off:
Canvas requires additional accessibility text outside the game surface.
```

Do not record trivial decisions.

Five to ten useful decisions are sufficient.

---

# 44. Benchmark Result Report

At the end of the implementation create:

`BENCHMARK_RESULT.md`

The report must be based on commands that were actually executed.

Do not claim tests pass if they were not executed.

Use this structure.

## Implementation status

```text
Game playable: YES / NO
Production build: PASS / FAIL
Type check: PASS / FAIL
Unit tests: PASS / FAIL
E2E tests: PASS / FAIL
```

## Test results

Include:

```text
Unit tests:
Passed:
Failed:

E2E tests:
Passed:
Failed:
```

## Coverage

Include measured values:

```text
Statements:
Branches:
Functions:
Lines:
```

## Build

Include:

```text
Build command:
Build result:
```

If practical, also include approximate production JavaScript size.

## Features implemented

Use checkboxes.

## Requirements not completed

Explicitly list anything missing.

Do not hide failures.

## Known bugs

List known bugs.

Write:

```text
None known
```

only if the model genuinely found none.

## Architecture summary

Approximately 5–10 sentences.

## Performance notes

Describe:

- Rendering approach
- Game-loop strategy
- Any obvious performance risks discovered

## Significant dependencies

List major dependencies and their purpose.

## Autonomous decisions

Summarize the most important decisions made without user input.

---

# 45. Verification Requirement

Before considering the task complete, the model must actually attempt to run:

```text
npm run typecheck
npm run test
npm run test:coverage
npm run build
npm run test:e2e
```

If linting is configured, also run:

```text
npm run lint
```

If a command fails:

1. Investigate.
2. Attempt to fix the cause.
3. Run the command again.

Do not simply document an easily fixable failure and stop.

If something genuinely cannot run because of the execution environment, document:

- The command attempted.
- The error.
- Why it appears environment-related.
- What would be required to run it.

---

# 46. Manual Game Verification

In addition to automated tests, the model should inspect or run the application sufficiently to verify that:

- The board appears.
- Pieces visibly fall.
- Keyboard controls respond.
- Tetrominoes lock.
- Blob pairs lock.
- Rows can clear.
- Blob groups can clear.
- Score changes.
- Pause works.
- Restart works.
- Game over can occur.

If browser automation tools are available, use them.

---

# 47. Code Organization

A reasonable example structure would be:

```text
src/
  engine/
    board.ts
    game.ts
    pieces/
    random/
    rules/
    scoring.ts
    types.ts

  input/
    keyboard.ts

  rendering/
    renderer.ts

  app/
    controller.ts

  main.ts

tests/
  engine/
  integration/

e2e/
  game.spec.ts

docs/
  ARCHITECTURE.md
  DECISIONS.md

PLAN.md
README.md
BENCHMARK_RESULT.md
```

This structure is illustrative rather than mandatory.

The model may use a better structure if justified.

---

# 48. Things the Model Should NOT Do

Do not:

- Implement only a visual mockup.
- Implement the entire game in one giant file.
- Put game rules directly inside keyboard handlers.
- Put scoring logic inside rendering code.
- Depend on browser APIs for unit-testable game rules.
- Replace automated tests with manual claims.
- Hard-code a predetermined sequence exclusively for tests.
- Claim commands passed without running them.
- Add multiplayer.
- Add accounts.
- Add a database.
- Add a backend.
- Add advertisements.
- Add analytics.
- Add elaborate animations before core correctness.
- Spend large amounts of implementation time on decorative assets.
- Copy copyrighted game assets.
- Reproduce proprietary source code.

---

# 49. Priority Order

When making trade-offs, use this priority:

1. Correct game mechanics
2. Automated tests
3. Clean architecture
4. Reliable browser execution
5. Human-readable code
6. Determinism
7. Documentation
8. Performance
9. Visual polish
10. Optional features

A simple correct game is better than an attractive broken game.

---

# 50. Optional Enhancements

Only attempt these after every mandatory requirement passes.

Examples:

- Ghost piece
- Hold system
- Sound
- Touch controls
- High score using localStorage
- Animated clears
- Better wall kicks
- Replay recording
- FPS/debug overlay
- Theme selection
- Chain animations

Optional enhancements must not destabilize the required implementation.

---

# 51. Evaluation Rubric

The implementation will be scored out of **100 points**.

## A. Planning — 10 points

### 10
Excellent plan with architecture, phases, risks, tests, and definition of done.

### 7
Useful plan but some sections are shallow.

### 4
Minimal plan created mostly as a formality.

### 0
No plan before implementation.

---

# B. Core Gameplay — 30 points

### Tetromino movement and collision
5 points

### Tetromino rotation
3 points

### Blob pair gameplay
4 points

### Line clearing
4 points

### Blob matching
4 points

### Gravity
3 points

### Chain reactions
3 points

### Scoring
2 points

### Game over / restart / pause
2 points

---

# C. Correctness and Testing — 25 points

### Meaningful unit tests
8 points

### Edge-case coverage
4 points

### Chain-resolution tests
3 points

### Deterministic RNG tests
3 points

### Invariant tests
2 points

### Browser E2E tests
3 points

### Coverage target achieved
2 points

---

# D. Architecture — 15 points

### Engine independent from UI
5 points

### Good module boundaries
4 points

### Extensible rules/data model
3 points

### Limited unnecessary complexity
3 points

---

# E. Code Quality — 8 points

### Human-readable code
3 points

### Strong TypeScript usage
2 points

### Naming and structure
2 points

### Useful comments
1 point

---

# F. Documentation — 5 points

### README
2 points

### Architecture document
1 point

### Decisions document
1 point

### Accurate benchmark report
1 point

---

# G. Performance and Runtime Quality — 5 points

### Frame-rate-independent gameplay
2 points

### No obvious timer/listener leaks
1 point

### Appropriate rendering behavior
1 point

### No unnecessary continuous heavy computation
1 point

---

# H. Autonomous Execution — 2 points

### 2
Completes the assignment, makes sensible decisions, verifies its work, and does not unnecessarily ask the user for guidance.

### 1
Mostly autonomous but requires avoidable intervention.

### 0
Stops prematurely or repeatedly asks the user to make implementation decisions.

---

# 52. Automatic Score Caps

Regardless of other quality, apply these score caps.

## Application does not build

Maximum score:

```text
60
```

## Application builds but game is not meaningfully playable

Maximum score:

```text
50
```

## No automated tests

Maximum score:

```text
45
```

## Core engine cannot be tested independently from the browser

Maximum score:

```text
70
```

## No PLAN.md created before implementation

Maximum score:

```text
90
```

## Test results are fabricated or claimed without execution

Maximum score:

```text
30
```

---

# 53. Comparison Metrics

When comparing multiple models, record the following separately from the 100-point quality score.

```text
Model:
Quantization:
Context size:
Hardware:
Prompt tokens:
Completion tokens:
Wall-clock execution time:
Number of tool calls:
Number of shell commands:
Number of failed commands:
Number of self-corrected failures:
Number of times human intervention was requested:
Final project size:
Runtime dependencies:
Dev dependencies:
Unit test count:
E2E test count:
Coverage:
Production JS size:
```

If the model exposes reasoning-effort or tool-call statistics, those may also be recorded.

Do not reward a model purely for producing more files, more code, or more tests.

---

# 54. Behavioral Observations

The evaluator should also note qualitative behavior.

Examples:

### Planning discipline

Did the model actually use its plan, or merely create one and ignore it?

### Error recovery

When a command failed, did it investigate intelligently?

### Test quality

Did tests catch meaningful failures or merely exercise getters and constructors?

### Architecture discipline

Did the model preserve separation between engine and presentation?

### Scope control

Did it complete core requirements before adding unnecessary features?

### Code comprehension

Could a human developer reasonably understand and modify the result?

### Honesty

Did the model accurately report failures and limitations?

### Initiative

Did the model verify things that were not explicitly spelled out but obviously mattered?

---

# 55. Important Benchmark Principle

Do not optimize solely for satisfying individual checklist items.

The project should feel like a coherent small software project created by a competent developer.

The benchmark is intended to reveal differences in:

- Reasoning
- Planning
- Implementation ability
- Debugging
- Architecture
- Testing discipline
- Autonomous behavior
- Attention to requirements
- Software engineering judgment

A smaller elegant implementation that completely satisfies the requirements should score higher than a large complicated implementation with more features but weaker correctness.

---

# 56. Completion Instruction

Proceed autonomously from planning through implementation and verification.

Your workflow should be approximately:

```text
Read specification
↓
Inspect environment
↓
Create PLAN.md
↓
Initialize project
↓
Implement game engine
↓
Write and run engine tests
↓
Implement browser UI
↓
Implement browser controls
↓
Write and run E2E tests
↓
Run type checking
↓
Run coverage
↓
Run production build
↓
Inspect the application
↓
Fix discovered problems
↓
Create/update documentation
↓
Create BENCHMARK_RESULT.md
↓
Provide final summary
```

Do not wait for user approval between these phases.

The final response should be concise and contain:

1. What was implemented.
2. Test/build status.
3. Coverage.
4. Important architectural decisions.
5. Known limitations.
6. Exact command to start the game.
7. Location of `BENCHMARK_RESULT.md`.

The project is not considered complete merely because source code has been generated.

It is complete when the implementation has been **built, tested, verified, and documented** to the greatest extent supported by the execution environment.