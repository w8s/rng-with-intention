# rng-with-intention

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
