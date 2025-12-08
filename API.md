# ChessBlitz Arena - JavaScript API Reference

**Developer API Documentation** | Updated: 2025-12-07

---

## Table of Contents

1. [Debug Console (chessDebug)](#debug-console-chessdebug)
2. [AI Engine (aiEngine)](#ai-engine-aiengine)
3. [Game State (gameState)](#game-state-gamestate)
4. [Logger (logger)](#logger-logger)
5. [Core Functions](#core-functions)
6. [Helper Functions](#helper-functions)

---

## Debug Console (chessDebug)

Global debugging interface available in browser console.

### Methods

#### `chessDebug.getLogs()`
Returns all logged events from current session.

```javascript
// Get all logs
const logs = chessDebug.getLogs();

// Filter by level
const errors = logs.filter(log => log.level === 'error');
const actions = logs.filter(log => log.level === 'action');

// Recent logs only
const recent = logs.slice(-10);
```

**Returns**: `Array<LogEntry>`
```typescript
interface LogEntry {
  timestamp: string;      // ISO 8601 format
  level: 'info' | 'success' | 'warn' | 'error' | 'action';
  message: string;
  sessionId: string;
  [key: string]: any;     // Additional data
}
```

---

#### `chessDebug.getErrors()`
Returns only error-level logs.

```javascript
const errors = chessDebug.getErrors();
console.table(errors);
```

**Returns**: `Array<LogEntry>` (filtered to errors only)

---

#### `chessDebug.exportLogs()`
Downloads all logs as JSON file.

```javascript
chessDebug.exportLogs();
// Downloads: chess-blitz-logs-[timestamp].json
```

**Returns**: `void` (triggers download)

---

####`chessDebug.showStats()`
Displays current game state statistics.

```javascript
chessDebug.showStats();
/* Outputs:
{
  xp: 1250,
  level: 5,
  rating: 1450,
  tier: 'Advanced',
  streak: 3,
  puzzlesSolved: 42,
  accuracy: 0.857,
  ...
}
*/
```

**Returns**: `Object` (current gameState)

---

#### `chessDebug.getAIAnalysis()`
Gets AI analysis for current board position (if available).

```javascript
const analysis = chessDebug.getAIAnalysis();
/* Returns:
{
  bestMove: 'e2e4',
  evaluation: 0.45,
  depth: 15,
  ready: true
}
*/
```

**Returns**: `Object | null`

---

## AI Engine (aiEngine)

Stockfish chess engine wrapper.

### Properties

#### `aiEngine.isReady`
```javascript
if (aiEngine.isReady) {
  console.log('Engine ready for analysis');
}
```

**Type**: `boolean`

#### `aiEngine.engine`
```javascript
// Direct access to Stockfish worker (advanced)
aiEngine.engine.postMessage('uci');
```

**Type**: `Worker | null`

### Methods

#### `aiEngine.init()`
Initializes Stockfish engine.

```javascript
await aiEngine.init();
// Engine now ready
```

**Returns**: `Promise<void>`

**Throws**: Error if engine fails to initialize

---

#### `aiEngine.analyzePosition(fen, depth = 15)`
Analyzes chess position and returns best move.

```javascript
const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const analysis = await aiEngine.analyzePosition(fen, 20);

console.log(analysis);
/* {
  bestMove: 'e2e4',
  evaluation: 0.25,
  depth: 20
} */
```

**Parameters**:
- `fen` (string): Position in FEN notation
- `depth` (number, optional): Search depth (default: 15)

**Returns**: `Promise<Object>`
```typescript
interface Analysis {
  bestMove: string;      // UCI format (e.g., 'e2e4')
  evaluation: number;    // Centipawns / 100
  depth: number;        // Actual search depth
}
```

---

## Game State (gameState)

Global game state object. **Read-only** (don't modify directly).

### Properties

```javascript
const gameState = {
  // Current puzzle
  currentPuzzle: {
    id: string,
    fen: string,
    solution: string[],
    rating: number,
    toMove: 'White' | 'Black'
  } | null,

  puzzleIndex: number,        // Current puzzle in assessment

  // Board state
  selectedSquare: { row: number, col: number } | null,
  legalMoves: Array<{from: string, to: string}>,

  // Progression
  xp: number,
  level: number,
  rating: number,
  tier: string,               // 'Beginner', 'Amateur', etc.

  // Gamification
  streak: number,
  bestStreak: number,
  achievements: string[],
  unlockedSkins: string[],

  // Power-ups
  hints: number,
  freezes: number,
  skips: number,
  doubleXP: number,

  // Statistics
  puzzlesSolved: number,
  correctMoves: number,
  totalMoves: number,
  startTime: number | null,

  // Settings
  currentSkin: string,
  soundEnabled: boolean
};
```

### Usage

```javascript
// Read values
console.log(`Current level: ${gameState.level}`);
console.log(`XP: ${gameState.xp}`);
console.log(`Streak: ${gameState.streak}`);

// Check puzzle state
if (gameState.currentPuzzle) {
  console.log(`Solving puzzle rated ${gameState.currentPuzzle.rating}`);
}

// Check power-up availability
if (gameState.hints > 0) {
  console.log('Hints available!');
}
```

---

## Logger (logger)

Logging system for tracking events and debugging.

### Methods

#### `logger.log(level, message, data = {})`
Logs an event.

```javascript
logger.log('info', 'Game started');
logger.log('success', 'Puzzle solved', { puzzleId: 42, time: 15 });
logger.log('warn', 'Low on hints', { remaining: 1 });
logger.log('error', 'AI engine failed', { error: errorObj });
```

**Parameters**:
- `level`: 'info' | 'success' | 'warn' | 'error' | 'action'
- `message`: string
- `data`: Object (optional additional data)

**Returns**: `void`

---

#### `logger.trackAction(action, data = {})`
Tracks user action (sugar for `logger.log('action', ...)`).

```javascript
logger.trackAction('piece_selected', { row: 4, col: 4 });
logger.trackAction('power_up_used', { type: 'hint' });
logger.trackAction('puzzle_completed', { correct: true, time: 23 });
```

**Parameters**:
- `action`: string (action name)
- `data`: Object (action data)

**Returns**: `void`

---

## Core Functions

### Game Flow

#### `startAssessment()`
Starts the 10-puzzle assessment.

```javascript
startAssessment();
// Loads first puzzle, hides start screen
```

**Returns**: `void`

---

#### `loadPuzzle()`
Loads current puzzle from queue.

```javascript
loadPuzzle();
// Updates board, UI, starts timer
```

**Returns**: `void`

---

#### `nextPuzzle()`
Advances to next puzzle.

```javascript
nextPuzzle();
// Saves progress, loads next puzzle
```

**Returns**: `void`

---

### Board Interaction

#### `handleSquareClick(row, col)`
Handles click on chess square.

```javascript
// Called automatically on click
// Can also call manually:
handleSquareClick(4, 4);  // Click e4
```

**Parameters**:
- `row`: number (0-7, where 0 is top)
- `col`: number (0-7, where 0 is left)

**Returns**: `void`

---

#### `renderBoard()`
Re-renders the chess board.

```javascript
renderBoard();
// Updates all squares based on current puzzle
```

**Returns**: `void`

---

### Progression

#### `addXP(amount)`
Awards XP to player.

```javascript
addXP(50);          // Regular puzzle
addXP(100);         // Double XP active
addXP(75, true);    // With streak bonus
```

**Parameters**:
- `amount`: number (XP to award)

**Returns**: `void` (may trigger level-up)

---

#### `levelUp()`
Handles level-up logic.

```javascript
// Usually called automatically by addXP()
// Can call manually for testing:
levelUp();
```

**Returns**: `void`

---

#### `updateRating(won, opponentRating)`
Updates player rating using Elo system.

```javascript
updateRating(true, 1500);   // Beat 1500-rated puzzle
updateRating(false, 1200);  // Lost to 1200-rated puzzle
```

**Parameters**:
- `won`: boolean
- `opponentRating`: number

**Returns**: `void`

---

### Power-ups

#### `showHint()`
Shows AI-powered hint for current position.

```javascript
await showHint();
// Highlights best move, shows explanation
```

**Returns**: `Promise<void>`

**Requirements**:
- `gameState.hints > 0`
- `aiEngine.isReady === true`

---

#### `freezeTimer()`
Pauses the puzzle timer.

```javascript
freezeTimer();
// Timer frozen for 30 seconds
```

**Returns**: `void`

---

#### `skipPuzzle()`
Skips current puzzle without penalty.

```javascript
skipPuzzle();
// Moves to next puzzle
```

**Returns**: `void`

---

## Helper Functions

### FEN Parsing

#### `fenToBoard(fen)`
Converts FEN string to 2D array.

```javascript
const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const board = fenToBoard(fen);

console.log(board[0][0]);  // 'r' (black rook)
console.log(board[7][4]);  // 'K' (white king)
```

**Parameters**:
- `fen`: string (FEN notation)

**Returns**: `string[][]` (8x8 array, '' for empty squares)

---

### UI Updates

#### `updateStatsDisplay()`
Updates all stat displays (XP, level, rating, etc.).

```javascript
updateStatsDisplay();
// Refreshes all UI elements
```

**Returns**: `void`

---

#### `showNotification(message, type = 'info')`
Shows temporary notification.

```javascript
showNotification('Puzzle solved!', 'success');
showNotification('Wrong move', 'error');
showNotification('Hint used', 'info');
```

**Parameters**:
- `message`: string
- `type`: 'info' | 'success' | 'error' | 'warning'

**Returns**: `void`

---

### Storage

#### `saveGameState()`
Saves current game state to LocalStorage.

```javascript
saveGameState();
// Persists all progress
```

**Returns**: `void`

---

#### `loadGameState()`
Loads game state from LocalStorage.

```javascript
loadGameState();
// Restores saved progress
```

**Returns**: `void`

---

## Events

The game emits custom events that can be listened to:

```javascript
window.addEventListener('puzzle-solved', (event) => {
  console.log('Puzzle solved!', event.detail);
});

window.addEventListener('level-up', (event) => {
  console.log('Level up!', event.detail.newLevel);
});

window.addEventListener('streak-milestone', (event) => {
  console.log('Streak:', event.detail.streak);
});
```

**Available Events**:
- `puzzle-solved`
- `puzzle-failed`
- `level-up`
- `streak-milestone`
- `achievement-earned`
- `skin-unlocked`

---

## Constants

```javascript
// XP Requirements
const XP_PER_LEVEL = 100;
const XP_FOR_CORRECT = 50;
const XP_FOR_STREAK = 25;

// Rating Ranges
const RATING_RANGES = {
  Beginner: [0, 899],
  Amateur: [900, 1099],
  Intermediate: [1100, 1299],
  Advanced: [1300, 1499],
  Expert: [1500, 1699],
  Master: [1700, 1999],
  Grandmaster: [2000, Infinity]
};

// Power-up Limits
const MAX_HINTS = 5;
const MAX_FREEZES = 3;
const MAX_SKIPS = 3;

// Board Configuration
const PIECE_MAP = {
  'K': '♔', 'Q': '♕', 'R': '♖',
  'B': '♗', 'N': '♘', 'P': '♙',
  'k': '♚', 'q': '♛', 'r': '♜',
  'b': '♝', 'n': '♞', 'p': '♟'
};
```

---

## Examples

### Check if Player Can Use Hint

```javascript
function canUseHint() {
  return gameState.hints > 0 && aiEngine.isReady;
}

if (canUseHint()) {
  await showHint();
}
```

### Get Player's Win Rate

```javascript
function getWinRate() {
  if (gameState.totalMoves === 0) return 0;
  return (gameState.correctMoves / gameState.totalMoves * 100).toFixed(1);
}

console.log(`Win rate: ${getWinRate()}%`);
```

### Check Current Tier

```javascript
function getCurrentTier() {
  for (const [tier, [min, max]] of Object.entries(RATING_RANGES)) {
    if (gameState.rating >= min && gameState.rating <= max) {
      return tier;
    }
  }
  return 'Unranked';
}

console.log(`Current tier: ${getCurrentTier()}`);
```

### Export All Data

```javascript
function exportAllData() {
  return {
    gameState: gameState,
    logs: chessDebug.getLogs(),
    timestamp: new Date().toISOString()
  };
}

console.log(JSON.stringify(exportAllData(), null, 2));
```

---

## TypeScript Definitions (Reference)

```typescript
// For reference only - app uses vanilla JS

interface GameState {
  currentPuzzle: Puzzle | null;
  puzzleIndex: number;
  selectedSquare: Square | null;
  legalMoves: Move[];
  xp: number;
  level: number;
  rating: number;
  tier: string;
  streak: number;
  bestStreak: number;
  achievements: string[];
  unlockedSkins: string[];
  hints: number;
  freezes: number;
  skips: number;
  doubleXP: number;
  puzzlesSolved: number;
  correctMoves: number;
  totalMoves: number;
  startTime: number | null;
  currentSkin: string;
  soundEnabled: boolean;
}

interface Puzzle {
  id: string;
  fen: string;
  solution: string[];
  rating: number;
  toMove: 'White' | 'Black';
}

interface Square {
  row: number;
  col: number;
}

interface Move {
  from: string;
  to: string;
}
```

---

For more information, see:
- [DEVELOPMENT.md](DEVELOPMENT.md) - Development guide
- [QUICKSTART.md](QUICKSTART.md) - Quick start
- [UserExperienceRequirements.md](UserExperienceRequirements.md) - UX spec
