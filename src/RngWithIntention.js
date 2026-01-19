import { randomBytes, sha256, bytesToHex, readUInt32BE } from './crypto-polyfill.js';

/**
 * RngWithIntention - A random number generator seeded by human intention
 * 
 * This class creates random numbers using a combination of:
 * - User intention (as text or any string)
 * - Precise timestamp (when intention is submitted)
 * - System entropy (cryptographic randomness)
 * 
 * The intention is never stored - it exists only as the seed for that moment.
 */
export class RngWithIntention {
  /**
   * Create a new RngWithIntention instance
   * @param {Object} options - Configuration options
   * @param {boolean} options.includeTimestamp - Include timestamp in seed (default: true)
   * @param {boolean} options.includeEntropy - Include system entropy in seed (default: true)
   */
  constructor(options = {}) {
    this.options = {
      includeTimestamp: true,
      includeEntropy: true,
      ...options
    };
  }

  /**
   * Draw a random number based on intention
   * @param {string} intention - The user's intention (any text)
   * @param {number} max - Maximum value (exclusive, returns 0 to max-1)
   * @returns {Promise<Object>} { index: number, timestamp: string }
   */
  async draw(intention, max) {
    if (!intention || typeof intention !== 'string') {
      throw new Error('Intention must be a non-empty string');
    }
    
    if (!Number.isInteger(max) || max <= 0) {
      throw new Error('Max must be a positive integer');
    }

    // Capture the exact moment
    const timestamp = new Date().toISOString();
    
    // Build the seed from components
    let seedComponents = [intention];
    
    if (this.options.includeTimestamp) {
      seedComponents.push(timestamp);
    }
    
    if (this.options.includeEntropy) {
      // Add cryptographic randomness
      const entropy = randomBytes(16);
      seedComponents.push(bytesToHex(entropy));
    }
    
    // Create seed (ephemeral - not stored)
    const seedString = seedComponents.join('::');
    
    // Hash the seed to get deterministic bytes
    const hash = await sha256(seedString);
    
    // Convert hash bytes to a number in range [0, max)
    // Use multiple bytes to reduce modulo bias
    const bytes = readUInt32BE(hash, 0);
    const index = bytes % max;
    
    return {
      index,
      timestamp
    };
  }

  /**
   * Draw multiple random numbers with a single intention
   * @param {string} intention - The user's intention
   * @param {number} max - Maximum value for each draw
   * @param {number} count - Number of values to draw
   * @param {boolean} allowDuplicates - Whether to allow the same index multiple times (default: true)
   * @returns {Promise<Object>} { indices: number[], timestamp: string }
   */
  async drawMultiple(intention, max, count, allowDuplicates = true) {
    if (!Number.isInteger(count) || count <= 0) {
      throw new Error('Count must be a positive integer');
    }
    
    if (!allowDuplicates && count > max) {
      throw new Error('Cannot draw more unique values than max allows');
    }

    const timestamp = new Date().toISOString();
    const indices = [];
    const used = new Set();

    for (let i = 0; i < count; i++) {
      // Modify intention slightly for each draw to ensure different results
      const modifiedIntention = `${intention}::draw${i}`;
      const result = await this.draw(modifiedIntention, max);
      
      if (allowDuplicates) {
        indices.push(result.index);
      } else {
        // Keep drawing until we get an unused index
        let attempts = 0;
        let index = result.index;
        while (used.has(index) && attempts < max * 2) {
          const retry = await this.draw(`${modifiedIntention}::retry${attempts}`, max);
          index = retry.index;
          attempts++;
        }
        used.add(index);
        indices.push(index);
      }
    }

    return {
      indices,
      timestamp
    };
  }
}
