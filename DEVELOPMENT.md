# ChessBlitz Arena - Development Guide

**Comprehensive Development Documentation** | Updated: 2025-12-07

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Code Organization](#code-organization)
3. [Development Setup](#development-setup)
4. [Making Changes](#making-changes)
5. [Testing](#testing)
6. [Debugging](#debugging)
7. [Performance](#performance)
8. [Best Practices](#best-practices)

---

## Architecture Overview

### Single-File Design

ChessBlitz Arena uses a single-file architecture where **everything** lives in `index.html`:
- HTML structure
- CSS styling
- JavaScript logic
- Embedded puzzle data

**Benefits**:
- Zero build configuration
- No bundler needed
- Simple deployment
- Fast development iteration
- Easy version control

**Trade-offs**:
- Large file size (2499 lines)
- No module system
- Manual code organization

### Technology Stack

```
Frontend:
├── HTML5 (semantic markup)
├── CSS3 (animations, glassmorphism, flexbox)
└── Vanilla JavaScript (ES6+)

External Dependencies (CDN):
├── Chess.js (move validation)
└── Stockfish.js (AI engine)

Storage:
└── LocalStorage (game state, settings, progress)

Hosting:
├── GitHub Pages (primary)
└── Custom Domain (chess.genomicdigital.com)
```

### Data Flow

```
User Interaction
    ↓
handleSquareClick()
    ↓
validateMove() → Chess.js
    ↓
updateGameState()
    ↓
renderBoard()
    ↓
updateUI()
    ↓
saveToLocalStorage()
```

---

## Code Organization

### File Structure (index.html sections)

```javascript
// Lines 1-50: HTML Structure
<div class="container">
  <div id="chess-board"></div>
  <div class="stats-panel"></div>
  ...
</div>

// Lines 51-600: CSS Styles
<style>
  :root { /* CSS variables */ }
  .chess-board { /* Board styling */ }
  .square { /* Square styling */ }
  ...
</style>

// Lines 601-1149: Puzzle Data
const PUZZLES = {
  easy: [...],
  medium: [...],
  hard: [...]
};

// Lines 1150-1281: Logger Class
class Logger {
  log(level, message, data) {...}
  trackAction(action, data) {...}
}

// Lines 1282-1327: Global State
const gameState = {
  currentPuzzle: null,
  selectedSquare: null,
  xp: 0,
  level: 1,
  ...
};

// Lines 1328-1423: AIEngine Class
class AIEngine {
  async init() {...}
  async analyzePosition(fen) {...}
}

// Lines 1424-1650: Core Game Logic
function startAssessment() {...}
function loadPuzzle() {...}
function validateMove() {...}

// Lines 1651-1703: Board Rendering
function renderBoard() {...}
function fenToBoard(fen) {...}

// Lines 1704-1850: User Interaction
function handleSquareClick(row, col) {...}
function handleMoveAttempt() {...}

// Lines 1851-2100: Gamification
function addXP(amount) {...}
function levelUp() {...}
function updateStreak() {...}

// Lines 2101-2300: Power-ups
function usePowerUp(type) {...}
function showHint() {...}

// Lines 2301-2450: UI Updates
function updateStatsDisplay() {...}
function showNotification() {...}

// Lines 2451-2499: Initialization
window.addEventListener('DOMContentLoaded', () => {
  initializeGame();
});
```

### Key Classes

#### Logger (lines 1150-1281)
```javascript
class Logger {
  constructor() {
    this.logs = [];
    this.maxLogs = 500;
    this.sessionId = generateSessionId();
  }

  log(level, message, data = {}) {
    // Stores log with timestamp, level, session ID
    // Saves to LocalStorage
    // Console output with color coding
  }

  trackAction(action, data = {}) {
    // Tracks user actions
    // Used for analytics and debugging
  }
}
```

#### AIEngine (lines 1328-1423)
```javascript
class AIEngine {
  async init() {
    // Load Stockfish worker
    // Send UCI commands
    // Wait for engine ready
  }

  async analyzePosition(fen, depth = 15) {
    // Analyze position
    // Return best move + evaluation
  }
}
```

### State Management

```javascript
const gameState = {
  // Current puzzle
  currentPuzzle: null,
  puzzleIndex: 0,

  // Board state
  selectedSquare: null,
  legalMoves: [],

  // Progression
  xp: 0,
  level: 1,
  rating: 1200,
  tier: 'Intermediate',

  // Gamification
  streak: 0,
  achievements: [],
  unlockedSkins: ['default'],

  // Power-ups
  hints: 3,
  freezes: 2,
  skips: 2,
  doubleXP: 1,

  // Statistics
  puzzlesSolved: 0,
  correctMoves: 0,
  totalMoves: 0,

  // Settings
  currentSkin: 'default',
  soundEnabled: true
};
```

---

## Development Setup

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Text editor (VSCode, Sublime, Vim, etc.)
- Git
- Optional: Python 3 for local server

### Clone Repository
```bash
git clone https://github.com/ammonfife/ChessBlitzArena.git
cd ChessBlitzArena
```

### Open in Browser
```bash
# Method 1: Direct file
open index.html

# Method 2: Local server (avoids CORS issues)
python3 -m http.server 8000
open http://localhost:8000
```

### Recommended Editor Setup

**VSCode**:
```json
{
  "editor.tabSize": 2,
  "editor.detectIndentation": false,
  "editor.formatOnSave": true,
  "html.format.wrapLineLength": 120,
  "javascript.format.enable": true
}
```

**Extensions**:
- ESLint
- Prettier
- Live Server
- CSS Peek

---

## Making Changes

### Before You Start

1. **Check existing tickets**:
   ```bash
   cat TICKETS.md
   ```

2. **Archive current version**:
   ```bash
   ./archive-version.sh
   ```

3. **Create feature branch** (optional):
   ```bash
   git checkout -b feature/my-new-feature
   ```

### Development Workflow

```bash
# 1. Make changes to index.html
vim index.html

# 2. Test in browser
open index.html
# Refresh to see changes (Cmd+R)

# 3. Test with E2B (if applicable)
cd ../e2b
python examples/07_chess_blitz_test.py

# 4. Commit
git add index.html
git commit -m "feat: Add new feature"

# 5. Push
git push origin main
```

### Code Style Guidelines

**JavaScript**:
```javascript
// Use camelCase for functions and variables
function renderBoard() {}
const currentPuzzle = null;

// Use PascalCase for classes
class AIEngine {}

// Use UPPER_SNAKE_CASE for constants
const MAX_HINTS = 5;

// Prefer const over let, avoid var
const player = 'white';
let score = 0;

// Use template literals
console.log(`Player ${player} scored ${score}`);

// Use arrow functions where appropriate
const addXP = (amount) => {
  gameState.xp += amount;
};

// Add comments for complex logic
// Calculate rating change using Elo formula
const ratingChange = calculateElo(win, opponentRating);
```

**CSS**:
```css
/* Use kebab-case for class names */
.chess-board {}
.stats-panel {}

/* Use BEM if nesting */
.square--selected {}
.square__piece {}

/* Group related properties */
.container {
  /* Positioning */
  position: relative;
  top: 0;

  /* Box model */
  display: flex;
  width: 100%;
  padding: 20px;

  /* Typography */
  font-size: 16px;
  color: #333;

  /* Visual */
  background: white;
  border: 1px solid #ddd;

  /* Animation */
  transition: all 0.3s ease;
}
```

**HTML**:
```html
<!-- Use semantic HTML5 elements -->
<header>
<nav>
<main>
<section>
<article>
<footer>

<!-- Use data attributes for JS hooks -->
<div class="square" data-row="0" data-col="0"></div>

<!-- Use aria attributes for accessibility -->
<button aria-label="Start Assessment">START</button>
```

---

## Testing

### Manual Testing Checklist

```
Navigation & Initial Load:
[ ] Page loads without errors
[ ] Title displays correctly
[ ] All UI elements visible
[ ] No console errors

Assessment Flow:
[ ] "START ASSESSMENT" button works
[ ] 10-puzzle assessment loads
[ ] Puzzle counter updates
[ ] Rating calibrates correctly

Chess Board:
[ ] 64 squares render
[ ] All 32 pieces visible
[ ] White/black pieces distinguishable
[ ] Board orientation correct (player's color at bottom)

Piece Interaction:
[ ] Can click and select piece
[ ] Legal moves highlighted
[ ] Illegal moves rejected
[ ] Move executes correctly
[ ] Board updates after move

Gamification:
[ ] XP awarded for correct moves
[ ] XP bar fills correctly
[ ] Level-up triggers
[ ] Streak counter updates
[ ] Tier badge displays

Power-ups:
[ ] Hint shows best move
[ ] Freeze extends timer
[ ] Skip moves to next puzzle
[ ] Double XP multiplies reward
[ ] Counts decrement correctly

Persistence:
[ ] Progress saves to LocalStorage
[ ] Page refresh restores state
[ ] Settings persist
[ ] Unlocked content remains unlocked

UI/UX:
[ ] Animations smooth
[ ] Buttons responsive
[ ] Notifications appear
[ ] No visual glitches
[ ] Mobile layout works
```

### Automated Testing

```bash
# Basic functionality tests
cd /Users/benfife/github/ammonfife/e2b
python examples/07_chess_blitz_test.py

# Async UX evaluation
python examples/10_chess_ux_async.py

# Check results after 5 minutes
python -c "
from e2b_code_interpreter import Sandbox
s = Sandbox.connect('SANDBOX_ID')
print(s.commands.run('cat /home/user/EVALUATION_SUMMARY.txt').stdout)
s.kill()
"
```

### Browser Testing

Test in multiple browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile Safari (iOS)
- Chrome Mobile (Android)

### Performance Testing

```javascript
// In browser console
performance.measure('pageLoad', 'navigationStart', 'loadEventEnd');
performance.getEntriesByType('measure');

// Check FPS
let lastTime = performance.now();
let frames = 0;
function checkFPS() {
  frames++;
  const now = performance.now();
  if (now >= lastTime + 1000) {
    console.log(`FPS: ${frames}`);
    frames = 0;
    lastTime = now;
  }
  requestAnimationFrame(checkFPS);
}
checkFPS();
```

---

## Debugging

### Debug Console API

```javascript
// View all logs
chessDebug.getLogs()

// Filter by level
chessDebug.getLogs().filter(log => log.level === 'error')

// View errors only
chessDebug.getErrors()

// Export logs to file
chessDebug.exportLogs()

// View current game state
chessDebug.showStats()

// Get AI analysis for current position
chessDebug.getAIAnalysis()

// Clear logs
localStorage.removeItem('chess-blitz-logs')

// Reset progress (use with caution!)
localStorage.clear()
location.reload()
```

### Common Issues

**Issue: Pieces not selecting**
```javascript
// Check if event listeners attached
console.log(document.querySelector('.square').onclick);

// Check selected state
console.log(gameState.selectedSquare);

// Check CSS class applied
console.log(document.querySelector('.square.selected'));
```

**Issue: Stockfish not loading**
```javascript
// Check AI engine status
console.log(aiEngine.isReady);
console.log(aiEngine.engine);

// Test manually
aiEngine.init().then(() => console.log('Ready!'));
```

**Issue: LocalStorage not persisting**
```javascript
// Check quota
navigator.storage.estimate().then(console.log);

// Check if localStorage available
console.log(typeof(Storage) !== "undefined");

// Manual save/load
saveGameState();
loadGameState();
```

### Browser DevTools

**Elements Panel**:
- Inspect DOM structure
- Modify CSS in real-time
- View applied styles

**Console Panel**:
- Run JavaScript commands
- View logs and errors
- Test functions

**Network Panel**:
- Check CDN resource loading
- Verify no 404 errors
- Monitor request timing

**Performance Panel**:
- Record runtime performance
- Identify bottlenecks
- Check FPS

**Application Panel**:
- View LocalStorage
- Clear storage
- Inspect service workers (future)

---

## Performance

### Optimization Guidelines

**Minimize Reflows**:
```javascript
// Bad - triggers reflow multiple times
element.style.width = '100px';
element.style.height = '100px';
element.style.background = 'red';

// Good - batch DOM updates
element.classList.add('updated-style');
```

**Use RequestAnimationFrame**:
```javascript
// Bad - may cause jank
setInterval(() => updateAnimation(), 16);

// Good - synchronized with browser
function animate() {
  updateAnimation();
  requestAnimationFrame(animate);
}
animate();
```

**Debounce Expensive Operations**:
```javascript
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

const expensiveOperation = debounce(() => {
  // Heavy computation
}, 300);
```

**Optimize Images** (when added):
- Use WebP format
- Lazy load off-screen images
- Compress before upload
- Use CSS sprites for small icons

**Cache Calculations**:
```javascript
// Bad - recalculates every time
function getSquareSize() {
  return document.querySelector('.chess-board').clientWidth / 8;
}

// Good - cache and recalculate only when needed
let cachedSquareSize = null;
function getSquareSize() {
  if (!cachedSquareSize) {
    cachedSquareSize = document.querySelector('.chess-board').clientWidth / 8;
  }
  return cachedSquareSize;
}
window.addEventListener('resize', () => cachedSquareSize = null);
```

---

## Best Practices

### Code Organization
- Keep related code together
- Use clear section comments
- Extract repeated logic into functions
- Limit function complexity (< 50 lines ideal)

### Error Handling
```javascript
// Always handle errors
try {
  aiEngine.analyzePosition(fen);
} catch (error) {
  logger.log('error', 'AI analysis failed', { error });
  showNotification('Hint unavailable', 'error');
}

// Validate inputs
function addXP(amount) {
  if (typeof amount !== 'number' || amount < 0) {
    logger.log('error', 'Invalid XP amount', { amount });
    return;
  }
  gameState.xp += amount;
}
```

### Logging
```javascript
// Log important actions
logger.trackAction('puzzle_started', {
  puzzleId: currentPuzzle.id,
  difficulty: currentPuzzle.rating
});

// Log errors with context
logger.log('error', 'Move validation failed', {
  from: selectedSquare,
  to: targetSquare,
  piece: currentPiece
});
```

### Accessibility
- Use semantic HTML
- Add ARIA labels
- Ensure keyboard navigation
- Maintain sufficient contrast
- Test with screen readers

### Security
- Sanitize user input (if added)
- Validate data from LocalStorage
- Use HTTPS for CDN resources
- Implement CSP headers (future)

---

## Additional Resources

- **UX Requirements**: [UserExperienceRequirements.md](UserExperienceRequirements.md)
- **API Reference**: [API.md](API.md)
- **Deployment Guide**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Issue Tracker**: [TICKETS.md](TICKETS.md)
- **Test Status**: [TESTING_STATUS.md](TESTING_STATUS.md)

---

**Questions?** Check the documentation or open an issue on GitHub.
