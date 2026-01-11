import { test } from 'node:test';
import assert from 'node:assert';
import { RngWithIntention } from '../src/RngWithIntention.js';

test('drawMultiple functionality', async (t) => {
  await t.test('draws multiple indices', () => {
    const rngi = new RngWithIntention();
    const result = rngi.drawMultiple('three card spread', 78, 3);
    
    assert.ok(Array.isArray(result.indices));
    assert.equal(result.indices.length, 3);
    assert.ok(result.hasOwnProperty('timestamp'));
    
    // Verify each index is in range
    result.indices.forEach(index => {
      assert.ok(index >= 0 && index < 78);
    });
  });

  await t.test('allows duplicates by default', () => {
    const rngi = new RngWithIntention({
      includeTimestamp: false,
      includeEntropy: false
    });
    
    // With small max, duplicates become likely
    const result = rngi.drawMultiple('duplicate test', 2, 10, true);
    assert.equal(result.indices.length, 10);
    
    // Check if we got any duplicates (statistically very likely)
    const unique = new Set(result.indices);
    // With only 2 possible values and 10 draws, we should see duplicates
    assert.ok(unique.size < 10);
  });

  await t.test('prevents duplicates when requested', () => {
    const rngi = new RngWithIntention();
    const result = rngi.drawMultiple('unique spread', 78, 10, false);
    
    // Verify all indices are unique
    const unique = new Set(result.indices);
    assert.equal(unique.size, 10);
  });

  await t.test('throws error when drawing more unique values than possible', () => {
    const rngi = new RngWithIntention();
    assert.throws(
      () => rngi.drawMultiple('impossible', 5, 10, false),
      /Cannot draw more unique values than max allows/
    );
  });

  await t.test('throws error for invalid count', () => {
    const rngi = new RngWithIntention();
    assert.throws(() => rngi.drawMultiple('test', 78, 0), /Count must be a positive integer/);
    assert.throws(() => rngi.drawMultiple('test', 78, -1), /Count must be a positive integer/);
    assert.throws(() => rngi.drawMultiple('test', 78, 1.5), /Count must be a positive integer/);
  });
});
