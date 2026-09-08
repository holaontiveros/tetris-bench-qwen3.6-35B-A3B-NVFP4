import { describe, it, expect } from 'vitest';
import { createBlobPair, rotateBlobPair } from '../../src/engine/pieces/blobPair';
import { createRng } from '../../src/engine/random/prng';
import type { BlobColor, Rng } from '../../src/engine/types';

// Dummy RNG that always returns 0.5 (deterministic)
const DUMMY_RNG: Rng = () => 0.5;

describe('Blob pair creation', () => {
  it('creates a pair with two blobs', () => {
    const piece = createBlobPair(DUMMY_RNG);
    expect(piece.type).toBe('blob');
    expect(piece.blobs.length).toBe(2);
  });

  it('both blobs have colors', () => {
    const piece = createBlobPair(DUMMY_RNG);
    expect(piece.blobs[0].color).toBeDefined();
    expect(piece.blobs[1].color).toBeDefined();
    const colors: BlobColor[] = ['red', 'blue', 'green', 'yellow'];
    expect(colors).toContain(piece.blobs[0].color);
    expect(colors).toContain(piece.blobs[1].color);
  });

  it('can create with specific colors', () => {
    const piece = createBlobPair(DUMMY_RNG, 'red', 'blue');
    expect(piece.blobs[0].color).toBe('red');
    expect(piece.blobs[1].color).toBe('blue');
  });

  it('places blobs at correct offsets', () => {
    const piece = createBlobPair(DUMMY_RNG, 'red', 'blue', 3, 5);
    expect(piece.pivot).toEqual({ x: 5, y: 3 });
    expect(piece.blobs[0].offset).toEqual({ x: 0, y: 0 });
    expect(piece.blobs[1].offset).toEqual({ x: 1, y: 0 });
  });

  it('both blobs in a pair can have the same color', () => {
    const piece = createBlobPair(DUMMY_RNG, 'red', 'red');
    expect(piece.blobs[0].color).toBe('red');
    expect(piece.blobs[1].color).toBe('red');
  });

  it('rotation starts at 0', () => {
    const piece = createBlobPair(DUMMY_RNG);
    expect(piece.rotation).toBe(0);
  });

  it('deterministic RNG produces consistent colors', () => {
    const rng1 = createRng(123);
    const rng2 = createRng(123);
    const p1 = createBlobPair(rng1);
    const p2 = createBlobPair(rng2);
    expect(p1.blobs[0].color).toBe(p2.blobs[0].color);
    expect(p1.blobs[1].color).toBe(p2.blobs[1].color);
  });
});

describe('Blob pair rotation', () => {
  it('CW rotation changes rotation state', () => {
    const piece = createBlobPair(DUMMY_RNG, 'red', 'blue');
    const rotated = rotateBlobPair(piece, 1);
    expect(rotated.rotation).toBe(1);
    expect(rotated.blobs.length).toBe(2);
  });

  it('CCW rotation changes rotation state', () => {
    const piece = createBlobPair(DUMMY_RNG, 'red', 'blue');
    const rotated = rotateBlobPair(piece, -1);
    expect(rotated.rotation).toBe(-1);
  });

  it('four CW rotations return to original offsets', () => {
    const piece = createBlobPair(DUMMY_RNG, 'red', 'blue');
    let current = piece;
    for (let i = 0; i < 4; i++) {
      current = rotateBlobPair(current, 1);
    }
    // Original offsets: (0,0) and (1,0)
    const o0x = current.blobs[0].offset.x;
    const o0y = current.blobs[0].offset.y;
    const o1x = current.blobs[1].offset.x;
    const o1y = current.blobs[1].offset.y;
    expect(Math.abs(o0x)).toBe(0);
    expect(Math.abs(o0y)).toBe(0);
    expect(o1x).toBe(1);
    expect(o1y).toBe(0);
  });

  it('colors are preserved through rotation', () => {
    const piece = createBlobPair(DUMMY_RNG, 'green', 'yellow');
    let current = piece;
    for (let i = 0; i < 4; i++) {
      current = rotateBlobPair(current, 1);
      expect(current.blobs[0].color).toBe('green');
      expect(current.blobs[1].color).toBe('yellow');
    }
  });

  it('rotation changes blob positions', () => {
    const piece = createBlobPair(DUMMY_RNG, 'red', 'blue');
    const rotated = rotateBlobPair(piece, 1);
    // After CW: second blob moves from (1,0) to (0,-1) relative
    const offsets = rotated.blobs.map(b => b.offset);
    expect(offsets).not.toEqual([{ x: 0, y: 0 }, { x: 1, y: 0 }]);
  });

  it('pivot is preserved through rotation', () => {
    const piece = createBlobPair(DUMMY_RNG, 'red', 'blue', 5, 7);
    const rotated = rotateBlobPair(piece, 1);
    expect(rotated.pivot).toEqual({ x: 7, y: 5 });
  });
});
