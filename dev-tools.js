/**
 * DEVELOPMENT TOOLS PANEL
 * Purpose: Accelerate development with instant testing, state manipulation, and debugging
 * Usage: Include in index.html with ?dev=true parameter
 */

class ChessDevTools {
    constructor() {
        this.isVisible = false;
        this.testRunner = null;
        this.init();
    }

    /**
     * Initialize dev tools
     */
    init() {
        // Only load if dev mode enabled
        if (!this.isDevMode()) {
            return;
        }

        this.createUI();
        this.setupShortcuts();
        this.loadTestRunner();

        console.log('🛠️ Dev Tools loaded! Press Ctrl+Shift+D to toggle');
    }

    /**
     * Check if dev mode
     */
    isDevMode() {
        return window.location.search.includes('dev=true') ||
               window.location.hostname === 'localhost' ||
               window.location.hostname === '127.0.0.1';
    }

    /**
     * Create dev tools UI
     */
    createUI() {
        const panel = document.createElement('div');
        panel.id = 'dev-tools-panel';
        panel.innerHTML = `
            <style>
                #dev-tools-panel {
                    position: fixed;
                    top: 10px;
                    right: 10px;
                    width: 400px;
                    max-height: 90vh;
                    background: rgba(0, 0, 0, 0.95);
                    border: 2px solid #6c5ce7;
                    border-radius: 10px;
                    padding: 15px;
                    color: white;
                    font-family: 'Courier New', monospace;
                    font-size: 12px;
                    z-index: 999999;
                    overflow-y: auto;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
                    display: none;
                }

                #dev-tools-panel.visible {
                    display: block;
                }

                .dev-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #6c5ce7;
                }

                .dev-title {
                    font-size: 16px;
                    font-weight: bold;
                    color: #6c5ce7;
                }

                .dev-close {
                    background: #e17055;
                    border: none;
                    color: white;
                    padding: 5px 10px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 12px;
                }

                .dev-section {
                    margin-bottom: 15px;
                    padding: 10px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 5px;
                }

                .dev-section-title {
                    font-weight: bold;
                    color: #00cec9;
                    margin-bottom: 8px;
                }

                .dev-btn {
                    background: #6c5ce7;
                    border: none;
                    color: white;
                    padding: 8px 12px;
                    margin: 3px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 11px;
                    transition: all 0.2s;
                }

                .dev-btn:hover {
                    background: #5f4fd1;
                    transform: translateY(-2px);
                }

                .dev-btn.danger {
                    background: #e17055;
                }

                .dev-btn.success {
                    background: #00b894;
                }

                .dev-input {
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid #6c5ce7;
                    color: white;
                    padding: 5px 8px;
                    border-radius: 3px;
                    width: 100%;
                    margin: 5px 0;
                    font-family: inherit;
                    font-size: 11px;
                }

                .dev-output {
                    background: rgba(0, 0, 0, 0.5);
                    border: 1px solid #2d3436;
                    border-radius: 3px;
                    padding: 8px;
                    margin-top: 8px;
                    max-height: 200px;
                    overflow-y: auto;
                    font-size: 10px;
                    white-space: pre-wrap;
                    word-wrap: break-word;
                }

                .dev-stats {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 8px;
                    margin-top: 8px;
                }

                .dev-stat {
                    background: rgba(255, 255, 255, 0.05);
                    padding: 5px;
                    border-radius: 3px;
                    text-align: center;
                }

                .dev-stat-value {
                    font-size: 18px;
                    font-weight: bold;
                    color: #fdcb6e;
                }

                .dev-stat-label {
                    font-size: 9px;
                    color: #dfe6e9;
                    margin-top: 3px;
                }

                .test-result {
                    padding: 5px;
                    margin: 3px 0;
                    border-radius: 3px;
                }

                .test-result.pass {
                    background: rgba(0, 184, 148, 0.2);
                    border-left: 3px solid #00b894;
                }

                .test-result.fail {
                    background: rgba(225, 112, 85, 0.2);
                    border-left: 3px solid #e17055;
                }
            </style>

            <div class="dev-header">
                <div class="dev-title">🛠️ Dev Tools</div>
                <button class="dev-close" onclick="chessDevTools.toggle()">✕</button>
            </div>

            <!-- Quick Actions -->
            <div class="dev-section">
                <div class="dev-section-title">⚡ Quick Actions</div>
                <button class="dev-btn" onclick="chessDevTools.runAllTests()">Run All Tests</button>
                <button class="dev-btn success" onclick="chessDevTools.quickTest()">Quick Test</button>
                <button class="dev-btn" onclick="chessDevTools.resetState()">Reset State</button>
                <button class="dev-btn danger" onclick="chessDevTools.clearStorage()">Clear Storage</button>
            </div>

            <!-- State Manipulation -->
            <div class="dev-section">
                <div class="dev-section-title">🎮 State Manipulation</div>
                <button class="dev-btn" onclick="chessDevTools.setState('rating', 2000)">Rating → 2000</button>
                <button class="dev-btn" onclick="chessDevTools.setState('level', 50)">Level → 50</button>
                <button class="dev-btn" onclick="chessDevTools.setState('coins', 9999)">Coins → 9999</button>
                <button class="dev-btn" onclick="chessDevTools.maxPowerUps()">Max Power-Ups</button>
                <button class="dev-btn" onclick="chessDevTools.setState('streak', 20)">Streak → 20</button>

                <div style="margin-top: 10px;">
                    <input type="text" class="dev-input" id="dev-custom-key" placeholder="State key (e.g., rating)">
                    <input type="text" class="dev-input" id="dev-custom-value" placeholder="Value">
                    <button class="dev-btn success" onclick="chessDevTools.setCustomState()">Set Custom</button>
                </div>
            </div>

            <!-- Testing -->
            <div class="dev-section">
                <div class="dev-section-title">🧪 Testing</div>
                <button class="dev-btn" onclick="chessDevTools.testAssessment()">Test Assessment</button>
                <button class="dev-btn" onclick="chessDevTools.testPuzzleSolve()">Test Puzzle Solve</button>
                <button class="dev-btn" onclick="chessDevTools.testPowerUps()">Test Power-Ups</button>
                <button class="dev-btn" onclick="chessDevTools.testErrors()">Test Error Handling</button>
                <div id="test-output" class="dev-output" style="display: none;"></div>
            </div>

            <!-- Current State -->
            <div class="dev-section">
                <div class="dev-section-title">📊 Current State</div>
                <div class="dev-stats">
                    <div class="dev-stat">
                        <div class="dev-stat-value" id="dev-rating">-</div>
                        <div class="dev-stat-label">Rating</div>
                    </div>
                    <div class="dev-stat">
                        <div class="dev-stat-value" id="dev-level">-</div>
                        <div class="dev-stat-label">Level</div>
                    </div>
                    <div class="dev-stat">
                        <div class="dev-stat-value" id="dev-xp">-</div>
                        <div class="dev-stat-label">XP</div>
                    </div>
                    <div class="dev-stat">
                        <div class="dev-stat-value" id="dev-streak">-</div>
                        <div class="dev-stat-label">Streak</div>
                    </div>
                </div>
                <button class="dev-btn" onclick="chessDevTools.refreshStats()" style="width: 100%; margin-top: 8px;">Refresh</button>
            </div>

            <!-- Performance -->
            <div class="dev-section">
                <div class="dev-section-title">⚡ Performance</div>
                <button class="dev-btn" onclick="chessDevTools.checkPerformance()">Check Performance</button>
                <button class="dev-btn" onclick="chessDevTools.profilePuzzleLoad()">Profile Puzzle Load</button>
                <div id="perf-output" class="dev-output" style="display: none;"></div>
            </div>

            <!-- Debug -->
            <div class="dev-section">
                <div class="dev-section-title">🐛 Debug</div>
                <button class="dev-btn" onclick="chessDevTools.dumpState()">Dump State</button>
                <button class="dev-btn" onclick="chessDevTools.showErrors()">Show Errors</button>
                <button class="dev-btn" onclick="chessDevTools.exportLogs()">Export Logs</button>
                <button class="dev-btn danger" onclick="chessDevTools.simulateCrash()">Simulate Crash</button>
            </div>
        `;

        document.body.appendChild(panel);
        this.panel = panel;

        // Auto-refresh stats every 2 seconds
        setInterval(() => this.refreshStats(), 2000);
    }

    /**
     * Setup keyboard shortcuts
     */
    setupShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+Shift+D - Toggle panel
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                this.toggle();
            }

            // Ctrl+Shift+T - Run all tests
            if (e.ctrlKey && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                this.runAllTests();
            }

            // Ctrl+Shift+Q - Quick test
            if (e.ctrlKey && e.shiftKey && e.key === 'Q') {
                e.preventDefault();
                this.quickTest();
            }

            // Ctrl+Shift+R - Reset state
            if (e.ctrlKey && e.shiftKey && e.key === 'R') {
                e.preventDefault();
                this.resetState();
            }
        });
    }

    /**
     * Toggle panel visibility
     */
    toggle() {
        this.isVisible = !this.isVisible;
        if (this.isVisible) {
            this.panel.classList.add('visible');
            this.refreshStats();
        } else {
            this.panel.classList.remove('visible');
        }
    }

    /**
     * Load test runner
     */
    loadTestRunner() {
        // Test runner is already in window scope from test-comprehensive.js
        if (typeof ChessTestSuite !== 'undefined') {
            this.testRunner = new ChessTestSuite();
            console.log('✅ Test runner loaded');
        }
    }

    /**
     * Run all tests
     */
    async runAllTests() {
        this.log('Running comprehensive test suite...', 'test-output');

        if (!this.testRunner) {
            this.loadTestRunner();
        }

        if (this.testRunner) {
            await this.testRunner.runAll();
            const results = this.testRunner.results;

            const output = `
                ✅ Passed: ${results.passed}
                ❌ Failed: ${results.failed}
                Pass Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%

                ${results.errors.length > 0 ? '\nErrors:\n' + results.errors.map(e => `  • ${e.test}`).join('\n') : ''}
            `;

            this.log(output, 'test-output');
        } else {
            this.log('❌ Test runner not available', 'test-output');
        }
    }

    /**
     * Quick test - run critical tests only
     */
    async quickTest() {
        this.log('Running quick tests...', 'test-output');

        const tests = [
            { name: 'Game state valid', fn: () => gameState !== null },
            { name: 'Board renders', fn: () => document.querySelectorAll('.square').length === 64 },
            { name: 'Puzzle loaded', fn: () => gameState.currentPuzzle !== null },
            { name: 'Chess.js available', fn: () => typeof Chess !== 'undefined' },
            { name: 'AI engine exists', fn: () => typeof aiEngine !== 'undefined' },
            { name: 'LocalStorage works', fn: () => {
                try {
                    localStorage.setItem('test', '1');
                    localStorage.removeItem('test');
                    return true;
                } catch (e) {
                    return false;
                }
            }}
        ];

        let output = '';
        let passed = 0;
        let failed = 0;

        for (const test of tests) {
            try {
                const result = test.fn();
                if (result) {
                    output += `✅ ${test.name}\n`;
                    passed++;
                } else {
                    output += `❌ ${test.name}\n`;
                    failed++;
                }
            } catch (e) {
                output += `❌ ${test.name} - ERROR: ${e.message}\n`;
                failed++;
            }
        }

        output += `\n${passed}/${passed + failed} passed`;
        this.log(output, 'test-output');
    }

    /**
     * Set state value
     */
    setState(key, value) {
        if (typeof gameState !== 'undefined') {
            gameState[key] = value;
            saveGameState();
            updateAllDisplays();
            this.refreshStats();
            console.log(`✅ Set ${key} = ${value}`);
        }
    }

    /**
     * Set custom state
     */
    setCustomState() {
        const key = document.getElementById('dev-custom-key').value;
        const value = document.getElementById('dev-custom-value').value;

        if (key && value) {
            let parsedValue = value;

            // Try to parse as number
            if (!isNaN(value)) {
                parsedValue = Number(value);
            }
            // Try to parse as boolean
            else if (value === 'true' || value === 'false') {
                parsedValue = value === 'true';
            }

            this.setState(key, parsedValue);
        }
    }

    /**
     * Max power-ups
     */
    maxPowerUps() {
        if (typeof gameState !== 'undefined') {
            gameState.powers = {
                hint: 99,
                freeze: 99,
                skip: 99,
                double: 99
            };
            saveGameState();
            updateAllDisplays();
            console.log('✅ Maxed all power-ups');
        }
    }

    /**
     * Reset state
     */
    resetState() {
        if (confirm('Reset all game state?')) {
            localStorage.removeItem('chessBlitzGameState');
            location.reload();
        }
    }

    /**
     * Clear storage
     */
    clearStorage() {
        if (confirm('Clear ALL localStorage?')) {
            localStorage.clear();
            location.reload();
        }
    }

    /**
     * Refresh stats display
     */
    refreshStats() {
        if (typeof gameState !== 'undefined') {
            document.getElementById('dev-rating').textContent = gameState.rating || '-';
            document.getElementById('dev-level').textContent = gameState.level || '-';
            document.getElementById('dev-xp').textContent = gameState.xp || '-';
            document.getElementById('dev-streak').textContent = gameState.streak || '-';
        }
    }

    /**
     * Test assessment
     */
    testAssessment() {
        this.log('Testing assessment flow...', 'test-output');

        if (typeof startAssessment === 'function') {
            startAssessment();
            this.log('✅ Assessment started', 'test-output');
        } else {
            this.log('❌ startAssessment not found', 'test-output');
        }
    }

    /**
     * Test puzzle solve
     */
    testPuzzleSolve() {
        this.log('Testing puzzle solve...', 'test-output');

        if (gameState.currentPuzzle) {
            const solution = gameState.currentPuzzle.solution[0];
            this.log(`Attempting solution: ${solution}`, 'test-output');

            checkMove(solution, 0, 0);
            this.log('✅ Move checked', 'test-output');
        } else {
            this.log('❌ No puzzle loaded', 'test-output');
        }
    }

    /**
     * Test power-ups
     */
    testPowerUps() {
        this.log('Testing power-ups...', 'test-output');

        this.maxPowerUps();

        const tests = ['hint', 'freeze', 'skip', 'double'];
        tests.forEach(type => {
            try {
                usePower(type);
                this.log(`✅ ${type} power-up works`, 'test-output');
            } catch (e) {
                this.log(`❌ ${type} power-up failed: ${e.message}`, 'test-output');
            }
        });
    }

    /**
     * Test error handling
     */
    testErrors() {
        this.log('Testing error handling...', 'test-output');

        // Test invalid move
        try {
            checkMove('invalid', 0, 0);
            this.log('✅ Invalid move handled', 'test-output');
        } catch (e) {
            this.log(`❌ Invalid move crashed: ${e.message}`, 'test-output');
        }

        // Test null puzzle
        const savedPuzzle = gameState.currentPuzzle;
        gameState.currentPuzzle = null;

        try {
            renderBoard();
            this.log('✅ Null puzzle handled', 'test-output');
        } catch (e) {
            this.log(`❌ Null puzzle crashed: ${e.message}`, 'test-output');
        }

        gameState.currentPuzzle = savedPuzzle;
    }

    /**
     * Check performance
     */
    checkPerformance() {
        const metrics = {
            memory: performance.memory ? `${(performance.memory.usedJSHeapSize / 1048576).toFixed(2)} MB` : 'N/A',
            loadTime: `${(performance.timing.loadEventEnd - performance.timing.navigationStart) / 1000} s`,
            domReady: `${(performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart) / 1000} s`
        };

        const output = `
            Memory Used: ${metrics.memory}
            Load Time: ${metrics.loadTime}
            DOM Ready: ${metrics.domReady}
        `;

        this.log(output, 'perf-output');
    }

    /**
     * Profile puzzle load
     */
    async profilePuzzleLoad() {
        this.log('Profiling puzzle load...', 'perf-output');

        const iterations = 10;
        const times = [];

        for (let i = 0; i < iterations; i++) {
            const start = performance.now();
            loadNextPuzzle();
            const end = performance.now();
            times.push(end - start);
        }

        const avg = times.reduce((a, b) => a + b) / times.length;
        const min = Math.min(...times);
        const max = Math.max(...times);

        const output = `
            Average: ${avg.toFixed(2)}ms
            Min: ${min.toFixed(2)}ms
            Max: ${max.toFixed(2)}ms
        `;

        this.log(output, 'perf-output');
    }

    /**
     * Dump state
     */
    dumpState() {
        console.log('=== GAME STATE DUMP ===');
        console.log(JSON.stringify(gameState, null, 2));
        console.log('======================');
        alert('State dumped to console');
    }

    /**
     * Show errors
     */
    showErrors() {
        if (typeof chessErrorHandler !== 'undefined') {
            const report = chessErrorHandler.getErrorReport();
            console.log('=== ERROR REPORT ===');
            console.log(report);
            console.log('===================');
            alert(`${report.errorCount} errors, ${report.warningCount} warnings (see console)`);
        } else {
            alert('Error handler not available');
        }
    }

    /**
     * Export logs
     */
    exportLogs() {
        if (typeof logger !== 'undefined') {
            const logs = logger.getLogs();
            const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `chess-logs-${Date.now()}.json`;
            a.click();

            URL.revokeObjectURL(url);
        } else {
            alert('Logger not available');
        }
    }

    /**
     * Simulate crash
     */
    simulateCrash() {
        if (confirm('This will throw an error. Continue?')) {
            throw new Error('Simulated crash for testing error handling');
        }
    }

    /**
     * Log to output div
     */
    log(message, outputId) {
        const output = document.getElementById(outputId);
        if (output) {
            output.style.display = 'block';
            output.textContent = message;
        }
        console.log(message);
    }
}

// Initialize dev tools
window.chessDevTools = new ChessDevTools();
