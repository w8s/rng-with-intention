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
async function getNodeCrypto() {
  if (!nodeCrypto && isNode) {
    nodeCrypto = await import('crypto');
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
    // Node.js / Electron environment
    const crypto = await getNodeCrypto();
    return crypto.randomBytes(size);
  } else {
    // Browser environment (mobile)
    const bytes = new Uint8Array(size);
    crypto.getRandomValues(bytes);
    return bytes;
  }
}

/**
 * Create SHA-256 hash - works in both Node.js and browser
 * @param {string} data - Data to hash
 * @returns {Promise<Uint8Array>} Hash bytes
 */
export async function sha256(data) {
  if (isNode) {
    // Node.js / Electron environment
    const crypto = await getNodeCrypto();
    return crypto.createHash('sha256').update(data).digest();
  } else {
    // Browser environment (mobile)
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    return new Uint8Array(hashBuffer);
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
