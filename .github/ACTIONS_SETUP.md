# GitHub Actions Setup

This document explains the one-time setup needed for automated publishing.

## Workflows

This repository has three GitHub Actions workflows:

### 1. Test (`test.yml`)
- **Triggers:** Every push to `main`, every PR
- **Purpose:** Runs `npm test` on Node 18, 20, and 22
- **Setup Required:** None - works automatically

### 2. Publish to npm (`publish.yml`)
- **Triggers:** When you push a version tag (e.g., `v0.2.3`)
- **Purpose:** Automatically publishes to npm after tests pass
- **Setup Required:** NPM_TOKEN (one-time, see below)

### 3. GitHub Release (`release.yml`)
- **Triggers:** When you push a version tag (e.g., `v0.2.3`)
- **Purpose:** Creates GitHub release with auto-generated notes
- **Setup Required:** None - uses built-in GitHub token

## One-Time Setup: NPM_TOKEN

To enable automated npm publishing, you need to add your npm access token to GitHub Secrets.

### Step 1: Create npm Access Token

1. Go to https://www.npmjs.com/
2. Click your profile → Access Tokens
3. Click "Generate New Token" → "Classic Token"
4. Select "Automation" type
5. Copy the token (starts with `npm_...`)

### Step 2: Add Token to GitHub Secrets

1. Go to https://github.com/w8s/rng-with-intention/settings/secrets/actions
2. Click "New repository secret"
3. Name: `NPM_TOKEN`
4. Value: Paste the token from Step 1
5. Click "Add secret"

### Step 3: Test the Setup

1. Make a small change (e.g., update README)
2. Run `npm version patch`
3. Run `git push origin main --tags`
4. Watch the Actions tab: https://github.com/w8s/rng-with-intention/actions

If everything works, you'll see:
- ✅ Tests pass
- ✅ Package published to npm
- ✅ GitHub release created

## Security Notes

- The NPM_TOKEN has "Automation" scope - it can only publish, not delete
- The token is encrypted in GitHub Secrets
- Only the publish workflow has access to it
- You can revoke/rotate the token anytime at npmjs.com

## Troubleshooting

**"npm publish" fails with 403 error:**
- Check that NPM_TOKEN is correctly set in GitHub Secrets
- Verify the token hasn't expired
- Ensure you have publish permissions for the package

**Tests fail but local tests pass:**
- Check that package-lock.json is committed
- Verify Node version compatibility (18+)
- Review the Actions logs for details

**Release not created:**
- Ensure the tag follows `v*` format (e.g., `v0.2.3`, not `0.2.3`)
- Check that you pushed the tag: `git push --tags`
- Verify GitHub Actions are enabled in repo settings

## Benefits

✅ **Consistent releases** - Same process every time  
✅ **Tested before publish** - Catches bugs automatically  
✅ **Time saved** - No manual npm publish steps  
✅ **Transparency** - All actions logged publicly  
✅ **Free** - Unlimited minutes on public repos
