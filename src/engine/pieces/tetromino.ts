import type { Position, TetrominoType } from '../types';

// Define base cell shapes as relative positions from the pivot (0,0).
// Each shape is the 0° rotation; other rotations are computed dynamically.

const SHAPES: Record<TetrominoType, Position[]> = {
  // I-piece: 4 horizontal
  I: [
    { x: -2, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 0 },
    { x: 1, y: 0 },
  ],
  // O-piece: 2×2 square
  O: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
  ],
  // T-piece
  T: [
    { x: 0, y: 0 },
    { x: -1, y: 1 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
  ],
  // S-piece
  S: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: -1, y: 1 },
    { x: 0, y: 1 },
  ],
  // Z-piece
  Z: [
    { x: -1, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
  ],
  // J-piece
  J: [
    { x: -1, y: 0 },
    { x: -1, y: 1 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
  ],
  // L-piece
  L: [
    { x: 1, y: 0 },
    { x: -1, y: 1 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
  ],
};

/** Get the cells of a tetromino at a given rotation state (0-3). */
export function getTetrominoCells(shape: TetrominoType, rotation: number): Position[] {
  let cells = SHAPES[shape];

  for (let r = 0; r < rotation; r++) {
    cells = rotateCW(cells);
  }

  return cells;
}

/** Apply 90° CW rotation to a set of cells. */
function rotateCW(positions: Position[]): Position[] {
  return positions.map(p => ({ x: -p.y, y: p.x }));
}

/**
 * Create a new tetromino piece at a given shape and spawn position.
 * @param shape - The tetromino type
 * @param spawnY - Row to spawn at (typically 2 for visible area top)
 * @param spawnX - Column for the pivot (typically 4 or 5 for center)
 */
export function createTetromino(
  shape: TetrominoType,
  spawnY: number = 2,
  spawnX: number = 4
): { type: 'tetromino'; shape: TetrominoType; cells: Position[]; pivot: { x: number; y: number }; rotation: number } {
  const cells = getTetrominoCells(shape, 0);
  return {
    type: 'tetromino' as const,
    shape,
    cells,
    pivot: { x: spawnX, y: spawnY },
    rotation: 0,
  };
}

/** Rotate a tetromino piece (0 or 1 for CCW/CW). */
export function rotateTetromino(
  piece: { type: 'tetromino'; shape: TetrominoType; cells: Position[]; pivot: Position; rotation: number },
  direction: 1 | -1
): { type: 'tetromino'; shape: TetrominoType; cells: Position[]; pivot: Position; rotation: number } {
  const newRotation = ((piece.rotation + direction) % 4 + 4) % 4;
  const newCells = getTetrominoCells(piece.shape, newRotation);
  return {
    ...piece,
    cells: newCells,
    rotation: newRotation,
  };
}
