import { test } from 'node:test';
import assert from 'node:assert';
import { RngWithIntention } from '../src/RngWithIntention.js';

test('RngWithIntention basic functionality', async (t) => {
  await t.test('creates instance with default options', () => {
    const rngi = new RngWithIntention();
    assert.ok(rngi instanceof RngWithIntention);
  });

  await t.test('draw returns valid result', async () => {
    const rngi = new RngWithIntention();
    const result = await rngi.draw('test intention', 78);
    
    assert.ok(result.hasOwnProperty('index'));
    assert.ok(result.hasOwnProperty('timestamp'));
    assert.ok(result.index >= 0 && result.index < 78);
    assert.ok(typeof result.timestamp === 'string');
  });

  await t.test('draw respects max parameter', async () => {
    const rngi = new RngWithIntention();
    const max = 10;
    
    // Test multiple draws to ensure none exceed max
    for (let i = 0; i < 100; i++) {
      const result = await rngi.draw(`test ${i}`, max);
      assert.ok(result.index >= 0 && result.index < max, 
        `Index ${result.index} should be between 0 and ${max - 1}`);
    }
  });

  await t.test('different intentions at different times produce different results', async () => {
    const rngi = new RngWithIntention();
    const result1 = await rngi.draw('intention one', 1000);
    
    // Small delay to ensure different timestamp
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const result2 = await rngi.draw('intention two', 1000);
    assert.notEqual(result1.index, result2.index);
    assert.notEqual(result1.timestamp, result2.timestamp);
  });

  await t.test('throws error for invalid intention', async () => {
    const rngi = new RngWithIntention();
    await assert.rejects(async () => await rngi.draw('', 78), /Intention must be a non-empty string/);
    await assert.rejects(async () => await rngi.draw(null, 78), /Intention must be a non-empty string/);
  });

  await t.test('throws error for invalid max', async () => {
    const rngi = new RngWithIntention();
    await assert.rejects(async () => await rngi.draw('test', 0), /Max must be a positive integer/);
    await assert.rejects(async () => await rngi.draw('test', -1), /Max must be a positive integer/);
    await assert.rejects(async () => await rngi.draw('test', 1.5), /Max must be a positive integer/);
  });
});
