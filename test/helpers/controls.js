import { mock } from 'node:test';
import nodeCrypto from 'node:crypto';
import { syncBuiltinESMExports } from 'node:module';

/**
 * Controls for the two inputs to a draw that change on their own: the clock and the
 * entropy source. With both fixed, a draw is a pure function of what the test chose,
 * so a test can see exactly what each ingredient does and cannot fail by chance.
 *
 * Both are undone when the test that asked for them ends.
 */

/** Passing this as `max` makes the index the whole 32-bit word taken from the hash. */
export const WORD = 2 ** 32;

/** The instant the frozen clock starts at. */
export const T0 = Date.parse('2026-01-01T00:00:00.000Z');

/**
 * Freeze `Date` at `at`. Returns `setTime(ms)` to move the frozen clock.
 * @param {import('node:test').TestContext} t
 * @param {number} [at]
 */
export function freezeClock(t, at = T0) {
  mock.timers.enable({ apis: ['Date'], now: at });
  t.after(() => mock.timers.reset());
  return { setTime: (ms) => mock.timers.setTime(ms) };
}

/**
 * Replace the library's entropy source. `nextBytes(size, callNumber)` returns the bytes for
 * each request; `callNumber` counts from 1. Returns the list of sizes requested, so a test
 * can also see whether the source was asked at all.
 *
 * In 0.3.x the library draws entropy from node:crypto's randomBytes, so that is what is
 * replaced. When 0.4.0 moves to global Web Crypto, this is the one place to retarget
 * (globalThis.crypto.getRandomValues).
 *
 * @param {import('node:test').TestContext} t
 * @param {(size: number, callNumber: number) => Uint8Array} nextBytes
 * @returns {number[]}
 */
export function controlEntropy(t, nextBytes) {
  const requested = [];
  const replaced = mock.method(nodeCrypto, 'randomBytes', (size) => {
    requested.push(size);
    return nextBytes(size, requested.length);
  });
  // The library reads randomBytes through the ES module namespace of node:crypto, which
  // only follows a change to the CommonJS export object once it is told to.
  syncBuiltinESMExports();
  t.after(() => {
    replaced.mock.restore();
    syncBuiltinESMExports();
  });
  return requested;
}
