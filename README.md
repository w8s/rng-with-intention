# rng-with-intention

[![npm version](https://badge.fury.io/js/rng-with-intention.svg)](https://www.npmjs.com/package/rng-with-intention)
[![npm downloads](https://img.shields.io/npm/dm/rng-with-intention.svg)](https://www.npmjs.com/package/rng-with-intention)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A random number generator that uses human intention as a seed, designed for divination and contemplative practices.

## Philosophy

Digital randomness often feels hollow in spiritual or contemplative contexts because it lacks the intentionality present in physical practices like shuffling tarot cards or casting runes. This library bridges that gap by:

1. **Using intention as the primary input** - Your words, thoughts, or questions become part of the randomness
2. **Capturing the precise moment** - The exact millisecond you submit your intention matters
3. **Remaining ephemeral** - Intentions are never stored, only used to seed that single moment
4. **Adding true randomness** - System entropy ensures the same intention at different moments produces different results

## Installation

```bash
npm install rng-with-intention
```

## Usage

### Basic usage

```javascript
import { RngWithIntention } from 'rng-with-intention';

const rngi = new RngWithIntention();

// Draw a single card from a 78-card tarot deck
const result = rngi.draw("What do I need to know today?", 78);
console.log(result);
// { index: 42, timestamp: '2024-12-31T09:47:23.847Z' }
```

### Drawing multiple values

```javascript
// Draw a 3-card spread
const spread = rngi.drawMultiple("Past, present, future", 78, 3);
console.log(spread);
// { indices: [5, 32, 67], timestamp: '2024-12-31T09:47:23.847Z' }

// Draw unique cards (no duplicates)
const uniqueSpread = rngi.drawMultiple("Celtic Cross", 78, 10, false);
```

### Configuration options

```javascript
// Disable timestamp (makes draws deterministic for same intention)
const deterministicRng = new RngWithIntention({
  includeTimestamp: false,
  includeEntropy: false
});

// Same intention will always produce same result
const result1 = deterministicRng.draw("test", 100);
const result2 = deterministicRng.draw("test", 100);
// result1.index === result2.index (always true)
```

## API

### `new RngWithIntention(options)`

Create a new instance with optional configuration.

**Options:**
- `includeTimestamp` (boolean, default: `true`) - Include timestamp in seed
- `includeEntropy` (boolean, default: `true`) - Include cryptographic randomness in seed

### `draw(intention, max)`

Draw a single random number.

**Parameters:**
- `intention` (string, required) - Your intention, question, or focus
- `max` (number, required) - Maximum value (exclusive, returns 0 to max-1)

**Returns:**
- `{ index: number, timestamp: string }`

### `drawMultiple(intention, max, count, allowDuplicates)`

Draw multiple random numbers with a single intention.

**Parameters:**
- `intention` (string, required) - Your intention
- `max` (number, required) - Maximum value for each draw
- `count` (number, required) - Number of values to draw
- `allowDuplicates` (boolean, default: `true`) - Whether to allow repeated indices

**Returns:**
- `{ indices: number[], timestamp: string }`

## Use Cases

- **Tarot readings** - Digital card draws with intentionality
- **Oracle cards** - Any deck-based divination system
- **I Ching** - Hexagram generation
- **Rune casting** - Random rune selection
- **Creative constraints** - Intentional prompts for writing, art, music
- **Journaling** - Daily prompts seeded by your current state
- **Decision making** - When you need the universe to weigh in

### Tarot Reading Example

```javascript
rngi.drawMultiple("Celtic Cross-- What is the universe needing to observe right now?", 78, 10, false);
{
  indices: [
    72, 56, 43, 46, 77,
    30, 64, 10, 44,  9
  ],
  timestamp: '2026-01-11T00:33:32.225Z'
}
```

Using standard Rider-Waite-Smith (RWS) ordering (0-77):

| Position | Meaning            | Index | Card              |
| -------: | ------------------ | :---: | ----------------- |
|        1 | Present situation  |  72   | Nine of Pentacles |
|        2 | Challenge/crossing |  56   | Ten of Swords     |
|        3 | Foundation/root    |  43   | Eight of Cups     |
|        4 | Recent past        |  46   | Page of Swords    |
|        5 | Crown/best outcome |  77   | King of Pentacles |
|        6 | Near future        |  30   | Five of Wands     |
|        7 | Self/attitude      |  64   | Ace of Pentacles  |
|        8 | Environment/others |  10   | Wheel of Fortune  |
|        9 | Hopes/fears        |  44   | Ten of Cups       |
|       10 | Outcome            |   9   | The Hermit        |

## Sample Read

- Heavy Pentacles energy (4 cards) - material world, manifestation, resources
- Two Tens (completion, cycles ending)
- The question "what does the universe need to observe" with The Hermit as outcome feels *very* intentional

The universe is watching someone in self-sufficient abundance (Nine of Pentacles) face a painful ending (Ten of Swords crossing). The foundation is walking away from what no longer serves (Eight of Cups).

Through conflict/competition (Five of Wands ahead), while holding new material potential (Ace of Pentacles) and experiencing major turning points (Wheel of Fortune in environment), there's a tension between hoping for/fearing emotional fulfillment (Ten of Cups).

The universe's observation point (The Hermit outcome): This is about witnessing someone's journey to solitary wisdom. The universe needs to observe the process of someone learning to be alone with their truth.

## How It Works

1. You provide an intention (any string)
2. The exact timestamp is captured (down to milliseconds)
3. System entropy is added (cryptographic randomness)
4. These are combined and hashed with SHA-256
5. The hash is converted to a number in your desired range
6. The intention is discarded (never stored)

The result is randomness that feels **shaped by your intention** rather than purely mechanical.

## License

MIT

## Contributing

Issues and pull requests welcome! This library aims to remain simple and focused.
