/**
 * Cross-platform crypto utilities
 * Works in both Node.js (Electron desktop) and browser (mobile WebView) environments
 * 
 * Per Node.js docs: https://nodejs.org/api/crypto.html#determining-if-crypto-support-is-unavailable
 * ESM requires dynamic import() in try/catch to handle missing crypto module gracefully
 */

// Cache for Node.js crypto - only populated on desktop
let nodeCrypto = null;
let nodeCryptoLoadAttempted = false;

/**
 * Attempt to load Node.js crypto module
 * Returns null on mobile/browser or if crypto support unavailable
 * @returns {Promise<Object|null>}
 */
async function tryLoadNodeCrypto() {
  if (nodeCryptoLoadAttempted) {
    return nodeCrypto;
  }
  
  nodeCryptoLoadAttempted = true;
  
  // Check if we're in Node.js environment
  if (typeof process === 'undefined' || !process.versions || !process.versions.node) {
    return null;
  }
  
  try {
    // Per Node.js docs: Use dynamic import() for ESM to handle missing crypto gracefully
    // This prevents crashes on mobile where 'node:crypto' doesn't exist
    nodeCrypto = await import('node:crypto');
    return nodeCrypto;
  } catch (err) {
    // Mobile browser, or Node.js built without crypto support
    console.warn('Node.js crypto module not available, falling back to Web Crypto API');
    return null;
  }
}

/**
 * Get random bytes - works in both Node.js and browser
 * @param {number} size - Number of bytes to generate
 * @returns {Promise<Uint8Array>} Random bytes
 */
export async function randomBytes(size) {
  // Try Node.js crypto first (desktop Electron)
  const crypto = await tryLoadNodeCrypto();
  if (crypto && crypto.randomBytes) {
    return crypto.randomBytes(size);
  }
  
  // Fallback to Web Crypto API (mobile browsers)
  const bytes = new Uint8Array(size);
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(bytes);
    return bytes;
  } else if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
    return bytes;
  } else {
    throw new Error('No crypto implementation available');
  }
}

/**
 * Create SHA-256 hash - works in both Node.js and browser
 * @param {string} data - Data to hash
 * @returns {Promise<Uint8Array>} Hash bytes
 */
export async function sha256(data) {
  // Try Node.js crypto first (desktop Electron)
  const crypto = await tryLoadNodeCrypto();
  if (crypto && crypto.createHash) {
    return crypto.createHash('sha256').update(data).digest();
  }
  
  // Fallback to Web Crypto API (mobile browsers)
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBuffer);
    return new Uint8Array(hashBuffer);
  } else if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    return new Uint8Array(hashBuffer);
  } else {
    throw new Error('No crypto implementation available');
  }
}

/**
 * Convert bytes to hex string
 * @param {Uint8Array} bytes - Bytes to convert
 * @returns {string} Hex string
 */
export function bytesToHex(bytes) {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Read a 32-bit unsigned integer from bytes (big-endian)
 * @param {Uint8Array} bytes - Bytes to read from
 * @param {number} offset - Offset to start reading
 * @returns {number} 32-bit unsigned integer
 */
export function readUInt32BE(bytes, offset = 0) {
  return ((bytes[offset] << 24) >>> 0) + 
         ((bytes[offset + 1] << 16) >>> 0) + 
         ((bytes[offset + 2] << 8) >>> 0) + 
         (bytes[offset + 3] >>> 0);
}
