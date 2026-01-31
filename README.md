# rng-with-intention

[![npm version](https://badge.fury.io/js/rng-with-intention.svg)](https://www.npmjs.com/package/rng-with-intention)
[![npm downloads](https://img.shields.io/npm/dm/rng-with-intention.svg)](https://www.npmjs.com/package/rng-with-intention)
[![Test](https://github.com/w8s/rng-with-intention/actions/workflows/test.yml/badge.svg)](https://github.com/w8s/rng-with-intention/actions/workflows/test.yml)
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

## Requirements

- Node.js >= 18.0.0
- Works in browser and Node.js environments (uses Web Crypto API / Node crypto)

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

## Development

### Testing

```bash
npm test  # Fast unit tests
```

### Validation (Optional)

Verify RNG statistical properties when making algorithm changes or before releases:

```bash
npm run validate:quick          # Coverage test (~1s)
npm run validate:distribution   # Uniformity test (~30s)
npm run validate:all            # All tests
```

**Coverage** - Verifies all values are reachable (no stuck values)  
**Distribution** - Chi-square uniformity test (has ~5% false positive rate)

## Related Projects

- [obsidian-tarot-practice](https://github.com/w8s/obsidian-tarot-practice) - Obsidian plugin for tarot readings using this library
- [obsidian-tarot-decks](https://github.com/w8s/obsidian-tarot-decks) - Public domain divination decks (Runes, Lenormand, I Ching)

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history and release notes.

## License

MIT

## Contributing

Issues and pull requests welcome! This library aims to remain simple and focused.

For development context and patterns, see [docs/AGENTS.md](./docs/AGENTS.md).
