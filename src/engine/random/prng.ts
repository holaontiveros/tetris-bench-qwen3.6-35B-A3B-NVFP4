/**
 * Seeded pseudo-random number generator using Mulberry32.
 *
 * This is a fast, simple PRNG suitable for game randomness.
 * It is deterministic: the same seed produces the same sequence.
 *
 * IMPORTANT: All gameplay randomness goes through this PRNG,
 * not Math.random().
 */

/** Create a PRNG from an integer seed. */
export function createRng(seed: number): Rng {
  // Mulberry32: 32-bit PRNG
  let s = seed | 0;
  if (s === 0) s = 1;

  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Interface for the RNG function. */
export interface Rng {
  (): number;
}

/** Get a random integer in [min, max] inclusive. */
export function rngInt(rng: Rng, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

/** Shuffle an array in place using Fisher-Yates. */
export function shuffle<T>(rng: Rng, array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = rngInt(rng, 0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
