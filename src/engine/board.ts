import type { Board, Cell, Position } from './types';
import { BOARD_HEIGHT, BOARD_WIDTH, VISIBLE_ROWS, SPAWN_ROWS } from './types';

/** Create an empty board (22 rows × 10 cols). */
export function createEmptyBoard(): Board {
  const board: Board = [];
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    const row: Cell[] = [];
    for (let x = 0; x < BOARD_WIDTH; x++) {
      row.push({ type: 'empty' });
    }
    board.push(row);
  }
  return board;
}

/** Check if a position is within board bounds. */
export function isValidPosition(board: Board, pos: Position): boolean {
  return pos.x >= 0 && pos.x < BOARD_WIDTH && pos.y >= 0 && pos.y < BOARD_HEIGHT;
}

/** Check if a cell at the given position is empty. */
export function isEmpty(board: Board, pos: Position): boolean {
  if (!isValidPosition(board, pos)) return false;
  return board[pos.y][pos.x].type === 'empty';
}

/** Check if placing cells at the given positions would collide. */
export function wouldCollide(board: Board, cells: Position[]): boolean {
  for (const cell of cells) {
    if (!isValidPosition(board, cell)) return true;
    if (board[cell.y][cell.x].type !== 'empty') return true;
  }
  return false;
}

/** Place cells onto the board. Modifies board in place. */
export function placeCells(board: Board, cells: (Position & { cell: Cell })[]): void {
  for (const { x, y, cell } of cells) {
    board[y][x] = { ...cell };
  }
}

/** Remove a row from the board and shift rows above down. */
export function removeRow(board: Board, row: number): void {
  for (let y = row; y < BOARD_HEIGHT - 1; y++) {
    board[y] = board[y + 1];
  }
  // Fill top row with empty cells
  const topRow: Cell[] = [];
  for (let x = 0; x < BOARD_WIDTH; x++) {
    topRow.push({ type: 'empty' });
  }
  board[BOARD_HEIGHT - 1] = topRow;
}

/** Get all rows that are completely filled. */
export function getFullRows(board: Board): number[] {
  const full: number[] = [];
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    if (board[y].every(cell => cell.type !== 'empty')) {
      full.push(y);
    }
  }
  return full;
}

/** Apply a rotation (90° CW) to a set of relative positions. */
export function rotateCW(positions: Position[]): Position[] {
  return positions.map(p => ({ x: -p.y, y: p.x }));
}

/** Apply a rotation (90° CCW) to a set of relative positions. */
export function rotateCCW(positions: Position[]): Position[] {
  return positions.map(p => ({ x: p.y, y: -p.x }));
}

/**
 * Get all cells that a piece would occupy at its given board position.
 * Converts relative offsets to board positions.
 * Works with both TetrominoPiece (has `cells`) and BlobPairPiece (has `blobs`).
 */
export function getPieceCells(
  piece: { pivot: Position; cells: Position[] } | { pivot: Position; blobs: { offset: Position }[] },
  boardX: number,
  boardY: number
): Position[] {
  if ('cells' in piece) {
    return piece.cells.map(c => ({
      x: boardX + c.x,
      y: boardY + c.y,
    }));
  }
  // Blob pair
  return piece.blobs.map(b => ({
    x: boardX + b.offset.x,
    y: boardY + b.offset.y,
  }));
}

/**
 * Try a rotation with basic wall kick.
 * Returns the new cell positions if valid, or null if rotation cannot be done.
 */
export function tryRotate(
  board: Board,
  cells: Position[],
  pivot: Position,
  boardX: number,
  boardY: number,
  clockwise: boolean
): Position[] | null {
  const rotated = clockwise ? rotateCW(cells) : rotateCCW(cells);
  // Try: no offset, then wall kicks
  const kicks = [
    { dx: 0, dy: 0 },
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 },
    { dx: -2, dy: 0 },
    { dx: 2, dy: 0 },
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
  ];

  for (const kick of kicks) {
    const newCells = rotated.map(c => ({
      x: pivot.x + kick.dx + c.x + boardX - pivot.x,
      y: pivot.y + kick.dy + c.y + boardY - pivot.y,
    }));
    // Normalize: the pivot is the reference point
    const normalized = rotated.map(c => ({
      x: boardX + pivot.x + kick.dx + c.x - pivot.x,
      y: boardY + pivot.y + kick.dy + c.y - pivot.y,
    }));

    if (!wouldCollide(board, normalized)) {
      return normalized;
    }
  }
  return null;
}
