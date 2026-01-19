/**
 * Cross-platform crypto utilities
 * Works in both Node.js (Electron) and browser (mobile WebView) environments
 */

// Detect environment
const isNode = typeof process !== 'undefined' && 
               process.versions != null && 
               process.versions.node != null;

// Lazy-load Node crypto only when needed
let nodeCrypto = null;
let nodeCryptoLoadAttempted = false;

async function getNodeCrypto() {
  if (!nodeCryptoLoadAttempted && isNode) {
    nodeCryptoLoadAttempted = true;
    try {
      nodeCrypto = await import('crypto');
    } catch (e) {
      // Crypto module not available (browser environment masquerading as Node)
      nodeCrypto = null;
    }
  }
  return nodeCrypto;
}

/**
 * Get random bytes - works in both Node.js and browser
 * @param {number} size - Number of bytes to generate
 * @returns {Promise<Uint8Array>} Random bytes
 */
export async function randomBytes(size) {
  if (isNode) {
    // Try Node.js / Electron environment
    const crypto = await getNodeCrypto();
    if (crypto) {
      return crypto.randomBytes(size);
    }
  }
  
  // Browser environment (mobile) - fallback
  const bytes = new Uint8Array(size);
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(bytes);
  } else if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    throw new Error('No crypto implementation available');
  }
  return bytes;
}

/**
 * Create SHA-256 hash - works in both Node.js and browser
 * @param {string} data - Data to hash
 * @returns {Promise<Uint8Array>} Hash bytes
 */
export async function sha256(data) {
  if (isNode) {
    // Try Node.js / Electron environment
    const crypto = await getNodeCrypto();
    if (crypto) {
      return crypto.createHash('sha256').update(data).digest();
    }
  }
  
  // Browser environment (mobile) - fallback
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
