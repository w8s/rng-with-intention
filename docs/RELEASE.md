# Release Process

This document describes how to create a new release for rng-with-intention.

## Prerequisites

- All changes committed and pushed to `main`
- Tests passing locally: `npm test`
- `CHANGELOG.md` updated with new version section
- npm Trusted Publishing configured (no token needed — uses OIDC)

## Release Steps

### 1. Update the changelog

Add a new section to `CHANGELOG.md` following Keep a Changelog format:

```markdown
## [0.4.0] - 2025-06-07

### Added
- ...

### Fixed
- ...
```

Also update the tag links at the bottom of `CHANGELOG.md`:

```markdown
[Unreleased]: https://github.com/w8s/rng-with-intention/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/w8s/rng-with-intention/compare/v0.3.3...v0.4.0
```

### 2. Bump version and push tag

```bash
npm version patch   # 0.3.3 -> 0.3.4 (bug fixes)
npm version minor   # 0.3.3 -> 0.4.0 (new features)
npm version major   # 0.3.3 -> 1.0.0 (breaking changes)

git push origin main --tags
```

### 3. Automation takes over 🤖

Pushing a `v*` tag triggers two workflows in parallel:

1. **Publish workflow** — runs tests, then publishes to npm via Trusted Publishing
2. **Release workflow** — creates a GitHub Release with notes extracted from `CHANGELOG.md`

Monitor at: https://github.com/w8s/rng-with-intention/actions

## Version Numbering

Following [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0): Breaking changes to public API
- **MINOR** (0.1.0): New features, backwards compatible
- **PATCH** (0.0.1): Bug fixes, backwards compatible

## Checklist

- [ ] `CHANGELOG.md` updated with new version section and tag links
- [ ] Tests pass locally (`npm test`)
- [ ] Version bumped with `npm version`
- [ ] Pushed to GitHub with tags (`git push origin main --tags`)
- [ ] Publish workflow completes successfully
- [ ] GitHub Release created with correct changelog notes

## Links

- npm package: https://www.npmjs.com/package/rng-with-intention
- GitHub releases: https://github.com/w8s/rng-with-intention/releases
- GitHub Actions: https://github.com/w8s/rng-with-intention/actions
