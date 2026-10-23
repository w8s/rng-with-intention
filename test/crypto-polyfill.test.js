import { test } from 'node:test';
import assert from 'node:assert';
import { randomBytes, sha256, bytesToHex } from '../src/crypto-polyfill.js';

test('crypto-polyfill', async (t) => {
  await t.test('randomBytes returns the requested number of bytes', async () => {
    for (const size of [1, 16, 32]) {
      const bytes = await randomBytes(size);
      assert.ok(bytes instanceof Uint8Array, `${size} bytes should be a Uint8Array`);
      assert.equal(bytes.length, size);
    }
  });

  await t.test('randomBytes does not repeat across calls', async () => {
    // This can only fail if two of ten random 128-bit values are equal. That chance is
    // about 2 ** -123, which is to say it does not happen.
    const seen = new Set();
    for (let i = 0; i < 10; i++) {
      seen.add(bytesToHex(await randomBytes(16)));
    }
    assert.equal(seen.size, 10, 'ten calls should give ten different values');
  });

  await t.test('sha256 matches the published test vectors', async () => {
    // FIPS 180-4 / NIST examples. Whichever implementation sits behind sha256 (node:crypto
    // today, Web Crypto from 0.4.0) must give these exact bytes.
    assert.equal(
      bytesToHex(await sha256('')),
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    );
    assert.equal(
      bytesToHex(await sha256('abc')),
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
    );
  });
});
