#!/usr/bin/env node

/**
 * Statistical Validation Script for rng-with-intention
 * 
 * Performs chi-square goodness-of-fit test to verify that the RNG
 * produces a uniform distribution over many draws.
 * 
 * Usage: node benchmark/validate-distribution.js [options]
 * 
 * Options:
 *   --draws <n>     Number of draws to perform (default: 10000)
 *   --max <n>       Maximum value for draws (default: 78, full tarot deck)
 *   --seed <s>      Seed for deterministic testing (default: random)
 *   --verbose       Show detailed frequency table
 */

import { RngWithIntention } from '../src/index.js';

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
    draws: 10000,
    max: 78,
    seed: null,
    verbose: false
};

for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
        case '--draws':
            options.draws = parseInt(args[++i], 10);
            break;
        case '--max':
            options.max = parseInt(args[++i], 10);
            break;
        case '--seed':
            options.seed = args[++i];
            break;
        case '--verbose':
            options.verbose = true;
            break;
        case '--help':
            console.log('Usage: node benchmark/validate-distribution.js [options]');
            console.log('\nOptions:');
            console.log('  --draws <n>     Number of draws (default: 10000)');
            console.log('  --max <n>       Maximum value (default: 78)');
            console.log('  --seed <s>      Seed for deterministic testing');
            console.log('  --verbose       Show detailed frequency table');
            process.exit(0);
    }
}

/**
 * Calculate chi-square statistic and p-value
 * 
 * Chi-square test compares observed frequencies to expected frequencies
 * under the null hypothesis of uniform distribution.
 * 
 * @param {Object} observed - Map of value -> observed count
 * @param {number} total - Total number of observations
 * @param {number} categories - Number of categories (possible values)
 * @returns {Object} { chiSquare, degreesOfFreedom, pValue, isSignificant }
 */
function chiSquareTest(observed, total, categories) {
    const expected = total / categories;
    let chiSquare = 0;
    
    // Calculate chi-square statistic: Σ((O - E)² / E)
    for (let i = 0; i < categories; i++) {
        const obs = observed.get(i) || 0;
        const diff = obs - expected;
        chiSquare += (diff * diff) / expected;
    }
    
    const degreesOfFreedom = categories - 1;
    
    // Calculate p-value using chi-square CDF approximation
    // For large df, chi-square distribution approaches normal distribution
    const pValue = calculatePValue(chiSquare, degreesOfFreedom);
    
    // Standard significance level: p > 0.05 means distribution is acceptable
    const isSignificant = pValue > 0.05;
    
    return { chiSquare, degreesOfFreedom, pValue, isSignificant };
}

/**
 * Calculate p-value for chi-square statistic
 * Uses incomplete gamma function approximation
 * 
 * @param {number} x - Chi-square statistic
 * @param {number} k - Degrees of freedom
 * @returns {number} p-value (probability of observing this result by chance)
 */
function calculatePValue(x, k) {
    // For chi-square distribution, p-value = P(X >= x)
    // This is 1 - CDF(x), where CDF is the cumulative distribution function
    
    // Use gamma function approximation for chi-square CDF
    // This is a simplified version - production code would use a library
    
    if (x <= 0) return 1;
    if (k <= 0) return 0;
    
    // Stirling's approximation for large k
    const z = (x - k) / Math.sqrt(2 * k);
    
    // Standard normal CDF approximation
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp(-z * z / 2);
    const probability = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    
    return z > 0 ? probability : 1 - probability;
}

/**
 * Run the statistical validation
 */
async function runValidation() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  RNG Statistical Validation - Chi-Square Goodness-of-Fit');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    console.log('Configuration:');
    console.log(`  Draws:     ${options.draws.toLocaleString()}`);
    console.log(`  Max value: ${options.max} (0-${options.max - 1})`);
    console.log(`  Seed:      ${options.seed || '(random)'}`);
    console.log(`  Expected:  ${(options.draws / options.max).toFixed(2)} draws per value`);
    console.log();
    
    // Initialize RNG with deterministic settings for validation
    const intention = options.seed || `validation-${Date.now()}`;
    const rngi = new RngWithIntention({
        includeTimestamp: false,  // Deterministic for validation
        includeEntropy: false      // Deterministic for validation
    });
    
    // Perform draws
    console.log('Performing draws...');
    const startTime = Date.now();
    const frequency = new Map();
    
    for (let i = 0; i < options.draws; i++) {
        // Use incrementing intention to get different draws
        const result = await rngi.draw(`${intention}-${i}`, options.max);
        frequency.set(result.index, (frequency.get(result.index) || 0) + 1);
        
        // Progress indicator for large runs
        if (options.draws >= 50000 && (i + 1) % 10000 === 0) {
            process.stdout.write(`\r  Progress: ${((i + 1) / options.draws * 100).toFixed(1)}%`);
        }
    }
    
    if (options.draws >= 50000) {
        process.stdout.write('\r');
    }
    
    const elapsed = Date.now() - startTime;
    console.log(`✓ Completed ${options.draws.toLocaleString()} draws in ${elapsed}ms`);
    console.log(`  (${(options.draws / elapsed * 1000).toFixed(0)} draws/second)\n`);
    
    // Calculate statistics
    const result = chiSquareTest(frequency, options.draws, options.max);
    
    // Display results
    console.log('Results:');
    console.log('───────────────────────────────────────────────────────────');
    console.log(`  Chi-square statistic: ${result.chiSquare.toFixed(4)}`);
    console.log(`  Degrees of freedom:   ${result.degreesOfFreedom}`);
    console.log(`  P-value:              ${result.pValue.toFixed(6)}`);
    console.log('───────────────────────────────────────────────────────────');
    
    if (result.isSignificant) {
        console.log('  ✓ PASS: Distribution is statistically uniform (p > 0.05)');
        console.log('    The RNG produces an acceptable uniform distribution.');
    } else {
        console.log('  ✗ FAIL: Distribution deviates from uniform (p ≤ 0.05)');
        console.log('    The RNG may have bias or implementation issues.');
    }
    
    console.log();
    
    // Show frequency distribution if verbose
    if (options.verbose) {
        console.log('Frequency Distribution:');
        console.log('───────────────────────────────────────────────────────────');
        
        const expected = options.draws / options.max;
        const sortedValues = Array.from(frequency.keys()).sort((a, b) => a - b);
        
        // Calculate statistics
        const counts = Array.from(frequency.values());
        const min = Math.min(...counts);
        const max = Math.max(...counts);
        const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
        
        console.log(`  Expected per value: ${expected.toFixed(2)}`);
        console.log(`  Observed range:     ${min} - ${max}`);
        console.log(`  Observed mean:      ${mean.toFixed(2)}`);
        console.log();
        
        // Show first 10, last 10, and any outliers
        const showLimit = 10;
        const outlierThreshold = expected * 0.2; // ±20% from expected
        
        console.log('  First 10 values:');
        for (let i = 0; i < Math.min(showLimit, sortedValues.length); i++) {
            const value = sortedValues[i];
            const count = frequency.get(value) || 0;
            const diff = count - expected;
            const pct = (diff / expected * 100).toFixed(1);
            const marker = Math.abs(diff) > outlierThreshold ? ' ⚠' : '';
            console.log(`    [${value.toString().padStart(2)}] ${count.toString().padStart(4)} (${pct > 0 ? '+' : ''}${pct}%)${marker}`);
        }
        
        if (sortedValues.length > showLimit * 2) {
            console.log('    ...');
            console.log(`  Last 10 values:`);
            for (let i = Math.max(showLimit, sortedValues.length - showLimit); i < sortedValues.length; i++) {
                const value = sortedValues[i];
                const count = frequency.get(value) || 0;
                const diff = count - expected;
                const pct = (diff / expected * 100).toFixed(1);
                const marker = Math.abs(diff) > outlierThreshold ? ' ⚠' : '';
                console.log(`    [${value.toString().padStart(2)}] ${count.toString().padStart(4)} (${pct > 0 ? '+' : ''}${pct}%)${marker}`);
            }
        }
        
        console.log();
    }
    
    console.log('═══════════════════════════════════════════════════════════');
    
    // Exit with appropriate code
    process.exit(result.isSignificant ? 0 : 1);
}

// Run the validation
runValidation().catch(error => {
    console.error('Error during validation:', error);
    process.exit(2);
});
