# Release Process

This document describes how to create a new release for rng-with-intention.

## Prerequisites

- Ensure all changes are committed and pushed to `main`
- Ensure tests pass: `npm test`
- Update CHANGELOG.md with new version section

## Release Steps

### 1. Update Version

```bash
# Bump version in package.json (choose one)
npm version patch   # 0.2.2 -> 0.2.3 (bug fixes)
npm version minor   # 0.2.2 -> 0.3.0 (new features)
npm version major   # 0.2.2 -> 1.0.0 (breaking changes)

# This automatically:
# - Updates package.json version
# - Creates a git commit
# - Creates a git tag
```

### 2. Push to GitHub

```bash
git push origin main --tags
```

### 3. Publish to npm

```bash
npm publish
```

### 4. Create GitHub Release

```bash
# Let GitHub auto-generate release notes from commits
gh release create vX.X.X --generate-notes

# Or create with custom notes
gh release create vX.X.X \
  --title "vX.X.X - Title" \
  --notes "## What's New

### Added/Fixed/Changed
- Feature or fix description

---

**Install:** \`npm install rng-with-intention\`  
**npm package:** https://www.npmjs.com/package/rng-with-intention"
```

## Version Numbering

Following [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0): Breaking changes to public API
- **MINOR** (0.1.0): New features, backwards compatible
- **PATCH** (0.0.1): Bug fixes, backwards compatible

## Checklist

- [ ] All tests pass
- [ ] CHANGELOG.md updated
- [ ] Version bumped with `npm version`
- [ ] Changes pushed to GitHub (with tags)
- [ ] Published to npm
- [ ] GitHub release created
- [ ] Release notes reviewed

## Links

- npm package: https://www.npmjs.com/package/rng-with-intention
- GitHub releases: https://github.com/w8s/rng-with-intention/releases
