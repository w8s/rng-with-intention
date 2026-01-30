# GitHub Actions Setup Guide

## Automated npm Publishing Setup

To enable automated npm publishing, you need to configure an npm access token.

### Step 1: Create npm Access Token

1. Go to https://www.npmjs.com/settings/YOUR_USERNAME/tokens
2. Click "Generate New Token" → "Classic Token"
3. Select type: **Automation** (for CI/CD)
4. Copy the token (starts with `npm_...`)

### Step 2: Add Token to GitHub Secrets

1. Go to https://github.com/w8s/rng-with-intention/settings/secrets/actions
2. Click "New repository secret"
3. Name: `NPM_TOKEN`
4. Value: Paste your npm token
5. Click "Add secret"

### Step 3: Test the Workflow

After adding the secret, the next time you push a version tag, the publish workflow will automatically run:

```bash
npm version patch
git push origin main --tags
```

GitHub Actions will:
1. ✅ Run tests on Node 18, 20, 22
2. ✅ Publish to npm if tests pass
3. ✅ Add npm provenance (shows verified publisher)

## Workflows Included

### 1. CI Tests (`.github/workflows/test.yml`)
- **Triggers**: Every push and PR to main
- **Runs**: Tests on Node 18.x, 20.x, 22.x
- **Purpose**: Catch bugs before they reach production

### 2. npm Publishing (`.github/workflows/publish.yml`)
- **Triggers**: When you push a version tag (v*)
- **Runs**: Tests, then publishes to npm
- **Purpose**: Automated, safe releases

## Security Notes

- ✅ Token is encrypted in GitHub Secrets
- ✅ Only repository admins can view/edit secrets
- ✅ Token is never exposed in logs
- ✅ Provenance ensures package authenticity
- ✅ Tests must pass before publishing

## Troubleshooting

**Q: Publish fails with "authentication error"**  
A: Check that NPM_TOKEN secret is set correctly in repository settings

**Q: Tests fail on specific Node version**  
A: Update package.json engines if you want to drop support for that version

**Q: Want to publish manually instead?**  
A: Just run `npm publish` locally - the workflow won't interfere
