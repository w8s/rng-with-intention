import { test } from 'node:test';
import assert from 'node:assert';
import { RngWithIntention } from '../src/index.js';

/**
 * Diagnostic test to understand the entropy issue
 * 
 * Problem: When drawing with the same intention multiple times,
 * we're seeing only 13% unique values instead of expected 80%+
 * 
 * This test helps us understand WHY that's happening
 */

test('Entropy diagnostic', async (t) => {
  await t.test('baseline - verify draws happen at all', async () => {
    const rngi = new RngWithIntention();
    const result = await rngi.draw('test', 100);
    assert.ok(result.index >= 0 && result.index < 100);
  });

  await t.test('show what actual entropy values look like', async () => {
    const rngi = new RngWithIntention();
    const results = [];
    
    console.log('\n=== Testing 20 draws with same intention ===');
    for (let i = 0; i < 20; i++) {
      const result = await rngi.draw('same intention', 1000);
      results.push(result);
      console.log(`Draw ${i + 1}: index=${result.index}, timestamp=${result.timestamp}`);
    }
    
    const indices = results.map(r => r.index);
    const unique = new Set(indices);
    const timestamps = results.map(r => r.timestamp);
    const uniqueTimestamps = new Set(timestamps);
    
    console.log(`\n=== Results ===`);
    console.log(`Total draws: ${results.length}`);
    console.log(`Unique indices: ${unique.size} (${(unique.size/results.length*100).toFixed(1)}%)`);
    console.log(`Unique timestamps: ${uniqueTimestamps.size}`);
    console.log(`Index values: [${indices.join(', ')}]`);
    
    // Check if timestamps are all identical
    if (uniqueTimestamps.size === 1) {
      console.log(`\n⚠️  PROBLEM: All timestamps are IDENTICAL!`);
      console.log(`This means entropy is the ONLY source of randomness`);
    }
  });

  await t.test('test entropy generation directly', async () => {
    // Import the crypto polyfill directly
    const { randomBytes, bytesToHex } = await import('../src/crypto-polyfill.js');
    
    console.log('\n=== Testing randomBytes directly ===');
    const entropyValues = [];
    for (let i = 0; i < 10; i++) {
      const bytes = await randomBytes(16);  // Now async!
      const hex = bytesToHex(bytes);
      entropyValues.push(hex);
      console.log(`Entropy ${i + 1}: ${hex}`);
    }
    
    const uniqueEntropy = new Set(entropyValues);
    console.log(`\nUnique entropy values: ${uniqueEntropy.size}/10`);
    
    assert.strictEqual(uniqueEntropy.size, 10, 'All entropy values should be unique');
  });

  await t.test('test hash output distribution', async () => {
    const { sha256, bytesToHex } = await import('../src/crypto-polyfill.js');
    
    console.log('\n=== Testing SHA256 with same input ===');
    const hash1 = await sha256('test::timestamp::entropy1');
    const hash2 = await sha256('test::timestamp::entropy1');
    const hash3 = await sha256('test::timestamp::entropy2');
    
    console.log(`Same input hash 1: ${bytesToHex(hash1).substring(0, 16)}...`);
    console.log(`Same input hash 2: ${bytesToHex(hash2).substring(0, 16)}...`);
    console.log(`Diff input hash 3: ${bytesToHex(hash3).substring(0, 16)}...`);
    
    assert.deepStrictEqual(hash1, hash2, 'Same input should produce same hash');
    assert.notDeepStrictEqual(hash1, hash3, 'Different input should produce different hash');
  });

  await t.test('test modulo distribution', async () => {
    console.log('\n=== Testing modulo bias ===');
    
    const { readUInt32BE } = await import('../src/crypto-polyfill.js');
    const { sha256 } = await import('../src/crypto-polyfill.js');
    
    // Simulate what happens in draw()
    const testInputs = [
      'intent::2024-01-01T00:00:00.000Z::aaaa',
      'intent::2024-01-01T00:00:00.000Z::bbbb',
      'intent::2024-01-01T00:00:00.000Z::cccc',
      'intent::2024-01-01T00:00:00.000Z::dddd',
      'intent::2024-01-01T00:00:00.000Z::eeee'
    ];
    
    for (const input of testInputs) {
      const hash = await sha256(input);
      const uint32 = readUInt32BE(hash, 0);
      const index = uint32 % 1000;
      console.log(`Input: ${input.split('::')[2]} -> uint32: ${uint32} -> index: ${index}`);
    }
  });

  await t.test('rapid-fire draws (no delays)', async () => {
    const rngi = new RngWithIntention();
    const results = [];
    
    console.log('\n=== Testing 30 rapid draws (tight loop) ===');
    const startTime = Date.now();
    
    for (let i = 0; i < 30; i++) {
      results.push(await rngi.draw('same intention', 1000));
    }
    
    const elapsed = Date.now() - startTime;
    
    const indices = results.map(r => r.index);
    const unique = new Set(indices);
    const timestamps = results.map(r => r.timestamp);
    const uniqueTimestamps = new Set(timestamps);
    
    console.log(`\nCompleted in: ${elapsed}ms`);
    console.log(`Total draws: ${results.length}`);
    console.log(`Unique indices: ${unique.size} (${(unique.size/results.length*100).toFixed(1)}%)`);
    console.log(`Unique timestamps: ${uniqueTimestamps.size}`);
    
    if (uniqueTimestamps.size === 1) {
      console.log(`\n⚠️  ALL TIMESTAMPS IDENTICAL - This is the problem!`);
      console.log(`When all timestamps match, entropy is the only randomness source`);
      console.log(`But we're seeing duplicates, which means entropy isn't being regenerated!`);
      
      // Show first few draws
      console.log(`\nFirst 5 draws:`);
      for (let i = 0; i < 5; i++) {
        console.log(`  ${i + 1}. index=${results[i].index}, ts=${results[i].timestamp}`);
      }
    }
    
    // This might fail - that's the point, we want to see it fail
    console.log(`\nExpected: >=80% unique, Got: ${(unique.size/results.length*100).toFixed(1)}%`);
  });
});
