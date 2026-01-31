#!/usr/bin/env node

/**
 * Coverage Validation Script for rng-with-intention
 * 
 * Verifies that all possible values are reachable by the RNG.
 * This is a comprehensive test that ensures no values are stuck at zero
 * or unreachable due to implementation bugs.
 * 
 * Usage: node scripts/validate-coverage.js [options]
 * 
 * Options:
 *   --quick         Run quick test (3 deck sizes)
 *   --comprehensive Run comprehensive test (many deck sizes)
 *   --custom <n>    Test specific deck size
 */

import { RngWithIntention } from '../src/index.js';

// ANSI color codes
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
};

// Parse command line arguments
const args = process.argv.slice(2);
let testMode = 'quick';
let customSize = null;

for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
        case '--quick':
            testMode = 'quick';
            break;
        case '--comprehensive':
            testMode = 'comprehensive';
            break;
        case '--custom':
            customSize = parseInt(args[++i], 10);
            testMode = 'custom';
            break;
        case '--help':
            console.log('Usage: node scripts/validate-coverage.js [options]');
            console.log('\nOptions:');
            console.log('  --quick         Quick test (3 deck sizes)');
            console.log('  --comprehensive Comprehensive test (many sizes)');
            console.log('  --custom <n>    Test specific deck size');
            process.exit(0);
    }
}

/**
 * Test coverage for a specific deck size
 * 
 * @param {number} deckSize - Number of possible values (0 to deckSize-1)
 * @param {string} name - Descriptive name for this test
 * @returns {Promise<Object>} Test results
 */
async function testCoverage(deckSize, name) {
    const baseIntention = `coverage-test-${deckSize}`;
    const rngi = new RngWithIntention({
        includeTimestamp: false,  // Deterministic for validation
        includeEntropy: false      // Deterministic for validation
    });
    const drawn = new Set();
    const maxAttempts = deckSize * 100; // Safety limit
    
    let attempts = 0;
    const startTime = Date.now();
    
    // Keep drawing until we've seen all values or hit the limit
    for (attempts = 0; attempts < maxAttempts && drawn.size < deckSize; attempts++) {
        // Use incrementing intention to get different draws
        const result = await rngi.draw(`${baseIntention}-${attempts}`, deckSize);
        drawn.add(result.index);
        
        // Progress for large decks
        if (deckSize >= 1000 && (attempts + 1) % 5000 === 0) {
            const coverage = (drawn.size / deckSize * 100).toFixed(1);
            process.stdout.write(`\r  ${name}: ${coverage}% coverage (${attempts + 1} attempts)`);
        }
    }
    
    const elapsed = Date.now() - startTime;
    const coverage = (drawn.size / deckSize * 100).toFixed(1);
    const passed = drawn.size === deckSize;
    
    // Clear progress line
    if (deckSize >= 1000) {
        process.stdout.write('\r' + ' '.repeat(80) + '\r');
    }
    
    return {
        deckSize,
        name,
        coverage: parseFloat(coverage),
        drawn: drawn.size,
        attempts,
        elapsed,
        passed,
        missing: deckSize - drawn.size
    };
}

/**
 * Display results for a single test
 */
function displayResult(result) {
    const color = result.passed ? colors.green : colors.red;
    const status = result.passed ? '✓ PASS' : '✗ FAIL';
    
    console.log(`\n${color}${status}${colors.reset} ${result.name} (n=${result.deckSize})`);
    console.log(`  Coverage:  ${result.coverage}% (${result.drawn}/${result.deckSize} values)`);
    console.log(`  Attempts:  ${result.attempts.toLocaleString()}`);
    console.log(`  Time:      ${result.elapsed}ms`);
    
    if (!result.passed) {
        console.log(`  ${colors.red}Missing:   ${result.missing} values${colors.reset}`);
    }
}

/**
 * Run coverage validation suite
 */
async function runValidation() {
    console.log(`${colors.bright}${colors.cyan}═══════════════════════════════════════════════════════════`);
    console.log('  RNG Coverage Validation - All Values Reachable Test');
    console.log(`═══════════════════════════════════════════════════════════${colors.reset}\n`);
    
    // Define test suites
    const testSuites = {
        quick: [
            { size: 22, name: 'Major Arcana' },
            { size: 78, name: 'Full Tarot Deck' },
            { size: 100, name: 'Generic (100)' }
        ],
        comprehensive: [
            { size: 10, name: 'Small (10)' },
            { size: 22, name: 'Major Arcana' },
            { size: 52, name: 'Playing Cards' },
            { size: 78, name: 'Full Tarot Deck' },
            { size: 100, name: 'Generic (100)' },
            { size: 256, name: 'Byte Range' },
            { size: 1000, name: 'Large (1000)' },
            { size: 10000, name: 'Very Large (10000)' }
        ],
        custom: [
            { size: customSize, name: `Custom (${customSize})` }
        ]
    };
    
    const tests = testSuites[testMode];
    
    console.log(`Mode: ${colors.cyan}${testMode}${colors.reset}`);
    console.log(`Tests: ${tests.length}\n`);
    console.log('Running coverage tests...');
    
    const results = [];
    const startTime = Date.now();
    
    for (const test of tests) {
        const result = await testCoverage(test.size, test.name);
        results.push(result);
        displayResult(result);
    }
    
    const totalElapsed = Date.now() - startTime;
    
    // Summary
    const passed = results.filter(r => r.passed).length;
    const failed = results.length - passed;
    
    console.log(`\n${colors.bright}${colors.cyan}───────────────────────────────────────────────────────────`);
    console.log('  Summary');
    console.log(`───────────────────────────────────────────────────────────${colors.reset}\n`);
    
    console.log(`  Total tests:   ${results.length}`);
    console.log(`  ${colors.green}Passed:        ${passed}${colors.reset}`);
    if (failed > 0) {
        console.log(`  ${colors.red}Failed:        ${failed}${colors.reset}`);
    }
    console.log(`  Total time:    ${totalElapsed}ms\n`);
    
    if (failed === 0) {
        console.log(`${colors.green}${colors.bright}✓ All coverage tests passed!${colors.reset}`);
        console.log('  All possible values were drawn at least once.\n');
        console.log(`${colors.cyan}Note:${colors.reset} This verifies reachability, not uniform distribution.`);
        console.log(`      Run 'npm run validate:distribution' to check uniformity.\n`);
    } else {
        console.log(`${colors.red}${colors.bright}✗ Some tests failed${colors.reset}`);
        console.log('  Some values may be unreachable - check for implementation bugs.\n');
    }
    
    console.log(`${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}\n`);
    
    return failed === 0;
}

// Run validation
runValidation()
    .then(passed => process.exit(passed ? 0 : 1))
    .catch(error => {
        console.error(`${colors.red}Error during validation:${colors.reset}`, error);
        process.exit(2);
    });
