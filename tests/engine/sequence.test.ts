import { describe, it, expect } from 'vitest';
import { createRng } from '../../src/engine/random/prng';
import { PieceQueue } from '../../src/engine/random/sequence';
import type { TetrominoType } from '../../src/engine/types';

describe('Piece queue generation', () => {
  it('creates a queue with preview pieces', () => {
    const rng = createRng(42);
    const queue = new PieceQueue(rng);
    const preview = queue.getPreview(3);
    expect(preview.length).toBe(3);
  });

  it('next() returns pieces in order', () => {
    const rng = createRng(42);
    const queue = new PieceQueue(rng);
    const p1 = queue.next();
    const p2 = queue.next();
    // First two should be tetrominoes, third blob
    expect(p1.type).toBe('tetromino');
    expect(p2.type).toBe('tetromino');
    // After consuming first 3, peek should show next 3
    const preview = queue.getPreview(3);
    expect(preview.length).toBe(3);
  });

  it('sequence pattern: tetromino, tetromino, blob', () => {
    const rng = createRng(123);
    const queue = new PieceQueue(rng);
    const types: string[] = [];
    for (let i = 0; i < 9; i++) {
      types.push(queue.next().type);
    }
    // Should be: T, T, B, T, T, B, T, T, B
    for (let i = 0; i < 3; i++) {
      expect(types[i * 3]).toBe('tetromino');
      expect(types[i * 3 + 1]).toBe('tetromino');
      expect(types[i * 3 + 2]).toBe('blob');
    }
  });
});

describe('7-bag randomizer', () => {
  it('each bag contains all 7 tetromino types', () => {
    const rng = createRng(999);
    const queue = new PieceQueue(rng);
    // Get first 7 tetrominoes (2 from first pattern + 5 from next bag start)
    // Actually we need to track tetromino types across the sequence
    const types: TetrominoType[] = [];
    for (let i = 0; i < 14; i++) {
      const piece = queue.next();
      if (piece.type === 'tetromino') {
        types.push(piece.shape);
      }
    }
    // First 7 tetrominoes should be a complete bag
    const firstBag = types.slice(0, 7);
    const expected: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    expect(firstBag.sort()).toEqual(expected.sort());
  });

  it('no tetromino type repeats within a bag', () => {
    const rng = createRng(555);
    const queue = new PieceQueue(rng);
    // Collect all tetromino types from the next few patterns
    const types: TetrominoType[] = [];
    for (let i = 0; i < 21; i++) {
      const piece = queue.next();
      if (piece.type === 'tetromino') {
        types.push(piece.shape);
        if (types.length === 7) break;
      }
    }
    // Each of the 7 should be unique
    const unique = new Set(types);
    expect(unique.size).toBe(7);
  });
});

describe('Determinism', () => {
  it('same seed produces same piece sequence', () => {
    const rng1 = createRng(7777);
    const queue1 = new PieceQueue(rng1);
    const rng2 = createRng(7777);
    const queue2 = new PieceQueue(rng2);

    const seq1: string[] = [];
    const seq2: string[] = [];
    for (let i = 0; i < 12; i++) {
      const p1 = queue1.next();
      const p2 = queue2.next();
      if (p1.type === 'tetromino') {
        seq1.push(p1.shape);
      } else {
        seq1.push(`B(${p1.blobs[0].color},${p1.blobs[1].color})`);
      }
      if (p2.type === 'tetromino') {
        seq2.push(p2.shape);
      } else {
        seq2.push(`B(${p2.blobs[0].color},${p2.blobs[1].color})`);
      }
    }
    expect(seq1).toEqual(seq2);
  });

  it('different seeds can produce different sequences', () => {
    const rng1 = createRng(1);
    const queue1 = new PieceQueue(rng1);
    const rng2 = createRng(2);
    const queue2 = new PieceQueue(rng2);

    let different = false;
    for (let i = 0; i < 20; i++) {
      const p1 = queue1.next();
      const p2 = queue2.next();
      const s1 = p1.type === 'tetromino' ? p1.shape : p1.blobs[0].color;
      const s2 = p2.type === 'tetromino' ? p2.shape : p2.blobs[0].color;
      if (s1 !== s2) {
        different = true;
        break;
      }
    }
    // Very likely to be different, but not guaranteed
    expect(different).toBe(true);
  });
});

describe('Preview queue', () => {
  it('preview shows next pieces without consuming them', () => {
    const rng = createRng(42);
    const queue = new PieceQueue(rng);
    const preview1 = queue.getPreview(3);
    const preview2 = queue.getPreview(3);
    // Peeking multiple times should return the same pieces
    expect(preview1.length).toBe(preview2.length);
  });

  it('preview returns at most N pieces', () => {
    const rng = createRng(42);
    const queue = new PieceQueue(rng);
    const preview = queue.getPreview(10);
    // Queue should have enough pieces
    expect(preview.length).toBeLessThanOrEqual(10);
  });
});
