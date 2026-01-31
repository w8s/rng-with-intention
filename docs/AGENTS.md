# Development Notes for AI Agents

This document provides context for AI agents working on rng-with-intention.

## Project Context

**Purpose**: Random number generator using human intention as a seed for divination and contemplative practices  
**Current Version**: 0.3.2  
**Tech Stack**: JavaScript (ES modules), Web Crypto API, Node.js crypto  
**Primary Use Case**: Obsidian Tarot Practice plugin and similar divination tools

## Philosophy

This library bridges the gap between digital randomness and traditional divination practices. When someone shuffles tarot cards while focusing on a question, their intention becomes part of the ritual. Digital `Math.random()` feels hollow because it lacks this intentionality.

**Solution**: Use the user's intention (their question/focus) as part of the random seed, along with:
- Precise timestamp (millisecond accuracy)
- Cryptographic entropy (true randomness)

**Result**: Randomness that feels "shaped by intention" while remaining mathematically sound.

## Key Design Principles

1. **Intention as Primary Input** - Every draw requires an intention string
2. **Cryptographic Quality** - Uses Web Crypto API / Node.js crypto for security-grade randomness
3. **Cross-Platform** - Works in browsers (including mobile WebView) and Node.js
4. **Deterministic Options** - Can disable timestamp/entropy for reproducible results
5. **Privacy First** - Intentions are never stored, only used to seed that single moment
6. **Ephemeral by Design** - No state persists between draws

## Architecture Overview

### Core Flow

```
Intention String
      ↓
  Timestamp (optional)
      ↓
  Entropy (optional)
      ↓
   SHA-256 Hash
      ↓
  Convert to Number
      ↓
   Modulo max
      ↓
    Result
```

### Key Files

**src/RngWithIntention.js** - Main class, implements draw() and drawMultiple()  
**src/crypto-polyfill.js** - Cross-platform crypto abstraction layer  
**src/index.js** - Public exports

### Data Flow

1. User calls `rngi.draw("What do I need to know?", 78)`
2. RngWithIntention combines: intention + timestamp + entropy
3. SHA-256 hashes the combined seed
4. Hash converted to number via `readUInt32BE()`
5. Modulo operation maps to range: `hash % max`
6. Returns `{ index: number, timestamp: string }`

## Critical Implementation Details

### 1. Async Everything

**ALL RNG operations are async** due to cross-platform crypto requirements:

```javascript
// ✅ CORRECT
const result = await rngi.draw("intention", 78);

// ❌ WRONG - Will break
const result = rngi.draw("intention", 78);
```

**Why**: Web Crypto API is async, and we can't mix sync/async crypto sources.

### 2. Cross-Platform Crypto

**Challenge**: Node.js has `crypto` module, browsers have `crypto.subtle`

**Solution** (`crypto-polyfill.js`):
- Uses dynamic `import()` for Node.js crypto (prevents crashes on mobile)
- Falls back to Web Crypto API in browser environments
- All crypto operations are async

**Critical Pattern**:
```javascript
// ✅ Dynamic import (doesn't crash on mobile)
const nodeCrypto = await import('crypto');

// ❌ Static import (crashes in browser/mobile)
import crypto from 'crypto';
```

### 3. Deterministic Mode

Useful for testing and validation:

```javascript
const rngi = new RngWithIntention({
  includeTimestamp: false,  // Same intention = same result
  includeEntropy: false      // Fully deterministic
});
```

**Use case**: Validation scripts use this to get consistent results across runs.

## Development Workflow

### Standard Workflow

```bash
# Make changes
npm test                    # Fast unit tests
npm run validate:quick      # Quick sanity check
git add -A
git commit -m "description"
git push
```

### Before Release

```bash
npm test                        # Unit tests
npm run validate:all            # Statistical validation
# Update CHANGELOG.md
npm version patch/minor/major   # Bump version
git push origin main --tags     # Trigger CI/CD
```

See [docs/RELEASE.md](./RELEASE.md) for full release process.

## Testing Strategy

### Two Types of Tests

**1. Unit Tests** (`npm test`)
- Fast (~100ms)
- Run before every commit
- Test API contracts, error handling, basic functionality
- Located in `test/*.test.js`

**2. Validation Scripts** (`npm run validate:*`)
- Slow (1-30 seconds)
- Run manually when needed
- Verify statistical properties
- NOT required for deployment

**Coverage Validation** (`validate:quick`):
- Verifies all values 0 to N-1 are reachable
- Catches: off-by-one errors, stuck values, range bugs
- Does NOT verify: uniform probability

**Distribution Validation** (`validate:distribution`):
- Chi-square goodness-of-fit test
- Verifies uniform probability distribution
- Has ~5% false positive rate (statistical noise)

### Why Separate Tests from Validation?

Statistical tests require thousands of iterations and have inherent false positive rates. They're useful for verifying algorithm correctness but shouldn't block development.

## Common Patterns

### Drawing Single Values

```javascript
const rngi = new RngWithIntention();
const result = await rngi.draw("What do I need to know?", 78);
// Returns: { index: 42, timestamp: '2024-12-31T09:47:23.847Z' }
```

### Drawing Multiple Values

```javascript
// With duplicates (default)
const spread = await rngi.drawMultiple("Past, present, future", 78, 3);
// Returns: { indices: [5, 32, 67], timestamp: '...' }

// Without duplicates (unique values)
const unique = await rngi.drawMultiple("Celtic Cross", 78, 10, false);
// Returns: { indices: [5, 32, 67, ...], timestamp: '...' } // All different
```

### Deterministic Testing

```javascript
const rngi = new RngWithIntention({
  includeTimestamp: false,
  includeEntropy: false
});

// Always returns same result for same intention
const r1 = await rngi.draw("test", 100);
const r2 = await rngi.draw("test", 100);
// r1.index === r2.index (always true)
```

## Common Pitfalls

### 1. Forgetting `await`

```javascript
// ❌ WRONG - Returns a Promise, not a number
const result = rngi.draw("intention", 78);

// ✅ CORRECT
const result = await rngi.draw("intention", 78);
```

### 2. Using Static Imports for Node Crypto

```javascript
// ❌ WRONG - Crashes on mobile/browser
import crypto from 'crypto';

// ✅ CORRECT - Dynamic import with try/catch
try {
  const nodeCrypto = await import('crypto');
} catch (e) {
  // Fall back to Web Crypto API
}
```

### 3. Expecting Deterministic Results (By Default)

```javascript
// With default settings, these will be DIFFERENT:
const r1 = await rngi.draw("same intention", 78);
const r2 = await rngi.draw("same intention", 78);
// r1.index !== r2.index (timestamp + entropy differ)

// For deterministic results, disable timestamp and entropy
```

### 4. Chi-Square Test "Failures"

Chi-square tests have ~5% false positive rate. If validation fails once:
1. Run it again 2-3 times
2. If most runs pass, the RNG is fine
3. Statistical noise is expected

### 5. Modifying Validation Scripts

If you update validation scripts to test new features:
- Remember to use `includeTimestamp: false` and `includeEntropy: false`
- Use incrementing intentions: `${baseIntention}-${i}` for different draws
- Extract `result.index` from the return value

## Relationship to obsidian-tarot-practice

This library was created to support the Obsidian Tarot Practice plugin:
- Plugin uses this library for all card draws
- Plugin adds deck metadata, spreads, templates, and UI
- Plugin handles file operations, settings, and Obsidian integration
- This library handles ONLY the randomness logic

**Division of responsibilities**:
- **rng-with-intention**: Intention → Number
- **obsidian-tarot-practice**: Number → Card → Formatted Output

## Performance Characteristics

- **Draw speed**: ~50,000 draws/second on modern hardware
- **Bundle size**: ~3KB minified
- **Dependencies**: Zero runtime dependencies
- **Compatibility**: Node.js ≥18, all modern browsers

## Code Style

- ES modules (import/export)
- Async/await (no callbacks or promises directly)
- JSDoc comments for public API
- Clear error messages
- No external dependencies

## Documentation Standards

Following the project's documentation principles:

**README.md**:
- Keep under 500 lines (currently ~153 lines)
- Progressive disclosure (quick start → details)
- Practical examples before theory
- No implementation details (those go in source code comments)

**CHANGELOG.md**:
- Follow [Keep a Changelog](https://keepachangelog.com/) format
- Semantic versioning
- Include migration notes for breaking changes

**This file (AGENTS.md)**:
- Context for AI assistants
- Architecture and design decisions
- Common patterns and pitfalls
- Development workflow

## Future Considerations

Potential future enhancements (not currently planned):
- Support for other divination systems (I Ching, runes) via helper methods
- Streaming API for very large draw sets
- WebAssembly version for maximum performance
- Formal statistical analysis tools

## Questions or Issues?

- GitHub Issues: https://github.com/w8s/rng-with-intention/issues
- npm package: https://www.npmjs.com/package/rng-with-intention
- Primary maintainer: Todd Waits
