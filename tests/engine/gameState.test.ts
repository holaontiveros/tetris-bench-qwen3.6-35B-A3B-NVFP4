import { describe, it, expect } from 'vitest';
import { createGame, pauseGame, resumeGame, restartGame, type GameEngine } from '../../src/engine/engine';

describe('Pause and resume', () => {
  it('pauses the game', () => {
    const engine = createGame(42);
    expect(pauseGame(engine)).toBe(true);
    expect(engine.state.status).toBe('paused');
  });

  it('cannot pause a paused game', () => {
    const engine = createGame(42);
    pauseGame(engine);
    expect(pauseGame(engine)).toBe(false);
    expect(engine.state.status).toBe('paused');
  });

  it('cannot pause a game over', () => {
    const engine = createGame(42);
    engine.state.status = 'gameover';
    expect(pauseGame(engine)).toBe(false);
  });

  it('resumes a paused game', () => {
    const engine = createGame(42);
    pauseGame(engine);
    expect(resumeGame(engine)).toBe(true);
    expect(engine.state.status).toBe('playing');
  });

  it('cannot resume a playing game', () => {
    const engine = createGame(42);
    expect(resumeGame(engine)).toBe(false);
  });

  it('cannot resume a game over', () => {
    const engine = createGame(42);
    engine.state.status = 'gameover';
    expect(resumeGame(engine)).toBe(false);
  });
});

describe('Restart', () => {
  it('resets the game state', () => {
    const engine = createGame(42);
    // Advance some state
    engine.state.score = 5000;
    engine.state.level = 5;
    engine.state.piecesLocked = 50;
    engine.state.status = 'paused';

    restartGame(engine, 42);

    expect(engine.state.score).toBe(0);
    expect(engine.state.level).toBe(1);
    expect(engine.state.piecesLocked).toBe(0);
    expect(engine.state.status).toBe('playing');
    expect(engine.state.activePiece).not.toBeNull();
    expect(engine.state.nextQueue.length).toBe(3);
  });

  it('restart with same seed produces same starting piece', () => {
    const engine1 = createGame(99999);
    const piece1 = engine1.state.activePiece;

    // Restart with same seed
    restartGame(engine1, 99999);
    const piece2 = engine1.state.activePiece;

    expect(piece2?.type).toBe(piece1!.type);
    expect(piece2!.pivot.x).toBe(piece1!.pivot.x);
    expect(piece2!.pivot.y).toBe(piece1!.pivot.y);
  });

  it('restart creates a clean empty board', () => {
    const engine = createGame(42);
    // Fill some rows
    for (let x = 0; x < 10; x++) {
      engine.state.board[10][x] = { type: 'solid' };
    }

    restartGame(engine, 42);

    // Board should be empty again
    let emptyCount = 0;
    for (let y = 0; y < 22; y++) {
      for (let x = 0; x < 10; x++) {
        if (engine.state.board[y][x].type === 'empty') {
          emptyCount++;
        }
      }
    }
    expect(emptyCount).toBe(220);
  });
});

describe('Chain state reset on restart', () => {
  it('chain count resets to 1', () => {
    const engine = createGame(42);
    engine.state.chainCount = 5;
    restartGame(engine, 42);
    expect(engine.state.chainCount).toBe(1);
  });
});

describe('Drop state reset on restart', () => {
  it('hardDropped resets to false', () => {
    const engine = createGame(42);
    engine.state.hardDropped = true;
    engine.state.hardDropCells = 10;
    restartGame(engine, 42);
    expect(engine.state.hardDropped).toBe(false);
    expect(engine.state.hardDropCells).toBe(0);
  });
});
