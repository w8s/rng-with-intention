# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/w8s/rng-with-intention/compare/v0.2.2...HEAD
[0.2.2]: https://github.com/w8s/rng-with-intention/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/w8s/rng-with-intention/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/w8s/rng-with-intention/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/w8s/rng-with-intention/releases/tag/v0.1.0
