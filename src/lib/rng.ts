// Small, dependency-free seeded PRNG so that quizzes are reproducible
// (e.g. "retake this exam") and unit tests are deterministic.

/** mulberry32 — fast, good-enough 32-bit seeded generator. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return function next() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export type Rng = () => number

/** Create an RNG. When no seed is given, derives one from the current time. */
export function createRng(seed?: number): Rng {
  const s = seed ?? Math.floor((Date.now() % 2147483647) * 16807) % 2147483647
  return mulberry32(s || 1)
}

/** In-place Fisher–Yates shuffle using the supplied RNG. Returns the array. */
export function shuffle<T>(arr: T[], rng: Rng): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/** Pick `n` distinct items uniformly at random (returns fewer if pool small). */
export function sample<T>(pool: readonly T[], n: number, rng: Rng): T[] {
  const copy = [...pool]
  shuffle(copy, rng)
  return copy.slice(0, Math.min(n, copy.length))
}

/**
 * Weighted sampling without replacement.
 * `weightOf` returns a non-negative weight for each item; higher weight ⇒
 * more likely to be drawn earlier. Used to honour domain blueprint weights.
 */
export function weightedSample<T>(
  pool: readonly T[],
  n: number,
  weightOf: (item: T) => number,
  rng: Rng,
): T[] {
  // Efract: assign each item a key = rng^(1/weight); take the largest keys.
  // (Efraimidis–Spirakis weighted reservoir sampling.)
  const keyed = pool.map((item) => {
    const w = Math.max(weightOf(item), 1e-9)
    const u = Math.max(rng(), 1e-12)
    return { item, key: Math.pow(u, 1 / w) }
  })
  keyed.sort((a, b) => b.key - a.key)
  return keyed.slice(0, Math.min(n, keyed.length)).map((k) => k.item)
}
