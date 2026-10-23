import { test } from 'node:test';
import assert from 'node:assert';
import { RngWithIntention } from '../src/RngWithIntention.js';
import { WORD, T0, freezeClock, controlEntropy } from './helpers/controls.js';

/**
 * What goes into the seed, tested without chance.
 *
 * A draw's seed is the intention, the timestamp and system entropy, joined and hashed.
 * Each test below fixes the ingredients it is not about (the clock is frozen, the entropy
 * source is replaced), so every draw is a pure function of the inputs the test chose.
 *
 * Drawing with max = 2 ** 32 makes the index the whole 32-bit word taken from the hash.
 * Two different seeds then give two different indices unless their hashes share all 32
 * bits. The inputs here are fixed, so that is a fact about these inputs, settled when the
 * test was written. It is not re-rolled on each run.
 */

test('The seed is the intention, the timestamp and system entropy', async (t) => {
  await t.test('the intention is part of the seed', async () => {
    const rngi = new RngWithIntention({ includeTimestamp: false, includeEntropy: false });
    const intentions = ['intention A', 'intention B', 'intention C', 'one card', 'three card spread'];

    const words = [];
    for (const intention of intentions) {
      words.push((await rngi.draw(intention, WORD)).index);
    }

    assert.equal(new Set(words).size, intentions.length, 'every intention gives its own word');
    assert.equal(
      (await rngi.draw('intention A', WORD)).index,
      words[0],
      'the same intention gives the same word again'
    );
  });

  await t.test('the timestamp is part of the seed', async (sub) => {
    const clock = freezeClock(sub);
    const rngi = new RngWithIntention({ includeEntropy: false });

    const first = await rngi.draw('same intention', WORD);
    const sameInstant = await rngi.draw('same intention', WORD);
    clock.setTime(T0 + 1);
    const nextMillisecond = await rngi.draw('same intention', WORD);

    assert.equal(first.timestamp, '2026-01-01T00:00:00.000Z');
    assert.equal(nextMillisecond.timestamp, '2026-01-01T00:00:00.001Z');
    assert.equal(sameInstant.index, first.index, 'the same intention at the same instant is the same seed');
    assert.notEqual(nextMillisecond.index, first.index, 'one millisecond later is a different seed');
  });

  await t.test('system entropy is part of the seed', async (sub) => {
    // The entropy source answers 0x01, 0x01, then 0x02.
    const answers = [0x01, 0x01, 0x02];
    controlEntropy(sub, (size, callNumber) => Buffer.alloc(size, answers[callNumber - 1]));
    const rngi = new RngWithIntention({ includeTimestamp: false });

    const first = await rngi.draw('same intention', WORD);
    const sameEntropy = await rngi.draw('same intention', WORD);
    const otherEntropy = await rngi.draw('same intention', WORD);

    assert.equal(sameEntropy.index, first.index, 'the same entropy is the same seed');
    assert.notEqual(otherEntropy.index, first.index, 'different entropy is a different seed');
  });

  await t.test('in default mode, changing any one of the three changes the seed', async (sub) => {
    const clock = freezeClock(sub);
    let entropyByte = 0x01;
    controlEntropy(sub, (size) => Buffer.alloc(size, entropyByte));
    const rngi = new RngWithIntention();
    const draw = async (intention) => (await rngi.draw(intention, WORD)).index;

    const base = await draw('same intention');
    assert.equal(await draw('same intention'), base, 'nothing changed, so the word is the same');

    assert.notEqual(await draw('another intention'), base, 'a different intention');

    clock.setTime(T0 + 1);
    assert.notEqual(await draw('same intention'), base, 'a different timestamp');

    clock.setTime(T0);
    entropyByte = 0x02;
    assert.notEqual(await draw('same intention'), base, 'different entropy');
  });
});
