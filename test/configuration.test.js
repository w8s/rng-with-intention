import { test } from 'node:test';
import assert from 'node:assert';
import { RngWithIntention } from '../src/RngWithIntention.js';
import { WORD, T0, freezeClock, controlEntropy } from './helpers/controls.js';

// What each ingredient of the seed does is tested in seed.test.js.

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

  await t.test('deterministic mode uses neither the clock nor the entropy source', async (sub) => {
    const clock = freezeClock(sub);
    const entropyRequests = controlEntropy(sub, (size, callNumber) => Buffer.alloc(size, callNumber));
    const rngi = new RngWithIntention({
      includeTimestamp: false,
      includeEntropy: false
    });

    const first = await rngi.draw('same intention', WORD);
    clock.setTime(T0 + 1000);
    const later = await rngi.draw('same intention', WORD);

    assert.equal(later.index, first.index, 'a later instant does not change the draw');
    assert.deepStrictEqual(entropyRequests, [], 'the entropy source is never asked');
  });
});
