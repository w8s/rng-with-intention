import { test } from 'node:test';
import assert from 'node:assert';
import { RngWithIntention } from '../src/RngWithIntention.js';

test('Configuration options', async (t) => {
  await t.test('deterministic mode produces same results', async () => {
    const rngi = new RngWithIntention({
      includeTimestamp: false,
      includeEntropy: false
    });
    
    const result1 = await rngi.draw('same intention', 1000);
    const result2 = await rngi.draw('same intention', 1000);
    
    assert.equal(result1.index, result2.index, 
      'Same intention should produce same index in deterministic mode');
  });

  await t.test('different intentions produce different results in deterministic mode', async () => {
    const rngi = new RngWithIntention({
      includeTimestamp: false,
      includeEntropy: false
    });
    
    const result1 = await rngi.draw('intention A', 1000);
    const result2 = await rngi.draw('intention B', 1000);
    
    // Statistically very likely to be different
    assert.notEqual(result1.index, result2.index);
  });

  await t.test('timestamp-only mode produces different results over time', async () => {
    const rngi = new RngWithIntention({
      includeTimestamp: true,
      includeEntropy: false
    });
    
    const result1 = await rngi.draw('same intention', 1000);
    
    // Wait a few milliseconds
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const result2 = await rngi.draw('same intention', 1000);
    
    // Should be different due to timestamp
    assert.notEqual(result1.timestamp, result2.timestamp);
    // Indices likely different (but not guaranteed)
  });

  await t.test('default mode includes both timestamp and entropy', async () => {
    const rngi = new RngWithIntention();
    
    // Even same intention at "same" time should differ due to entropy
    const results = [];
    for (let i = 0; i < 5; i++) {
      results.push(await rngi.draw('same intention', 1000));
    }
    
    // Check that we got at least some variation
    const unique = new Set(results.map(r => r.index));
    assert.ok(unique.size > 1, 'Should get different results due to entropy');
  });
});
