import { describe, it, expect } from 'vitest';
import { createRng, rngInt, shuffle } from '../../src/engine/random/prng';

describe('RNG creation', () => {
  it('same seed produces same sequence', () => {
    const rng1 = createRng(42);
    const rng2 = createRng(42);
    const results1: number[] = [];
    const results2: number[] = [];
    for (let i = 0; i < 10; i++) {
      results1.push(rng1());
      results2.push(rng2());
    }
    expect(results1).toEqual(results2);
  });

  it('different seeds can produce different sequences', () => {
    const rng1 = createRng(1);
    const rng2 = createRng(2);
    const r1 = rng1();
    const r2 = rng2();
    // With different seeds, first values should differ (extremely high probability)
    expect(r1).not.toBe(r2);
  });

  it('zero seed is handled', () => {
    const rng = createRng(0);
    const r = rng();
    expect(typeof r).toBe('number');
    expect(r).toBeGreaterThanOrEqual(0);
    expect(r).toBeLessThanOrEqual(1);
  });
});

describe('RNG value range', () => {
  it('values are in [0, 1)', () => {
    const rng = createRng(12345);
    for (let i = 0; i < 1000; i++) {
      const val = rng();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });

  it('rngInt produces values in range', () => {
    const rng = createRng(999);
    for (let i = 0; i < 100; i++) {
      const val = rngInt(rng, 5, 10);
      expect(val).toBeGreaterThanOrEqual(5);
      expect(val).toBeLessThanOrEqual(10);
      expect(Number.isInteger(val)).toBe(true);
    }
  });

  it('rngInt with same range always returns same value', () => {
    const rng = createRng(42);
    for (let i = 0; i < 10; i++) {
      // Note: the rng advances, so we test range not exact value
      const val = rngInt(rng, 3, 3);
      expect(val).toBe(3);
    }
  });
});

describe('Shuffle', () => {
  it('shuffled array has same length', () => {
    const rng = createRng(42);
    const arr = [1, 2, 3, 4, 5];
    const shuffled = shuffle(rng, arr);
    expect(shuffled.length).toBe(5);
  });

  it('shuffled array contains same elements', () => {
    const rng = createRng(42);
    const arr = [10, 20, 30, 40, 50];
    const shuffled = shuffle(rng, arr);
    expect(shuffled.sort()).toEqual([10, 20, 30, 40, 50]);
  });

  it('same seed produces same shuffle', () => {
    const rng1 = createRng(777);
    const rng2 = createRng(777);
    const arr = ['a', 'b', 'c', 'd', 'e'];
    expect(shuffle(rng1, arr)).toEqual(shuffle(rng2, arr));
  });

  it('shuffle does not modify original array', () => {
    const rng = createRng(42);
    const arr = [1, 2, 3, 4, 5];
    shuffle(rng, arr);
    expect(arr).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('Determinism over long sequences', () => {
  it('1000 consecutive values are reproducible', () => {
    const rng1 = createRng(54321);
    const rng2 = createRng(54321);
    const vals1: number[] = [];
    const vals2: number[] = [];
    for (let i = 0; i < 1000; i++) {
      vals1.push(rng1());
      vals2.push(rng2());
    }
    expect(vals1).toEqual(vals2);
  });
});
