# rng-with-intention

[![npm version](https://img.shields.io/npm/v/rng-with-intention.svg?color=green)](https://www.npmjs.com/package/rng-with-intention)
[![npm downloads](https://img.shields.io/npm/dm/rng-with-intention.svg)](https://www.npmjs.com/package/rng-with-intention)
[![Test](https://github.com/w8s/rng-with-intention/actions/workflows/test.yml/badge.svg)](https://github.com/w8s/rng-with-intention/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A random number generator seeded by human intention, designed for divination and contemplative practices.

## Philosophy

Digital randomness often feels hollow in spiritual or contemplative contexts because it lacks the intentionality present in physical practices like shuffling tarot cards or casting runes. This library bridges that gap by:

1. **Using intention as the primary input** — Your words, thoughts, or questions become part of the seed
2. **Capturing the precise moment** — The exact millisecond you submit your intention matters
3. **Remaining ephemeral** — Intentions are never stored, only used to seed that single draw
4. **Adding true randomness** — System entropy ensures the same intention at different moments produces different results

## Requirements

- Node.js >= 18.0.0
- Works in browser and Node.js environments (uses Web Crypto API / Node.js crypto)

## Installation

```bash
npm install rng-with-intention
```

## Quick Start

```javascript
import { RngWithIntention } from 'rng-with-intention';

const rngi = new RngWithIntention();
const result = await rngi.draw("What do I need to know today?", 78);
console.log(result);
// { index: 42, timestamp: '2025-06-07T14:23:11.847Z' }
```

## Usage

### Single draw

```javascript
import { RngWithIntention } from 'rng-with-intention';

const rngi = new RngWithIntention();

// Draw one card from a 78-card tarot deck (returns index 0–77)
const result = await rngi.draw("What do I need to know today?", 78);
console.log(result.index);     // e.g. 42
console.log(result.timestamp); // ISO 8601 timestamp
```

### Multiple draws

```javascript
// Draw a 3-card spread (duplicates allowed by default)
const spread = await rngi.drawMultiple("Past, present, future", 78, 3);
console.log(spread.indices); // e.g. [5, 32, 67]

// Draw unique cards — no duplicates
const celtic = await rngi.drawMultiple("Celtic Cross", 78, 10, false);
```

### TypeScript

```typescript
import { RngWithIntention, DrawResult, DrawMultipleResult } from 'rng-with-intention';

const rngi = new RngWithIntention();

const card: DrawResult = await rngi.draw("What needs my attention?", 78);
const spread: DrawMultipleResult = await rngi.drawMultiple("Week ahead", 78, 3, false);
```

### Deterministic mode

```javascript
// Disable timestamp and entropy for reproducible draws
const rngi = new RngWithIntention({
  includeTimestamp: false,
  includeEntropy: false
});

// Same intention always produces the same result
const a = await rngi.draw("test", 100);
const b = await rngi.draw("test", 100);
// a.index === b.index (always true)
```

## API

### `new RngWithIntention(options?)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `includeTimestamp` | `boolean` | `true` | Include current timestamp in seed |
| `includeEntropy` | `boolean` | `true` | Include cryptographic system entropy in seed |

### `draw(intention, max): Promise<DrawResult>`

Draw a single random index.

| Parameter | Type | Description |
|-----------|------|-------------|
| `intention` | `string` | Your question, focus, or intention |
| `max` | `number` | Upper bound (exclusive) — returns index in `[0, max)` |

Returns `{ index: number, timestamp: string }`.

### `drawMultiple(intention, max, count, allowDuplicates?): Promise<DrawMultipleResult>`

Draw multiple random indices with a single intention.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `intention` | `string` | — | Your question, focus, or intention |
| `max` | `number` | — | Upper bound (exclusive) |
| `count` | `number` | — | Number of indices to draw |
| `allowDuplicates` | `boolean` | `true` | Whether the same index may appear more than once |

Returns `{ indices: number[], timestamp: string }`.

## Use Cases

- **Tarot** — Digital card draws with intentionality
- **Oracle cards** — Any deck-based divination system
- **I Ching** — Hexagram generation
- **Rune casting** — Random rune selection
- **Creative constraints** — Intentional prompts for writing, art, or music
- **Journaling** — Daily prompts seeded by your current state

## Development

```bash
npm test                        # Unit tests (Node 18, 20, 22)
npm run validate:quick          # RNG coverage check (~1s)
npm run validate:distribution   # Chi-square uniformity test (~30s)
npm run validate:all            # All validation
```

## Related Projects

- [obsidian-tarot-practice](https://github.com/w8s/obsidian-tarot-practice) — Obsidian plugin for tarot readings using this library
- [obsidian-tarot-decks](https://github.com/w8s/obsidian-tarot-decks) — Public domain divination decks (Runes, Lenormand, I Ching)

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history.

## License

MIT
