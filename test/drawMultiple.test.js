import { test } from 'node:test';
import assert from 'node:assert';
import { RngWithIntention } from '../src/RngWithIntention.js';
import { freezeClock } from './helpers/controls.js';

test('drawMultiple functionality', async (t) => {
  await t.test('draws multiple indices', async () => {
    const rngi = new RngWithIntention();
    const result = await rngi.drawMultiple('three card spread', 78, 3);
    
    assert.ok(Array.isArray(result.indices));
    assert.equal(result.indices.length, 3);
    assert.ok(result.hasOwnProperty('timestamp'));
    
    // Verify each index is in range
    result.indices.forEach(index => {
      assert.ok(index >= 0 && index < 78);
    });
  });

  await t.test('allows duplicates by default', async () => {
    const rngi = new RngWithIntention({
      includeTimestamp: false,
      includeEntropy: false
    });
    
    // With small max, duplicates become likely
    const result = await rngi.drawMultiple('duplicate test', 2, 10, true);
    assert.equal(result.indices.length, 10);
    
    // Check if we got any duplicates (statistically very likely)
    const unique = new Set(result.indices);
    // With only 2 possible values and 10 draws, we should see duplicates
    assert.ok(unique.size < 10);
  });

  await t.test('prevents duplicates when requested', async () => {
    const rngi = new RngWithIntention();
    const result = await rngi.drawMultiple('unique spread', 78, 10, false);
    
    // Verify all indices are unique
    const unique = new Set(result.indices);
    assert.equal(unique.size, 10);
  });

  await t.test('unique draws of every value are a permutation, never a duplicate', async () => {
    // Deterministic mode, so the outcome depends only on the intention string.
    // count == max forces the last draws to collide with already-used indices,
    // which exercises the retry cap. Expected values are literals, not derived.
    const rngi = new RngWithIntention({
      includeTimestamp: false,
      includeEntropy: false
    });

    const cases = [
      { max: 5, expected: [0, 1, 2, 3, 4] },
      { max: 3, expected: [0, 1, 2] },
      { max: 2, expected: [0, 1] }
    ];

    for (const { max, expected } of cases) {
      for (let i = 0; i < 200; i++) {
        const result = await rngi.drawMultiple(`permutation ${i}`, max, max, false);
        const sorted = [...result.indices].sort((a, b) => a - b);
        assert.deepStrictEqual(
          sorted,
          expected,
          `max ${max}, intention "permutation ${i}" returned ${JSON.stringify(result.indices)}`
        );
      }
    }
  });

  await t.test('throws error when drawing more unique values than possible', async () => {
    const rngi = new RngWithIntention();
    await assert.rejects(
      async () => await rngi.drawMultiple('impossible', 5, 10, false),
      /Cannot draw more unique values than max allows/
    );
  });

  await t.test('throws error for invalid count', async () => {
    const rngi = new RngWithIntention();
    await assert.rejects(async () => await rngi.drawMultiple('test', 78, 0), /Count must be a positive integer/);
    await assert.rejects(async () => await rngi.drawMultiple('test', 78, -1), /Count must be a positive integer/);
    await assert.rejects(async () => await rngi.drawMultiple('test', 78, 1.5), /Count must be a positive integer/);
  });

  await t.test('returns its timestamp as an ISO 8601 UTC string', async (sub) => {
    // The clock is frozen at 2026-01-01T00:00:00.000Z (see helpers/controls.js), so the
    // expected value is a literal: UTC, millisecond precision, trailing Z.
    freezeClock(sub);
    const rngi = new RngWithIntention();

    const result = await rngi.drawMultiple('three card spread', 78, 3);

    assert.equal(result.timestamp, '2026-01-01T00:00:00.000Z');
  });

  await t.test('rejects a max that is not a positive integer', async () => {
    const rngi = new RngWithIntention();
    const badMaxes = [0, -1, 1.5, NaN, Infinity, '5'];

    // Duplicates allowed: only the max check can fire, so its message is pinned.
    for (const max of badMaxes) {
      await assert.rejects(
        async () => await rngi.drawMultiple('test', max, 2),
        /Max must be a positive integer/,
        `max ${String(max)} should be rejected`
      );
    }

    // Unique mode: the count-versus-max check can also fire (for 0, -1 and 1.5), so
    // only the rejection is pinned, not which message. Pinning the message would pin
    // the order the checks happen to run in.
    for (const max of badMaxes) {
      await assert.rejects(
        async () => await rngi.drawMultiple('test', max, 2, false),
        Error,
        `max ${String(max)} should be rejected in unique mode`
      );
    }
  });
});
