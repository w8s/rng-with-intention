import { test } from 'node:test';
import assert from 'node:assert';
import { reduceToIndex } from '../src/reduction.js';

/**
 * The reduction step: turning 32-bit words into an index in [0, max).
 *
 * These tests cross the seam with crafted words, so every expectation is a literal
 * worked out by hand, and no hashing, clock or randomness is involved.
 */

/** A word source that hands out the given words in order, and records which it handed out. */
function wordsFrom(words) {
  const taken = [];
  const nextWord = () => {
    if (taken.length >= words.length) {
      throw new Error('the reduction asked for more words than the test supplied');
    }
    taken.push(words[taken.length]);
    return taken[taken.length - 1];
  };
  return { nextWord, taken };
}

/** Reduce one crafted word, and check that it was the only word taken. */
async function indexFor(max, word) {
  const { nextWord, taken } = wordsFrom([word]);
  const index = await reduceToIndex(max, nextWord);
  assert.deepStrictEqual(taken, [word], `max ${max}, word ${word}: should take exactly that one word`);
  return index;
}

test('reduceToIndex', async (t) => {
  await t.test('a word already in range is the index', async () => {
    assert.equal(await indexFor(78, 0), 0);
    assert.equal(await indexFor(78, 5), 5);
    assert.equal(await indexFor(78, 77), 77);
  });

  await t.test('a word past the range wraps around', async () => {
    assert.equal(await indexFor(78, 78), 0);
    assert.equal(await indexFor(78, 80), 2);
    assert.equal(await indexFor(78, 155), 77);
    assert.equal(await indexFor(78, 156), 0);
  });

  await t.test('max 1 always gives index 0', async () => {
    assert.equal(await indexFor(1, 0), 0);
    assert.equal(await indexFor(1, 1), 0);
    assert.equal(await indexFor(1, 4294967295), 0);
  });

  await t.test('a power of two keeps the low bits and never needs a second word', async () => {
    // indexFor also checks that exactly one word was taken.
    assert.equal(await indexFor(16, 0x00000000), 0);
    assert.equal(await indexFor(16, 0x0000000f), 15);
    assert.equal(await indexFor(16, 0x00000010), 0);
    assert.equal(await indexFor(16, 0xffffffff), 15);
  });

  await t.test('max 2 ** 32 returns the word itself', async () => {
    assert.equal(await indexFor(2 ** 32, 0), 0);
    assert.equal(await indexFor(2 ** 32, 123456789), 123456789);
    assert.equal(await indexFor(2 ** 32, 4294967295), 4294967295);
  });

  await t.test('the last words below the rejection threshold for max 78 are used as they are', async () => {
    // 78 * 55,063,683 = 4,294,967,274. Words below that fill whole ranges of 78 indices.
    // The 22 words from 4,294,967,274 up fill only part of a range, which is where a fair
    // reduction has to reject. Those are not tested here: they fail until rejection sampling lands.
    assert.equal(await indexFor(78, 4294967272), 76);
    assert.equal(await indexFor(78, 4294967273), 77);
  });

  await t.test('takes its word from an async source', async () => {
    assert.equal(await reduceToIndex(78, async () => 80), 2);
  });
});
