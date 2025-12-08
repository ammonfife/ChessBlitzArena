/**
 * ERROR HANDLER & VALIDATION SYSTEM
 * Purpose: Bulletproof error handling and validation for ChessBlitz Arena
 * Usage: Include in index.html BEFORE main game code
 */

class ChessErrorHandler {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.validationRules = {};
        this.setupGlobalHandlers();
        this.setupValidation();
    }

    /**
     * Setup global error handlers
     */
    setupGlobalHandlers() {
        // Catch all unhandled errors
        window.addEventListener('error', (event) => {
            this.logError('Unhandled Error', event.error || event.message, {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });

            // Prevent default to avoid console spam
            event.preventDefault();
        });

        // Catch unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.logError('Unhandled Promise Rejection', event.reason, {
                promise: event.promise
            });

            event.preventDefault();
        });

        // Override console.error to capture
        const originalError = console.error;
        console.error = (...args) => {
            this.logError('Console Error', args.join(' '));
            originalError.apply(console, args);
        };
    }

    /**
     * Setup validation rules
     */
    setupValidation() {
        this.validationRules = {
            // Game state validations
            gameState: {
                rating: (val) => val >= 100 && val <= 5000,
                level: (val) => val >= 1 && val <= 10000,
                xp: (val) => val >= 0,
                coins: (val) => val >= 0,
                streak: (val) => val >= 0,
                timer: (val) => val >= 0 && val <= 60,
                'powers.hint': (val) => val >= 0 && val <= 100,
                'powers.freeze': (val) => val >= 0 && val <= 100,
                'powers.skip': (val) => val >= 0 && val <= 100,
                'powers.double': (val) => val >= 0 && val <= 100
            },

            // Puzzle validations
            puzzle: {
                fen: (val) => typeof val === 'string' && val.length > 10,
                solution: (val) => Array.isArray(val) && val.length > 0,
                rating: (val) => val >= 100 && val <= 3500,
                toMove: (val) => val === 'White' || val === 'Black'
            },

            // Move validations
            move: {
                format: (val) => /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(val),
                squares: (val) => {
                    const from = val.substring(0, 2);
                    const to = val.substring(2, 4);
                    return this.isValidSquare(from) && this.isValidSquare(to);
                }
            }
        };
    }

    /**
     * Validate game state
     */
    validateGameState(state) {
        const errors = [];

        if (!state) {
            return ['Game state is null or undefined'];
        }

        // Check required fields
        const requiredFields = ['rating', 'level', 'xp', 'coins', 'streak', 'powers'];
        requiredFields.forEach(field => {
            if (state[field] === undefined) {
                errors.push(`Missing required field: ${field}`);
            }
        });

        // Validate each field
        Object.keys(this.validationRules.gameState).forEach(key => {
            const value = this.getNestedValue(state, key);
            const validator = this.validationRules.gameState[key];

            if (value !== undefined && !validator(value)) {
                errors.push(`Invalid ${key}: ${value}`);
            }
        });

        // Check for corruption
        if (state.xp < 0 || state.rating < 0 || state.level < 0) {
            errors.push('Corrupted state detected (negative values)');
        }

        // Check for impossible values
        if (state.rating > 10000) {
            this.logWarning('Extremely high rating detected', state.rating);
        }

        if (state.level > 1000) {
            this.logWarning('Extremely high level detected', state.level);
        }

        return errors;
    }

    /**
     * Validate puzzle
     */
    validatePuzzle(puzzle) {
        const errors = [];

        if (!puzzle) {
            return ['Puzzle is null or undefined'];
        }

        // Check required fields
        const requiredFields = ['fen', 'solution', 'toMove'];
        requiredFields.forEach(field => {
            if (puzzle[field] === undefined) {
                errors.push(`Puzzle missing required field: ${field}`);
            }
        });

        // Validate each field
        Object.keys(this.validationRules.puzzle).forEach(key => {
            const value = puzzle[key];
            const validator = this.validationRules.puzzle[key];

            if (value !== undefined && !validator(value)) {
                errors.push(`Invalid puzzle ${key}: ${value}`);
            }
        });

        // Validate FEN format (basic check)
        if (puzzle.fen && !this.isValidFEN(puzzle.fen)) {
            errors.push(`Invalid FEN format: ${puzzle.fen}`);
        }

        // Validate solution format
        if (puzzle.solution) {
            puzzle.solution.forEach((move, i) => {
                if (!this.isValidMove(move)) {
                    errors.push(`Invalid solution move ${i}: ${move}`);
                }
            });
        }

        return errors;
    }

    /**
     * Validate move
     */
    validateMove(move) {
        const errors = [];

        if (!move || typeof move !== 'string') {
            return ['Move is not a valid string'];
        }

        // Check format
        if (!this.validationRules.move.format(move)) {
            errors.push(`Invalid move format: ${move}`);
        }

        // Check squares
        if (!this.validationRules.move.squares(move)) {
            errors.push(`Invalid squares in move: ${move}`);
        }

        return errors;
    }

    /**
     * Safe function wrapper
     */
    wrap(fn, context = null) {
        return async (...args) => {
            try {
                return await fn.apply(context, args);
            } catch (error) {
                this.logError(`Error in ${fn.name || 'anonymous function'}`, error);
                return null; // Safe fallback
            }
        };
    }

    /**
     * Safe state setter
     */
    safeSet(state, key, value, validator = null) {
        try {
            // Validate if validator provided
            if (validator && !validator(value)) {
                this.logWarning(`Invalid value for ${key}`, value);
                return false;
            }

            // Set value
            const keys = key.split('.');
            let obj = state;
            for (let i = 0; i < keys.length - 1; i++) {
                if (!obj[keys[i]]) {
                    obj[keys[i]] = {};
                }
                obj = obj[keys[i]];
            }
            obj[keys[keys.length - 1]] = value;

            return true;
        } catch (error) {
            this.logError('Error setting state', error);
            return false;
        }
    }

    /**
     * Safe localStorage operations
     */
    safeLocalStorageGet(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            if (item === null) {
                return defaultValue;
            }
            return JSON.parse(item);
        } catch (error) {
            this.logError('Error reading from localStorage', error);
            return defaultValue;
        }
    }

    safeLocalStorageSet(key, value) {
        try {
            const serialized = JSON.stringify(value);
            localStorage.setItem(key, serialized);
            return true;
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                this.logError('localStorage quota exceeded', error);
                this.clearOldLogs();
                // Try again after clearing
                try {
                    localStorage.setItem(key, JSON.stringify(value));
                    return true;
                } catch (e) {
                    return false;
                }
            }
            this.logError('Error writing to localStorage', error);
            return false;
        }
    }

    /**
     * Validation helpers
     */
    isValidSquare(square) {
        return /^[a-h][1-8]$/.test(square);
    }

    isValidMove(move) {
        return /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(move);
    }

    isValidFEN(fen) {
        // Basic FEN validation (8 ranks, correct characters)
        const parts = fen.split(' ');
        if (parts.length < 4) return false;

        const ranks = parts[0].split('/');
        if (ranks.length !== 8) return false;

        // Check each rank has valid characters
        const validChars = /^[pnbrqkPNBRQK1-8]+$/;
        return ranks.every(rank => validChars.test(rank));
    }

    /**
     * Get nested value from object
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    }

    /**
     * Log error
     */
    logError(type, message, details = {}) {
        const error = {
            type,
            message: message?.toString() || 'Unknown error',
            details,
            timestamp: new Date().toISOString(),
            url: window.location.href
        };

        this.errors.push(error);

        // Show user-friendly error if critical
        if (this.isCriticalError(error)) {
            this.showErrorToUser(error);
        }

        // Log to console in dev mode
        if (this.isDevMode()) {
            console.error('[ChessError]', error);
        }

        // Store in localStorage for debugging
        this.persistErrors();
    }

    /**
     * Log warning
     */
    logWarning(message, details = {}) {
        const warning = {
            message,
            details,
            timestamp: new Date().toISOString()
        };

        this.warnings.push(warning);

        if (this.isDevMode()) {
            console.warn('[ChessWarning]', warning);
        }
    }

    /**
     * Check if error is critical
     */
    isCriticalError(error) {
        const criticalKeywords = [
            'localStorage',
            'QuotaExceeded',
            'Network',
            'Failed to fetch'
        ];

        return criticalKeywords.some(keyword =>
            error.message.includes(keyword) ||
            error.type.includes(keyword)
        );
    }

    /**
     * Show error to user
     */
    showErrorToUser(error) {
        // Use toast notification if available
        if (typeof showFeedback === 'function') {
            showFeedback(`Error: ${error.message}`, 'error');
        } else {
            console.error('CRITICAL ERROR:', error.message);
        }
    }

    /**
     * Check if in dev mode
     */
    isDevMode() {
        return window.location.hostname === 'localhost' ||
               window.location.hostname === '127.0.0.1' ||
               window.location.search.includes('debug=true');
    }

    /**
     * Persist errors to localStorage
     */
    persistErrors() {
        try {
            const recentErrors = this.errors.slice(-50); // Keep last 50
            localStorage.setItem('chessBlitzErrors', JSON.stringify(recentErrors));
        } catch (e) {
            // If localStorage fails, can't do much
        }
    }

    /**
     * Clear old logs
     */
    clearOldLogs() {
        try {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('chessBlitz') && key.includes('log')) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
        } catch (e) {
            console.error('Failed to clear old logs', e);
        }
    }

    /**
     * Get error report
     */
    getErrorReport() {
        return {
            errors: this.errors,
            warnings: this.warnings,
            errorCount: this.errors.length,
            warningCount: this.warnings.length,
            lastError: this.errors[this.errors.length - 1],
            criticalErrors: this.errors.filter(e => this.isCriticalError(e))
        };
    }

    /**
     * Clear all errors
     */
    clearErrors() {
        this.errors = [];
        this.warnings = [];
        localStorage.removeItem('chessBlitzErrors');
    }

    /**
     * Export errors for debugging
     */
    exportErrors() {
        const report = this.getErrorReport();
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `chess-errors-${Date.now()}.json`;
        a.click();

        URL.revokeObjectURL(url);
    }
}

// Initialize global error handler
window.chessErrorHandler = new ChessErrorHandler();

// Add helper functions to global scope
window.validateGameState = (state) => window.chessErrorHandler.validateGameState(state);
window.validatePuzzle = (puzzle) => window.chessErrorHandler.validatePuzzle(puzzle);
window.validateMove = (move) => window.chessErrorHandler.validateMove(move);
window.safeWrap = (fn, context) => window.chessErrorHandler.wrap(fn, context);

console.log('✅ Chess Error Handler initialized');
console.log('📊 Access error report: chessErrorHandler.getErrorReport()');
console.log('💾 Export errors: chessErrorHandler.exportErrors()');
