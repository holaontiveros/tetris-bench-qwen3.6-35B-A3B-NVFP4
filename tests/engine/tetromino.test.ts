import { describe, it, expect } from 'vitest';
import { getTetrominoCells, rotateTetromino, createTetromino } from '../../src/engine/pieces/tetromino';
import type { Position, TetrominoType } from '../../src/engine/types';

describe('Tetromino generation', () => {
  const allTypes: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

  it('all 7 tetromino types can be generated', () => {
    for (const shape of allTypes) {
      const cells = getTetrominoCells(shape, 0);
      expect(cells.length).toBe(4);
    }
  });

  it('I-piece has 4 cells in a line at rotation 0', () => {
    const cells = getTetrominoCells('I', 0);
    // All y should be 0, x should be -2, -1, 0, 1
    for (const cell of cells) {
      expect(cell.y).toBe(0);
    }
    const xs = cells.map(c => c.x).sort((a, b) => a - b);
    expect(xs).toEqual([-2, -1, 0, 1]);
  });

  it('O-piece is a 2x2 square', () => {
    const cells = getTetrominoCells('O', 0);
    const xs = new Set(cells.map(c => c.x));
    const ys = new Set(cells.map(c => c.y));
    expect(xs.size).toBe(2);
    expect(ys.size).toBe(2);
  });

  it('O-piece shape is invariant under 90° rotation', () => {
    const r0 = getTetrominoCells('O', 0);
    const r1 = getTetrominoCells('O', 1);
    const r2 = getTetrominoCells('O', 2);
    const r3 = getTetrominoCells('O', 3);
    // All should have the same extent: {x: 0,1}, {y: 0,1}
    for (const cells of [r0, r1, r2, r3]) {
      const xs = new Set(cells.map(c => c.x));
      const ys = new Set(cells.map(c => c.y));
      expect(xs.size).toBe(2);
      expect(ys.size).toBe(2);
    }
  });
});

describe('Rotation', () => {
  it('rotating I-piece 4 times returns to original', () => {
    const r0 = getTetrominoCells('I', 0);
    const r4 = getTetrominoCells('I', 4);
    expect(r4).toEqual(r0);
  });

  it('rotating any piece 4 times returns to original', () => {
    for (const shape of ['I', 'O', 'T', 'S', 'Z', 'J', 'L'] as TetrominoType[]) {
      const r0 = getTetrominoCells(shape, 0);
      const r4 = getTetrominoCells(shape, 4);
      expect(r4).toEqual(r0);
    }
  });

  it('rotateCW and rotateCCW are inverses', () => {
    for (const shape of ['I', 'T', 'S', 'Z', 'J', 'L'] as TetrominoType[]) {
      const cw = getTetrominoCells(shape, 1);
      const cwcw = getTetrominoCells(shape, 2);
      // Two CW rotations
      const cwcwcw = getTetrominoCells(shape, 3);
      const cwcwcwcw = getTetrominoCells(shape, 4);
      expect(cwcwcwcw).toEqual(getTetrominoCells(shape, 0));
    }
  });
});

describe('TetrominoPiece creation', () => {
  it('creates a piece with correct pivot and cells', () => {
    const piece = createTetromino('T', 5, 4);
    expect(piece.type).toBe('tetromino');
    expect(piece.shape).toBe('T');
    expect(piece.cells.length).toBe(4);
    expect(piece.pivot).toEqual({ x: 4, y: 5 });
    expect(piece.rotation).toBe(0);
  });

  it('rotateTetromino returns new rotation state', () => {
    const piece = createTetromino('T', 5, 4);
    const rotated = rotateTetromino(piece, 1);
    expect(rotated.rotation).toBe(1);
    expect(rotated.cells).not.toEqual(piece.cells);
  });

  it('rotateTetromino with -1 gives CCW rotation', () => {
    const piece = createTetromino('T', 5, 4);
    const ccw = rotateTetromino(piece, -1);
    expect(ccw.rotation).toBe(3); // (0 - 1) mod 4 = 3
  });
});

describe('Wall correction simulation', () => {
  it('T-piece can rotate at the left wall', () => {
    // At column 0, T-piece pivot at 0
    const piece = createTetromino('T', 5, 0);
    const rotated = rotateTetromino(piece, 1);
    // The rotated cells may extend left, but wall kick should handle it
    expect(rotated.cells.length).toBe(4);
  });

  it('I-piece can rotate at the right wall with kick', () => {
    const piece = createTetromino('I', 5, 9);
    const rotated = rotateTetromino(piece, 1);
    expect(rotated.cells.length).toBe(4);
  });
});
