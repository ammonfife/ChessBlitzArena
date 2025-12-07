/**
 * ChessBlitz Arena Automated Test Script
 *
 * This script tests all interactive elements of the ChessBlitz Arena website.
 * Run this in the browser console after loading http://chess.genomicdigital.com
 *
 * Usage:
 * 1. Open browser DevTools (F12 or Cmd+Option+I)
 * 2. Paste this entire script into the console
 * 3. Press Enter to run all tests
 */

(async function runChessBlitzTests() {
    console.log('========================================');
    console.log('ChessBlitz Arena Test Suite');
    console.log('========================================\n');

    const results = {
        passed: 0,
        failed: 0,
        warnings: 0,
        tests: []
    };

    function logTest(name, status, message, details = null) {
        const symbols = { pass: '✓', fail: '✗', warn: '⚠' };
        const colors = {
            pass: 'color: #00b894; font-weight: bold;',
            fail: 'color: #e74c3c; font-weight: bold;',
            warn: 'color: #f39c12; font-weight: bold;'
        };

        console.log(`%c${symbols[status]} ${name}`, colors[status], message);
        if (details) console.log('  Details:', details);

        results.tests.push({ name, status, message, details });
        if (status === 'pass') results.passed++;
        else if (status === 'fail') results.failed++;
        else results.warnings++;
    }

    // Utility to wait
    const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

    try {
        // TEST 1: Check if site loads
        console.log('\n--- Basic Loading Tests ---');

        if (document.body) {
            logTest('Site Loads', 'pass', 'Page body exists and is loaded');
        } else {
            logTest('Site Loads', 'fail', 'Page body not found');
        }

        // TEST 2: Check for required elements
        const chessBoard = document.getElementById('chess-board');
        if (chessBoard) {
            logTest('Chess Board Element', 'pass', 'Chess board container found');
        } else {
            logTest('Chess Board Element', 'fail', 'Chess board container not found');
        }

        const startButton = document.querySelector('button[onclick="startAssessment()"]');
        if (startButton) {
            logTest('Start Button', 'pass', 'START ASSESSMENT button found', { text: startButton.textContent });
        } else {
            logTest('Start Button', 'fail', 'START ASSESSMENT button not found');
        }

        // TEST 3: Check for chess pieces visibility
        console.log('\n--- Chess Board Tests ---');

        const squares = document.querySelectorAll('.square');
        if (squares.length > 0) {
            logTest('Board Squares', 'pass', `Found ${squares.length} squares`, { expected: 64 });

            // Check for pieces
            const whitePieces = document.querySelectorAll('.square.white-piece');
            const blackPieces = document.querySelectorAll('.square.black-piece');

            if (whitePieces.length > 0 && blackPieces.length > 0) {
                logTest('Piece Colors', 'pass', `White pieces: ${whitePieces.length}, Black pieces: ${blackPieces.length}`);
            } else if (whitePieces.length === 0 && blackPieces.length === 0) {
                logTest('Piece Colors', 'warn', 'No pieces found (board might be empty before starting)');
            } else {
                logTest('Piece Colors', 'fail', `Unbalanced pieces - White: ${whitePieces.length}, Black: ${blackPieces.length}`);
            }

            // Check piece styling
            if (whitePieces.length > 0) {
                const whiteStyle = window.getComputedStyle(whitePieces[0]);
                logTest('White Piece Styling', 'pass', 'White pieces have styling', {
                    color: whiteStyle.color,
                    textShadow: whiteStyle.textShadow.substring(0, 50) + '...'
                });
            }

            if (blackPieces.length > 0) {
                const blackStyle = window.getComputedStyle(blackPieces[0]);
                logTest('Black Piece Styling', 'pass', 'Black pieces have styling', {
                    color: blackStyle.color,
                    textShadow: blackStyle.textShadow.substring(0, 50) + '...'
                });
            }
        } else {
            logTest('Board Squares', 'warn', 'No board squares found (assessment may not have started)');
        }

        // TEST 4: Check for hint button
        console.log('\n--- Power-Up Tests ---');

        const hintButton = document.getElementById('power-hint');
        if (hintButton) {
            const hintCount = document.getElementById('hint-count');
            logTest('Hint Button', 'pass', 'Hint power-up button found', {
                count: hintCount ? hintCount.textContent : 'unknown'
            });
        } else {
            logTest('Hint Button', 'fail', 'Hint power-up button not found');
        }

        const freezeButton = document.getElementById('power-freeze');
        if (freezeButton) {
            logTest('Freeze Button', 'pass', 'Freeze power-up button found');
        } else {
            logTest('Freeze Button', 'warn', 'Freeze power-up button not found');
        }

        // TEST 5: Check for debug console
        console.log('\n--- Debug Console Tests ---');

        if (typeof chessDebug !== 'undefined') {
            logTest('Debug Console', 'pass', 'chessDebug object is available');

            if (typeof chessDebug.getLogs === 'function') {
                logTest('Debug getLogs()', 'pass', 'chessDebug.getLogs() function exists');
                try {
                    const logs = chessDebug.getLogs();
                    logTest('Debug Logs', 'pass', `Retrieved ${logs.length} log entries`);
                } catch (e) {
                    logTest('Debug Logs', 'fail', 'Failed to get logs', { error: e.message });
                }
            } else {
                logTest('Debug getLogs()', 'fail', 'chessDebug.getLogs() function not found');
            }

            if (typeof chessDebug.getErrors === 'function') {
                try {
                    const errors = chessDebug.getErrors();
                    if (errors.length > 0) {
                        logTest('Error Logs', 'warn', `Found ${errors.length} error(s)`, { errors });
                    } else {
                        logTest('Error Logs', 'pass', 'No errors logged');
                    }
                } catch (e) {
                    logTest('Error Logs', 'fail', 'Failed to check errors', { error: e.message });
                }
            }

            if (typeof chessDebug.showStats === 'function') {
                logTest('Debug showStats()', 'pass', 'chessDebug.showStats() function exists');
            }
        } else {
            logTest('Debug Console', 'fail', 'chessDebug object not found');
        }

        // TEST 6: Check for JavaScript errors in console
        console.log('\n--- Console Error Detection ---');

        const originalError = console.error;
        const capturedErrors = [];
        console.error = function(...args) {
            capturedErrors.push(args);
            originalError.apply(console, args);
        };

        // Wait a moment to capture any errors
        await wait(1000);

        if (capturedErrors.length > 0) {
            logTest('Console Errors', 'warn', `${capturedErrors.length} console error(s) detected`, { errors: capturedErrors });
        } else {
            logTest('Console Errors', 'pass', 'No console errors detected during test');
        }

        console.error = originalError;

        // TEST 7: Check external dependencies
        console.log('\n--- External Dependencies ---');

        if (typeof Chess !== 'undefined') {
            logTest('Chess.js Library', 'pass', 'Chess.js library loaded successfully');
        } else {
            logTest('Chess.js Library', 'fail', 'Chess.js library not loaded');
        }

        if (typeof STOCKFISH !== 'undefined') {
            logTest('Stockfish Engine', 'pass', 'Stockfish library loaded successfully');
        } else {
            logTest('Stockfish Engine', 'warn', 'Stockfish library not loaded (AI hints may not work)');
        }

        // TEST 8: Interactive element test
        console.log('\n--- Interactive Element Tests ---');

        if (chessBoard && squares.length > 0) {
            // Check if squares have click handlers
            let hasClickHandler = false;
            squares.forEach(square => {
                const events = getEventListeners ? getEventListeners(square) : null;
                if (events && events.click && events.click.length > 0) {
                    hasClickHandler = true;
                }
            });

            if (hasClickHandler || squares[0].onclick) {
                logTest('Piece Click Handlers', 'pass', 'Squares have click event listeners');
            } else {
                logTest('Piece Click Handlers', 'warn', 'Could not verify click handlers (may need to start assessment)');
            }
        }

        // TEST 9: Check responsive elements
        console.log('\n--- UI Elements ---');

        const timer = document.getElementById('timer');
        if (timer) {
            logTest('Timer Element', 'pass', 'Timer found', { value: timer.textContent });
        } else {
            logTest('Timer Element', 'fail', 'Timer not found');
        }

        const puzzleInstruction = document.getElementById('puzzle-instruction');
        if (puzzleInstruction) {
            logTest('Puzzle Instructions', 'pass', 'Puzzle instruction element found');
        } else {
            logTest('Puzzle Instructions', 'fail', 'Puzzle instruction element not found');
        }

        // TEST 10: Check for game state
        console.log('\n--- Game State Tests ---');

        if (typeof gameState !== 'undefined') {
            logTest('Game State', 'pass', 'gameState object exists', {
                rating: gameState.rating,
                level: gameState.level,
                coins: gameState.coins
            });
        } else {
            logTest('Game State', 'fail', 'gameState object not found');
        }

    } catch (error) {
        logTest('Test Suite Error', 'fail', 'Unexpected error during testing', { error: error.message, stack: error.stack });
    }

    // Summary
    console.log('\n========================================');
    console.log('Test Summary');
    console.log('========================================');
    console.log(`%cPassed: ${results.passed}`, 'color: #00b894; font-weight: bold;');
    console.log(`%cFailed: ${results.failed}`, 'color: #e74c3c; font-weight: bold;');
    console.log(`%cWarnings: ${results.warnings}`, 'color: #f39c12; font-weight: bold;');
    console.log(`Total Tests: ${results.tests.length}`);
    console.log('========================================\n');

    // Interactive test suggestions
    console.log('\n--- Manual Test Instructions ---');
    console.log('To complete testing, manually perform these actions:');
    console.log('1. Click "START ASSESSMENT" button');
    console.log('2. Click on a chess piece (should highlight)');
    console.log('3. Click on a valid destination square (should move)');
    console.log('4. Click the Hint button (💡 HINT)');
    console.log('5. Check if hint appears and square highlights');
    console.log('6. Run: chessDebug.getLogs() to view all logs');
    console.log('7. Run: chessDebug.getErrors() to view errors only');
    console.log('\n========================================\n');

    return results;
})();
