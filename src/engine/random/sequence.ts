import type { Rng } from '../types';
import type { ActivePiece, TetrominoType } from '../types';
import { createTetromino } from '../pieces/tetromino';
import { createBlobPair } from '../pieces/blobPair';
import { shuffle } from './prng';

const TETROMINO_TYPES: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

// Piece sequence pattern: two tetrominoes, one blob pair, repeat
const SEQUENCE_PATTERN: ('tetromino' | 'blob')[] = ['tetromino', 'tetromino', 'blob'];

/**
 * A deterministic piece queue generator.
 *
 * Uses a 7-bag randomizer for tetrominoes and random colors for blob pairs.
 * The sequence pattern is: tetromino, tetromino, blob, repeat.
 *
 * The 7-bag ensures each tetromino type appears exactly once per bag
 * before any type repeats.
 */
export class PieceQueue {
  private buffer: ActivePiece[] = [];
  private tetrominoBag: TetrominoType[] = [];
  private rng: Rng;
  private spawnY: number;
  private spawnX: number;

  constructor(rng: Rng, spawnY: number = 2, spawnX: number = 4) {
    this.rng = rng;
    this.spawnY = spawnY;
    this.spawnX = spawnX;
    this.tetrominoBag = shuffle(this.rng, [...TETROMINO_TYPES]);
    // Pre-fill the buffer with enough pieces
    while (this.buffer.length < 7) {
      this.fillNextBatch();
    }
  }

  /** Generate the next batch of 3 pieces (T, T, B). */
  private fillNextBatch(): void {
    for (const itemType of SEQUENCE_PATTERN) {
      if (itemType === 'tetromino') {
        // Use next from current bag, generate new bag when empty
        if (this.tetrominoBag.length === 0) {
          this.tetrominoBag = shuffle(this.rng, [...TETROMINO_TYPES]);
        }
        const shape = this.tetrominoBag.shift()!;
        this.buffer.push(createTetromino(shape, this.spawnY, this.spawnX));
      } else {
        // Blob pair: random colors via RNG
        this.buffer.push(createBlobPair(this.rng, undefined, undefined, this.spawnY, this.spawnX));
      }
    }
  }

  /** Get the next piece without removing it. */
  peek(): ActivePiece {
    if (this.buffer.length === 0) {
      this.fillNextBatch();
    }
    return this.buffer[0];
  }

  /** Consume and return the next piece. */
  next(): ActivePiece {
    if (this.buffer.length === 0) {
      this.fillNextBatch();
    }
    const piece = this.buffer.shift()!;
    if (this.buffer.length < 3) {
      this.fillNextBatch();
    }
    return piece;
  }

  /** Get the next N pieces for the preview display. */
  getPreview(n: number): ActivePiece[] {
    const preview: ActivePiece[] = [];
    while (this.buffer.length < n) {
      this.fillNextBatch();
    }
    for (let i = 0; i < n && i < this.buffer.length; i++) {
      preview.push(this.buffer[i]);
    }
    return preview;
  }
}
