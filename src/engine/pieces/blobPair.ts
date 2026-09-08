import type { BlobColor, Position, Rng } from '../types';
import { rngInt } from '../random/prng';

const COLORS: BlobColor[] = ['red', 'blue', 'green', 'yellow'];

/**
 * Create a blob pair piece with two colors.
 * By default the pair is horizontal.
 *
 * @param rng - Random number generator for color selection
 * @param color1 - Color of the first (left/top) blob
 * @param color2 - Color of the second (right/bottom) blob
 * @param spawnY - Row for the pivot
 * @param spawnX - Column for the pivot
 */
export function createBlobPair(
  rng: Rng,
  color1?: BlobColor,
  color2?: BlobColor,
  spawnY: number = 2,
  spawnX: number = 4
): {
  type: 'blob';
  blobs: { offset: Position; color: BlobColor }[];
  pivot: Position;
  rotation: number;
} {
  const c1 = color1 || COLORS[rngInt(rng, 0, 3)];
  const c2 = color2 || COLORS[rngInt(rng, 0, 3)];

  // Horizontal pair by default: offsets (0,0) and (1,0)
  const blobs = [
    { offset: { x: 0, y: 0 }, color: c1 },
    { offset: { x: 1, y: 0 }, color: c2 },
  ];

  return {
    type: 'blob' as const,
    blobs,
    pivot: { x: spawnX, y: spawnY },
    rotation: 0,
  };
}

/** Apply one 90° CW rotation to a single position. */
function rotCW(p: Position): Position {
  return { x: -p.y, y: p.x };
}

/** Apply one 90° CCW rotation to a single position. */
function rotCCW(p: Position): Position {
  return { x: p.y, y: -p.x };
}

/**
 * Rotate blob pair cell offsets by a single step.
 * direction: 1 = CW, -1 = CCW
 */
function rotateOffsets(
  blobs: { offset: Position; color: BlobColor }[],
  direction: 1 | -1
): { offset: Position; color: BlobColor }[] {
  return blobs.map(b => ({
    ...b,
    offset: direction === 1 ? rotCW(b.offset) : rotCCW(b.offset),
  }));
}

/**
 * Rotate a blob pair piece.
 * direction: 1 = CW, -1 = CCW
 */
export function rotateBlobPair(
  piece: {
    type: 'blob';
    blobs: { offset: Position; color: BlobColor }[];
    pivot: Position;
    rotation: number;
  },
  direction: 1 | -1
): {
  type: 'blob';
  blobs: { offset: Position; color: BlobColor }[];
  pivot: Position;
  rotation: number;
} {
  const newRotation = piece.rotation + direction;
  const newBlobs = rotateOffsets(piece.blobs, direction);
  return {
    ...piece,
    blobs: newBlobs,
    rotation: newRotation,
  };
}
