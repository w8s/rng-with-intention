# Entropy Bug Fix - Complete Summary

## Problem Discovered
While setting up GitHub Actions CI, we discovered the entropy validation test was consistently failing with only **13% unique values** when expecting 80%+.

## Root Cause
The issue was in `src/crypto-polyfill.js`:

**Before (broken):**
```javascript
let nodeCrypto = null;
async function getNodeCrypto() {
  nodeCrypto = await import('crypto');  // Failing silently
}
```

**After (fixed):**
```javascript
import { randomBytes, createHash } from 'crypto';  // Direct ESM import
```

The dynamic `import('crypto')` was failing in certain Node.js environments, causing `randomBytes()` to not generate fresh entropy. This led to duplicate values when multiple draws happened in the same millisecond.

## The Fix
Commit `4b7a5e9` - Switched from dynamic imports to direct ESM imports of Node.js crypto module. This works reliably in Node 18+.

## Verification
Created comprehensive diagnostic tests in `test/entropy-diagnostic.test.js` that verify:

✅ randomBytes() generates unique entropy every call  
✅ SHA256 hashing produces deterministic output  
✅ Modulo distribution is unbiased  
✅ Rapid-fire draws (30 in 0ms) achieve 100% uniqueness  

## Test Results
**Before fix:** 13% unique values (FAIL)  
**After fix:** 100% unique values (PASS) ✅

All 25 tests now passing, including:
- 6 basic functionality tests
- 4 configuration tests (including entropy validation)
- 5 drawMultiple tests
- 6 entropy diagnostic tests
- 4 other tests

## CI Status
✅ GitHub Actions running successfully  
✅ Tests passing on Node 18, 20, 22  
✅ Badge showing green in README  

## Branch
Feature branch: `fix/entropy-validation`  
Merged to main via: `git merge --no-ff`  
Commits:
- `527fc29` - Re-enable entropy test + add diagnostics
- `220b8b7` - Merge to main

## Next Steps
The entropy system is now working correctly. No further action needed on this bug.

---

**Key Lesson:** Dynamic imports can fail silently. Direct ESM imports are more reliable for built-in Node.js modules.
