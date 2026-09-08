import { describe, it, expect } from 'vitest';
import { createEmptyBoard, isValidPosition, isEmpty, wouldCollide, getFullRows, removeRow } from '../../src/engine/board';
import { createTetromino } from '../../src/engine/pieces/tetromino';
import type { Position } from '../../src/engine/types';

describe('Board creation', () => {
  it('creates an empty board with correct dimensions', () => {
    const board = createEmptyBoard();
    expect(board.length).toBe(22);
    for (const row of board) {
      expect(row.length).toBe(10);
      for (const cell of row) {
        expect(cell.type).toBe('empty');
      }
    }
  });

  it('creates independent rows', () => {
    const board = createEmptyBoard();
    board[0][0] = { type: 'solid' };
    expect(board[1][0].type).toBe('empty');
  });
});

describe('Position validation', () => {
  it('valid positions return true', () => {
    const board = createEmptyBoard();
    expect(isValidPosition(board, { x: 0, y: 0 })).toBe(true);
    expect(isValidPosition(board, { x: 9, y: 21 })).toBe(true);
    expect(isValidPosition(board, { x: 4, y: 10 })).toBe(true);
  });

  it('positions outside bounds return false', () => {
    const board = createEmptyBoard();
    expect(isValidPosition(board, { x: -1, y: 0 })).toBe(false);
    expect(isValidPosition(board, { x: 0, y: -1 })).toBe(false);
    expect(isValidPosition(board, { x: 10, y: 0 })).toBe(false);
    expect(isValidPosition(board, { x: 0, y: 22 })).toBe(false);
    expect(isValidPosition(board, { x: -1, y: -1 })).toBe(false);
    expect(isValidPosition(board, { x: 10, y: 22 })).toBe(false);
  });
});

describe('Empty cell check', () => {
  it('returns true for empty cells', () => {
    const board = createEmptyBoard();
    expect(isEmpty(board, { x: 0, y: 0 })).toBe(true);
  });

  it('returns false for solid cells', () => {
    const board = createEmptyBoard();
    board[5][5] = { type: 'solid' };
    expect(isEmpty(board, { x: 5, y: 5 })).toBe(false);
  });

  it('returns false for blob cells', () => {
    const board = createEmptyBoard();
    board[3][3] = { type: 'blob', color: 'red' };
    expect(isEmpty(board, { x: 3, y: 3 })).toBe(false);
  });

  it('returns false for out-of-bounds positions', () => {
    const board = createEmptyBoard();
    expect(isEmpty(board, { x: -1, y: 0 })).toBe(false);
  });
});

describe('Collision detection', () => {
  it('no collision on empty board', () => {
    const board = createEmptyBoard();
    expect(wouldCollide(board, [{ x: 5, y: 5 }, { x: 6, y: 5 }])).toBe(false);
  });

  it('collision with solid cell', () => {
    const board = createEmptyBoard();
    board[5][5] = { type: 'solid' };
    expect(wouldCollide(board, [{ x: 5, y: 5 }])).toBe(true);
  });

  it('collision with blob cell', () => {
    const board = createEmptyBoard();
    board[3][3] = { type: 'blob', color: 'blue' };
    expect(wouldCollide(board, [{ x: 3, y: 3 }])).toBe(true);
  });

  it('collision with board edges', () => {
    const board = createEmptyBoard();
    expect(wouldCollide(board, [{ x: -1, y: 5 }])).toBe(true);
    expect(wouldCollide(board, [{ x: 10, y: 5 }])).toBe(true);
    expect(wouldCollide(board, [{ x: 5, y: -1 }])).toBe(true);
    expect(wouldCollide(board, [{ x: 5, y: 22 }])).toBe(true);
  });

  it('no collision when all cells are valid and empty', () => {
    const board = createEmptyBoard();
    const cells: Position[] = [];
    for (let x = 0; x < 10; x++) {
      cells.push({ x, y: 10 });
    }
    expect(wouldCollide(board, cells)).toBe(false);
  });
});

describe('Wall collision (Tetromino)', () => {
  it('cannot move left past column 0', () => {
    const board = createEmptyBoard();
    const piece = createTetromino('I', 5, 0);
    const cells = piece.cells.map(c => ({ x: c.x - 1, y: c.y }));
    // Some cells will be at x < 0
    expect(wouldCollide(board, cells)).toBe(true);
  });

  it('cannot move right past column 9', () => {
    const board = createEmptyBoard();
    // I-piece at column 9 (pivot), cells relative: -2,-1,0,1 → absolute: 7,8,9,10
    // Adding +1 would push cells to 8,9,10,11 which includes out-of-bounds columns
    const piece = createTetromino('I', 5, 9);
    const cells = piece.cells.map(c => ({ x: c.x + 1, y: c.y }));
    // At pivot 9, shifting by +1: cells at 8,9,10,11 → column 10 and 11 are out of bounds
    expect(wouldCollide(board, cells)).toBe(true);
  });

  it('cannot move down past bottom', () => {
    const board = createEmptyBoard();
    board[20][5] = { type: 'solid' };
    expect(wouldCollide(board, [{ x: 5, y: 21 }])).toBe(false);
    expect(wouldCollide(board, [{ x: 5, y: 22 }])).toBe(true);
  });
});

describe('Collision with existing cells', () => {
  it('collides with a line of blocks', () => {
    const board = createEmptyBoard();
    for (let x = 0; x < 10; x++) {
      board[10][x] = { type: 'solid' };
    }
    expect(wouldCollide(board, [{ x: 5, y: 10 }])).toBe(true);
    expect(wouldCollide(board, [{ x: 0, y: 10 }])).toBe(true);
    expect(wouldCollide(board, [{ x: 9, y: 10 }])).toBe(true);
  });

  it('does not collide with cells above an occupied row', () => {
    const board = createEmptyBoard();
    for (let x = 0; x < 10; x++) {
      board[10][x] = { type: 'solid' };
    }
    // Cell at row 9 is fine
    expect(wouldCollide(board, [{ x: 5, y: 9 }])).toBe(false);
  });
});

describe('Full row detection', () => {
  it('no full rows on empty board', () => {
    const board = createEmptyBoard();
    expect(getFullRows(board)).toEqual([]);
  });

  it('one full row detected', () => {
    const board = createEmptyBoard();
    for (let x = 0; x < 10; x++) {
      board[5][x] = { type: 'solid' };
    }
    expect(getFullRows(board)).toEqual([5]);
  });

  it('multiple full rows detected', () => {
    const board = createEmptyBoard();
    for (let x = 0; x < 10; x++) {
      board[3][x] = { type: 'solid' };
      board[7][x] = { type: 'solid' };
    }
    expect(getFullRows(board)).toEqual([3, 7]);
  });

  it('rows with mixed cells count as full', () => {
    const board = createEmptyBoard();
    for (let x = 0; x < 5; x++) {
      board[5][x] = { type: 'solid' };
    }
    for (let x = 5; x < 10; x++) {
      board[5][x] = { type: 'blob', color: 'red' };
    }
    expect(getFullRows(board)).toEqual([5]);
  });

  it('empty cell in row prevents detection', () => {
    const board = createEmptyBoard();
    for (let x = 0; x < 9; x++) {
      board[5][x] = { type: 'solid' };
    }
    expect(getFullRows(board)).toEqual([]);
  });
});

describe('Row removal', () => {
  it('removes a row and shifts others down', () => {
    const board = createEmptyBoard();
    board[5][5] = { type: 'solid' };
    board[3][3] = { type: 'solid' };

    removeRow(board, 5);

    // The original row 5 cells are now gone (shifted from row 6)
    // Row 3 should still have its cell
    expect(board[3][3].type).toBe('solid');
  });

  it('fills top rows after removal', () => {
    const board = createEmptyBoard();
    // Fill row 0
    for (let x = 0; x < 10; x++) {
      board[0][x] = { type: 'solid' };
    }

    removeRow(board, 0);

    // Top row should be all empty
    for (let x = 0; x < 10; x++) {
      expect(board[0][x].type).toBe('empty');
    }
  });

  it('removing bottom row shifts everything down', () => {
    const board = createEmptyBoard();
    board[20][5] = { type: 'solid' };

    removeRow(board, 20);

    // Row 20 should be empty (was filled by nothing, it was the bottom)
    expect(board[20][5].type).toBe('empty');
  });
});
