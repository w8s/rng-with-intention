# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.4] - 2026-10-22

### Fixed
- `drawMultiple(..., false)` could return duplicate indices when most or all of the range was requested (for example 10 of 10), because the retry loop gave up after `max * 2` attempts and pushed a duplicate anyway. It now draws among the still-unused indices instead.
  - Results that never reached the retry cap are unchanged, so deterministic mode returns the same indices as before in those cases.

### Documentation
- Reconciled this changelog with the npm history: added 0.3.2, marked 0.3.0 and 0.3.1 as git tags with no npm release, and corrected the BREAKING label on the internal `randomBytes()` helper.

## [0.3.3] - 2026-06-03

### Added
- TypeScript declarations (`src/index.d.ts`) — `RngWithIntention`, `RngWithIntentionOptions`, `DrawResult`, and `DrawMultipleResult` are now fully typed
- `types` field in `package.json` pointing to the declaration file

## [0.3.2] - 2026-01-30

First version published to npm since 0.2.2. It contains the library changes listed under 0.3.0 below.

### Fixed
- Publish workflow upgrades npm to a version that supports npm Trusted Publishing

## [0.3.1] - 2026-01-30

No npm release; this version exists only as a git tag. The library code is unchanged from 0.3.0.

### Changed
- Publish workflow migrated to npm Trusted Publishing (no token required)

## [0.3.0] - 2026-01-30

No npm release; this version exists only as a git tag. Its changes reached npm in 0.3.2.

### Changed
- The internal `randomBytes()` helper is now async and returns `Promise<Uint8Array>`
  - This change is required for proper mobile/browser compatibility
  - Not a breaking change for consumers: the package exports only `RngWithIntention`, so the helper was never part of the public API

### Fixed
- Restored mobile compatibility by using dynamic `import()` for Node.js crypto module
- Follows Node.js ESM best practices for optional module loading
- Prevents crashes on mobile platforms where Node.js crypto is unavailable
- Added comprehensive diagnostic tests for entropy generation

### Added
- GitHub Actions CI/CD workflows for automated testing and npm publishing
- Tests now run on Node.js 18, 20, and 22
- Entropy diagnostic test suite to validate cross-platform RNG behavior

## [0.2.2] - 2026-01-19

### Fixed
- Handle crypto module import failures gracefully for better browser compatibility

## [0.2.1] - 2026-01-19

### Fixed
- Remove top-level await for better build tool compatibility
- Improves compatibility with bundlers and build systems

## [0.2.0] - 2026-01-19

### Added
- **Browser and mobile support** with cross-platform crypto implementation
- Automatic fallback between Node.js crypto and Web Crypto API
- Full compatibility with web browsers and mobile environments

### Changed
- Refactored crypto implementation for platform independence

## [0.1.0] - 2026-01-10

### Added
- Initial release of intentional RNG library
- Core `draw()` method for single random number generation
- `drawMultiple()` method for drawing multiple values
- SHA-256 based seeding with intention + timestamp + entropy
- Configurable options for deterministic mode
- Comprehensive documentation and examples
- Node.js support (v18+)

[Unreleased]: https://github.com/w8s/rng-with-intention/compare/v0.3.4...HEAD
[0.3.4]: https://github.com/w8s/rng-with-intention/compare/v0.3.3...v0.3.4
[0.3.3]: https://github.com/w8s/rng-with-intention/compare/v0.3.2...v0.3.3
[0.3.2]: https://github.com/w8s/rng-with-intention/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/w8s/rng-with-intention/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/w8s/rng-with-intention/compare/v0.2.2...v0.3.0
[0.2.2]: https://github.com/w8s/rng-with-intention/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/w8s/rng-with-intention/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/w8s/rng-with-intention/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/w8s/rng-with-intention/releases/tag/v0.1.0
