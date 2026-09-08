import { describe, it, expect } from 'vitest';
import {
  calculateLineScore,
  calculateBlobScore,
  calculateFallInterval,
} from '../../src/engine/engine';
import {
  LINE_SCORES as LINE_SCORES_CONST,
  BLOB_SCORE_MULTIPLIER as BLOB_MULT_CONST,
} from '../../src/engine/types';

describe('Line clear scoring', () => {
  it('1 line = 100 points', () => {
    expect(calculateLineScore(1)).toBe(100);
    expect(LINE_SCORES_CONST[1]).toBe(100);
  });

  it('2 lines = 300 points', () => {
    expect(calculateLineScore(2)).toBe(300);
    expect(LINE_SCORES_CONST[2]).toBe(300);
  });

  it('3 lines = 500 points', () => {
    expect(calculateLineScore(3)).toBe(500);
    expect(LINE_SCORES_CONST[3]).toBe(500);
  });

  it('4 lines = 800 points', () => {
    expect(calculateLineScore(4)).toBe(800);
    expect(LINE_SCORES_CONST[4]).toBe(800);
  });

  it('more than 4 lines: 200 × number of lines', () => {
    expect(calculateLineScore(5)).toBe(1000);
    expect(calculateLineScore(6)).toBe(1200);
  });
});

describe('Blob clear scoring', () => {
  it('4 blobs at chain 1: 4 × 10 × 1 = 40', () => {
    expect(calculateBlobScore(4, 1)).toBe(40);
  });

  it('5 blobs at chain 2: 5 × 10 × 2 = 100', () => {
    expect(calculateBlobScore(5, 2)).toBe(100);
  });

  it('4 blobs at chain 3: 4 × 10 × 3 = 120', () => {
    expect(calculateBlobScore(4, 3)).toBe(120);
  });

  it('uses correct multiplier constant', () => {
    expect(calculateBlobScore(1, 1)).toBe(BLOB_MULT_CONST);
  });
});

describe('Soft drop scoring', () => {
  it('1 point per cell soft-dropped', () => {
    // This is tracked in the engine state, not a separate function
    // The test is in the engine tests
  });
});

describe('Hard drop scoring', () => {
  it('2 points per cell hard-dropped', () => {
    // Tracked in engine state
  });
});

describe('Difficulty progression', () => {
  it('level 1: 800ms fall interval', () => {
    expect(calculateFallInterval(1)).toBe(800);
  });

  it('level 2: 740ms fall interval', () => {
    expect(calculateFallInterval(2)).toBe(740);
  });

  it('level 14: 800 - 13×60 = 20ms → capped at 100ms', () => {
    // 800 - 13*60 = 800 - 780 = 20, but capped at 100
    expect(calculateFallInterval(14)).toBe(100);
  });

  it('level 100: minimum interval', () => {
    expect(calculateFallInterval(100)).toBe(100);
  });

  it('fall interval decreases with level', () => {
    for (let level = 1; level <= 12; level++) {
      const interval = calculateFallInterval(level);
      const nextInterval = calculateFallInterval(level + 1);
      expect(nextInterval).toBeLessThan(interval);
    }
  });

  it('fall interval never goes below minimum', () => {
    for (let level = 1; level <= 100; level++) {
      expect(calculateFallInterval(level)).toBeGreaterThanOrEqual(100);
    }
  });
});
