/**
 * The reduction step: turns 32-bit words into an index in [0, max).
 *
 * This is the seam between where a draw's randomness comes from (a word source) and how it
 * becomes an index. Production hands it words taken from the seed's hash; tests hand it
 * crafted words, so the step can be checked exactly, without hashing, clocks or chance.
 *
 * @param {number} max - A positive integer, at most 2 ** 32. Not checked here; draw() validates it.
 * @param {() => number | Promise<number>} nextWord - Returns the next 32-bit unsigned integer.
 * @returns {Promise<number>} An index in [0, max)
 */
export async function reduceToIndex(max, nextWord) {
  const word = await nextWord();
  return word % max;
}
