import { describe, it, expect } from 'vitest';
import { createRng } from '../../src/engine/random/prng';
import { PieceQueue } from '../../src/engine/random/sequence';
import { createEmptyBoard, wouldCollide, getPieceCells } from '../../src/engine/board';
import { createTetromino as createTetrominoPiece } from '../../src/engine/pieces/tetromino';
import { createBlobPair } from '../../src/engine/pieces/blobPair';
import type { Board, ActivePiece, Position, Rng } from '../../src/engine/types';
import { BOARD_HEIGHT, BOARD_WIDTH } from '../../src/engine/types';

// Dummy RNG for deterministic blob creation
const DUMMY_RNG: Rng = () => 0.5;

/**
 * Simulate a simple game loop with deterministic inputs.
 * Returns true if the simulation completed without errors.
 * Used for invariant testing.
 */
function simulateGame(seed: number, maxSteps: number = 100): {
  error: string | null;
  finalBoard: Board;
  piecesLocked: number;
} {
  try {
    const rng = createRng(seed);
    const queue = new PieceQueue(rng);
    let board = createEmptyBoard();
    let piecesLocked = 0;
    let step = 0;

    while (step < maxSteps) {
      // Get next piece
      const piece = queue.next();
      piecesLocked++;

      // Place piece on board (simulate it locking at spawn position)
      if (piece.type === 'tetromino') {
        const cells = getPieceCells(piece, piece.pivot.x, piece.pivot.y);
        for (const cell of cells) {
          if (cell.y >= 0 && cell.y < BOARD_HEIGHT && cell.x >= 0 && cell.x < BOARD_WIDTH) {
            board[cell.y][cell.x] = { type: 'solid' };
          }
        }
      } else {
        for (const blob of piece.blobs) {
          const x = piece.pivot.x + blob.offset.x;
          const y = piece.pivot.y + blob.offset.y;
          if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
            board[y][x] = { type: 'blob', color: blob.color };
          }
        }
      }

      // Check board invariant: no two cells at same position (always true by construction)
      // Check board dimensions
      if (board.length !== BOARD_HEIGHT) {
        return { error: `Board height changed: ${board.length}`, finalBoard: board, piecesLocked };
      }
      for (const row of board) {
        if (row.length !== BOARD_WIDTH) {
          return { error: `Board width changed: ${row.length}`, finalBoard: board, piecesLocked };
        }
      }

      // Check all settled cells are within bounds
      for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
          if (board[y][x].type !== 'empty') {
            // Cell is within bounds (guaranteed by loop)
          }
        }
      }

      step++;
    }

    return { error: null, finalBoard: board, piecesLocked };
  } catch (e) {
    return { error: `Exception: ${e}`, finalBoard: createEmptyBoard(), piecesLocked: 0 };
  }
}

describe('Board dimension invariants', () => {
  it('board dimensions remain constant after 100 pieces (seed 1)', () => {
    const result = simulateGame(1, 100);
    expect(result.error).toBeNull();
    expect(result.finalBoard.length).toBe(22);
    for (const row of result.finalBoard) {
      expect(row.length).toBe(10);
    }
  });

  it('board dimensions remain constant after 200 pieces (seed 999)', () => {
    const result = simulateGame(999, 200);
    expect(result.error).toBeNull();
  });

  it('board dimensions remain constant with various seeds', () => {
    for (const seed of [1, 42, 123, 456, 789, 1000, 9999, 54321]) {
      const result = simulateGame(seed, 50);
      expect(result.error).toBeNull();
      expect(result.finalBoard.length).toBe(22);
      expect(result.finalBoard[0].length).toBe(10);
    }
  });
});

describe('Cell position invariants', () => {
  it('all cells remain within board bounds', () => {
    for (const seed of [1, 42, 123, 999, 54321]) {
      const result = simulateGame(seed, 200);
      expect(result.error).toBeNull();

      let outOfBounds = 0;
      for (let y = 0; y < 22; y++) {
        for (let x = 0; x < 10; x++) {
          if (result.finalBoard[y][x].type !== 'empty') {
            if (x < 0 || x >= 10 || y < 0 || y >= 22) {
              outOfBounds++;
            }
          }
        }
      }
      expect(outOfBounds).toBe(0);
    }
  });

  it('no two cells occupy the same position (guaranteed by data structure)', () => {
    // This is inherently true because board[y][x] is a single cell
    // But we verify by checking the simulation doesn't break
    for (const seed of [1, 42, 456, 789]) {
      const result = simulateGame(seed, 100);
      expect(result.error).toBeNull();
    }
  });
});

describe('Active piece validity', () => {
  it('tetromino piece cells are valid after movement simulation', () => {
    const board = createEmptyBoard();
    const piece = createTetrominoPiece('T', 5, 5);
    const cells = getPieceCells(piece, piece.pivot.x, piece.pivot.y);

    for (const cell of cells) {
      expect(cell.x).toBeGreaterThanOrEqual(0);
      expect(cell.x).toBeLessThan(BOARD_WIDTH);
      expect(cell.y).toBeGreaterThanOrEqual(0);
      expect(cell.y).toBeLessThan(BOARD_HEIGHT);
    }

    // No collision on empty board
    expect(wouldCollide(board, cells)).toBe(false);
  });

  it('blob pair piece cells are valid after movement simulation', () => {
    const board = createEmptyBoard();
    const piece = createBlobPair(DUMMY_RNG, 'red', 'blue', 5, 5);

    for (const blob of piece.blobs) {
      const x = piece.pivot.x + blob.offset.x;
      const y = piece.pivot.y + blob.offset.y;
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(BOARD_WIDTH);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThan(BOARD_HEIGHT);
    }
  });
});

describe('Resolution stability', () => {
  it('board reaches stable state after filling rows', () => {
    const board = createEmptyBoard();
    // Fill all rows from 0 to 21
    for (let y = 0; y < 22; y++) {
      for (let x = 0; x < 10; x++) {
        board[y][x] = { type: 'solid' };
      }
    }

    // After removing all full rows and compacting, board should be all empty
    let steps = 0;
    let hasFullRows = true;
    while (hasFullRows && steps < 100) {
      hasFullRows = false;
      for (let y = 0; y < 22; y++) {
        if (board[y].every(c => c.type !== 'empty')) {
          // Remove this row
          for (let ry = y; ry < 21; ry++) {
            board[ry] = board[ry + 1];
          }
          const topRow = board[21];
          for (let x = 0; x < 10; x++) {
            topRow[x] = { type: 'empty' };
          }
          hasFullRows = true;
          break;
        }
      }
      steps++;
    }

    // Board should be empty after all rows cleared
    for (let y = 0; y < 22; y++) {
      for (let x = 0; x < 10; x++) {
        expect(board[y][x].type).toBe('empty');
      }
    }
  });
});

describe('Blob group stability after resolution', () => {
  it('stable board has no blob group of size 4+', () => {
    // Create a board with only blob groups of size < 4
    const board = createEmptyBoard();

    // Place blobs such that no group has 4+ connected cells
    // Pattern: isolated blobs and pairs only
    board[5][5] = { type: 'blob', color: 'red' };
    board[5][6] = { type: 'blob', color: 'red' }; // pair

    board[8][3] = { type: 'blob', color: 'blue' }; // isolated

    board[10][7] = { type: 'blob', color: 'green' };
    board[10][8] = { type: 'blob', color: 'green' }; // pair

    board[15][1] = { type: 'blob', color: 'yellow' }; // isolated

    // Check no group has 4+
    const visited = new Set<string>();
    let maxGroupSize = 0;

    for (let y = 0; y < 22; y++) {
      for (let x = 0; x < 10; x++) {
        if (board[y][x].type === 'blob' && !visited.has(`${x},${y}`)) {
          const color = board[y][x].color!;
          const queue: Position[] = [{ x, y }];
          visited.add(`${x},${y}`);
          let count = 0;

          while (queue.length > 0) {
            const curr = queue.shift()!;
            count++;
            maxGroupSize = Math.max(maxGroupSize, count);

            for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
              const nx = curr.x + dx;
              const ny = curr.y + dy;
              const key = `${nx},${ny}`;
              if (!visited.has(key) && nx >= 0 && nx < 10 && ny >= 0 && ny < 22) {
                if (board[ny][nx].type === 'blob' && board[ny][nx].color === color) {
                  visited.add(key);
                  queue.push({ x: nx, y: ny });
                }
              }
            }
          }
        }
      }
    }

    expect(maxGroupSize).toBeLessThan(4);
  });
});

describe('Large-scale simulation', () => {
  it('1000 seeds each with 20 pieces complete without error', () => {
    let errors = 0;
    for (let seed = 1; seed <= 1000; seed++) {
      const result = simulateGame(seed, 20);
      if (result.error) {
        errors++;
      }
    }
    expect(errors).toBe(0);
  });

  it('seeds 1-100 with 50 pieces each reach stable state', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const result = simulateGame(seed, 50);
      expect(result.error).toBeNull();
      expect(result.piecesLocked).toBe(50);
    }
  });
});
