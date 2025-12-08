/**
 * ChessBlitz Arena Session Tracker
 * Records user sessions, interactions, errors for debugging
 * Stores logs persistently in repo via GitHub API
 */

class SessionTracker {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.startTime = Date.now();
        this.interactions = [];
        this.errors = [];
        this.consoleLogs = [];
        this.performance = [];
        this.recording = true;

        // Hook into window events
        this.setupTracking();

        console.log(`📊 Session Tracker initialized: ${this.sessionId}`);
    }

    generateSessionId() {
        const now = new Date();
        const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const random = Math.random().toString(36).substr(2, 9);
        return `${timestamp}_${random}`;
    }

    setupTracking() {
        // Track all clicks
        document.addEventListener('click', (e) => this.trackClick(e), true);

        // Track mouse movements (sampled)
        let lastMouseTrack = 0;
        document.addEventListener('mousemove', (e) => {
            const now = Date.now();
            if (now - lastMouseTrack > 100) { // Sample every 100ms
                this.trackMouse(e);
                lastMouseTrack = now;
            }
        }, true);

        // Track scrolling
        window.addEventListener('scroll', () => this.trackScroll());

        // Track keyboard inputs
        document.addEventListener('keydown', (e) => this.trackKey(e));

        // Hook console.log, console.error, console.warn
        this.hookConsole();

        // Track errors
        window.addEventListener('error', (e) => this.trackError(e));
        window.addEventListener('unhandledrejection', (e) => this.trackPromiseError(e));

        // Track performance
        this.trackPerformance();

        // Auto-save every 30 seconds
        setInterval(() => this.saveSession(), 30000);

        // Save on page unload
        window.addEventListener('beforeunload', () => {
            this.saveSession();
        });
    }

    trackClick(event) {
        const target = event.target;
        const interaction = {
            type: 'click',
            timestamp: Date.now() - this.startTime,
            x: event.clientX,
            y: event.clientY,
            element: this.getElementInfo(target),
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight,
                scrollX: window.scrollX,
                scrollY: window.scrollY
            }
        };

        this.interactions.push(interaction);

        // Special tracking for chess moves
        if (target.classList.contains('square')) {
            interaction.chess = {
                row: target.dataset.row,
                col: target.dataset.col,
                piece: target.textContent,
                selected: target.classList.contains('selected')
            };
        }
    }

    trackMouse(event) {
        this.interactions.push({
            type: 'mouse',
            timestamp: Date.now() - this.startTime,
            x: event.clientX,
            y: event.clientY
        });
    }

    trackScroll() {
        this.interactions.push({
            type: 'scroll',
            timestamp: Date.now() - this.startTime,
            scrollX: window.scrollX,
            scrollY: window.scrollY
        });
    }

    trackKey(event) {
        this.interactions.push({
            type: 'key',
            timestamp: Date.now() - this.startTime,
            key: event.key,
            code: event.code,
            ctrl: event.ctrlKey,
            shift: event.shiftKey,
            alt: event.altKey
        });
    }

    hookConsole() {
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;

        console.log = (...args) => {
            this.consoleLogs.push({
                level: 'log',
                timestamp: Date.now() - this.startTime,
                message: args.map(a => String(a)).join(' ')
            });
            originalLog.apply(console, args);
        };

        console.error = (...args) => {
            this.consoleLogs.push({
                level: 'error',
                timestamp: Date.now() - this.startTime,
                message: args.map(a => String(a)).join(' ')
            });
            originalError.apply(console, args);
        };

        console.warn = (...args) => {
            this.consoleLogs.push({
                level: 'warn',
                timestamp: Date.now() - this.startTime,
                message: args.map(a => String(a)).join(' ')
            });
            originalWarn.apply(console, args);
        };
    }

    trackError(event) {
        this.errors.push({
            type: 'error',
            timestamp: Date.now() - this.startTime,
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            stack: event.error?.stack
        });
    }

    trackPromiseError(event) {
        this.errors.push({
            type: 'unhandledRejection',
            timestamp: Date.now() - this.startTime,
            reason: String(event.reason),
            promise: String(event.promise)
        });
    }

    trackPerformance() {
        // Track initial load
        window.addEventListener('load', () => {
            const perfData = performance.getEntriesByType('navigation')[0];
            if (perfData) {
                this.performance.push({
                    type: 'page_load',
                    timestamp: Date.now() - this.startTime,
                    metrics: {
                        dns: perfData.domainLookupEnd - perfData.domainLookupStart,
                        tcp: perfData.connectEnd - perfData.connectStart,
                        request: perfData.responseStart - perfData.requestStart,
                        response: perfData.responseEnd - perfData.responseStart,
                        domLoad: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                        total: perfData.loadEventEnd - perfData.fetchStart
                    }
                });
            }
        });

        // Track FPS
        let frameCount = 0;
        let lastFpsCheck = Date.now();

        const checkFPS = () => {
            frameCount++;
            const now = Date.now();

            if (now - lastFpsCheck >= 1000) {
                this.performance.push({
                    type: 'fps',
                    timestamp: now - this.startTime,
                    fps: frameCount
                });

                frameCount = 0;
                lastFpsCheck = now;
            }

            requestAnimationFrame(checkFPS);
        };

        requestAnimationFrame(checkFPS);
    }

    getElementInfo(element) {
        return {
            tagName: element.tagName,
            id: element.id,
            className: element.className,
            text: element.textContent?.substr(0, 50),
            selector: this.getElementSelector(element)
        };
    }

    getElementSelector(element) {
        if (element.id) return `#${element.id}`;
        if (element.className) {
            const classes = element.className.split(' ').filter(c => c).slice(0, 2).join('.');
            return `${element.tagName}.${classes}`;
        }
        return element.tagName;
    }

    getSessionData() {
        return {
            sessionId: this.sessionId,
            startTime: new Date(this.startTime).toISOString(),
            duration: Date.now() - this.startTime,
            url: window.location.href,
            userAgent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            interactions: this.interactions,
            consoleLogs: this.consoleLogs,
            errors: this.errors,
            performance: this.performance,
            gameState: this.captureGameState()
        };
    }

    captureGameState() {
        // Capture chess-specific state
        if (typeof gameState !== 'undefined') {
            return {
                rating: gameState.rating,
                level: gameState.level,
                xp: gameState.xp,
                puzzlesSolved: gameState.puzzlesSolved,
                currentPuzzle: gameState.currentPuzzle ? {
                    title: gameState.currentPuzzle.title,
                    rating: gameState.currentPuzzle.rating,
                    toMove: gameState.currentPuzzle.toMove
                } : null
            };
        }
        return null;
    }

    async saveSession() {
        if (!this.recording) return;

        const sessionData = this.getSessionData();

        // Save to localStorage as fallback
        try {
            const key = `chess_session_${this.sessionId}`;
            localStorage.setItem(key, JSON.stringify(sessionData));
        } catch (e) {
            console.warn('Failed to save to localStorage:', e);
        }

        // Send to GitHub (if we have a way to do that)
        // For now, just log it
        console.log(`📊 Session saved (${this.interactions.length} interactions, ${this.errors.length} errors)`);

        // In production, send to analytics endpoint
        if (window.location.hostname === 'chess.genomicdigital.com') {
            this.sendToAnalytics(sessionData);
        }
    }

    async sendToAnalytics(sessionData) {
        // TODO: Send to analytics service or GitHub
        // For now, expose via debug console
        if (window.chessDebug) {
            window.chessDebug.getSession = () => sessionData;
        }
    }

    generateHeatmap() {
        // Generate click heatmap data
        const clicks = this.interactions.filter(i => i.type === 'click');

        const heatmapData = clicks.reduce((acc, click) => {
            const key = `${Math.floor(click.x / 10)}_${Math.floor(click.y / 10)}`;
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});

        return heatmapData;
    }

    exportSession() {
        const sessionData = this.getSessionData();
        const blob = new Blob([JSON.stringify(sessionData, null, 2)], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chess_session_${this.sessionId}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Initialize global session tracker
window.sessionTracker = new SessionTracker();

// Add to debug console
if (window.chessDebug) {
    chessDebug.getSessionData = () => sessionTracker.getSessionData();
    chessDebug.exportSession = () => sessionTracker.exportSession();
    chessDebug.getHeatmap = () => sessionTracker.generateHeatmap();
}
