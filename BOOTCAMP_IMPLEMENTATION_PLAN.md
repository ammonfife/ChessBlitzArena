# 5-Day Bootcamp Implementation Plan

**Goal**: Implement adaptive intensive training system (900 → 1600 in 5 days)
**Approach**: Fully adaptive, theme-based, real-time performance tracking
**Integration**: Extend existing system, keep assessment/practice modes intact

---

## Architecture Overview

### Three Modes (User Selects at Start):
1. **Assessment Mode** (existing) - 10-puzzle skill test
2. **Practice Mode** (existing) - Casual continuous practice
3. **Bootcamp Mode** (NEW) - Intensive 5-day training

---

## Phase 1: State Management & Data Structures

### 1.1 Extend `gameState` Object
**Location**: `index.html` line ~1587

**Add to gameState:**
```javascript
// Bootcamp state
inBootcamp: false,
bootcampDay: 0,                    // 1-5
bootcampStartTime: null,           // timestamp
bootcampMode: 'learning',          // learning|practice|speed|blitz|ultra
bootcampSessionStart: null,        // current session start time
bootcampPuzzlesToday: 0,           // puzzles completed today
bootcampTargetToday: 0,            // daily target

// Theme performance tracking (adaptive core)
themeStats: {
  // Dynamically populated, e.g.:
  // fork: { correct: 45, total: 50, mastery: 90.0, lastTested: timestamp, needsDrill: false },
  // pin: { correct: 28, total: 50, mastery: 56.0, lastTested: timestamp, needsDrill: true }
},

// Session tracking
sessionPuzzles: [],                // Array of {puzzleId, theme, correct, time, timestamp}
sessionStartTime: null,
sessionBreaks: [],                 // Array of {start, end} break times

// Daily progress
dailyStats: {
  day1: { puzzles: 0, rating: 0, themes: {} },
  day2: { puzzles: 0, rating: 0, themes: {} },
  // ... day3-5
}
```

**Files to modify:**
- `index.html` lines 1587-1639 (gameState definition)
- `index.html` lines 1993-2007 (saveGameState - add bootcamp fields)
- `index.html` lines 1984-1991 (loadGameState - handle bootcamp fields)

---

### 1.2 Load Bootcamp Curriculum
**Location**: After `loadPuzzleDatabase()` at line ~1867

**New function:**
```javascript
let bootcampCurriculum = null;

async function loadBootcampCurriculum() {
  try {
    const response = await fetch('bootcamp-curriculum.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    bootcampCurriculum = await response.json();
    logger.log('success', 'Loaded bootcamp curriculum', {
      days: bootcampCurriculum.daily_targets.length,
      theme_pools: Object.keys(bootcampCurriculum.theme_pools).length
    });
    return true;
  } catch (error) {
    logger.log('error', 'Failed to load bootcamp curriculum', { error: error.message });
    return false;
  }
}
```

**Call in init():**
```javascript
async function init() {
  await loadPuzzleDatabase();
  await loadBootcampCurriculum();  // ADD THIS
  // ... rest of init
}
```

---

## Phase 2: Adaptive Puzzle Selection Algorithm

### 2.1 Theme Performance Tracker
**Location**: New section after puzzle loading (~line 2600)

**Core Functions:**
```javascript
// Update theme stats after each puzzle
function updateThemeStats(puzzle, wasCorrect, timeSpent) {
  const themes = puzzle.themes || [];

  themes.forEach(theme => {
    if (!gameState.themeStats[theme]) {
      gameState.themeStats[theme] = {
        correct: 0,
        total: 0,
        mastery: 0,
        lastTested: Date.now(),
        needsDrill: false,
        attempts: []
      };
    }

    const stats = gameState.themeStats[theme];
    stats.total++;
    if (wasCorrect) stats.correct++;
    stats.mastery = (stats.correct / stats.total) * 100;
    stats.lastTested = Date.now();
    stats.attempts.push({ correct: wasCorrect, time: timeSpent, timestamp: Date.now() });

    // Keep only last 100 attempts
    if (stats.attempts.length > 100) stats.attempts.shift();

    // Mark as needing drill if below threshold
    const rules = bootcampCurriculum.adaptation_rules;
    stats.needsDrill = stats.mastery < rules.acceptable_threshold && stats.total >= rules.min_sample_size;
  });

  logger.log('info', 'Theme stats updated', { themes, mastery: getMasterySnapshot() });
}

// Get current mastery snapshot
function getMasterySnapshot() {
  const snapshot = {};
  Object.keys(gameState.themeStats).forEach(theme => {
    snapshot[theme] = Math.round(gameState.themeStats[theme].mastery);
  });
  return snapshot;
}

// Identify weak themes needing focus
function getWeakThemes() {
  const rules = bootcampCurriculum.adaptation_rules;
  const weak = [];

  Object.entries(gameState.themeStats).forEach(([theme, stats]) => {
    if (stats.total >= rules.min_sample_size && stats.mastery < rules.acceptable_threshold) {
      weak.push({
        theme,
        mastery: stats.mastery,
        deficit: rules.acceptable_threshold - stats.mastery,
        priority: (rules.acceptable_threshold - stats.mastery) * stats.total
      });
    }
  });

  // Sort by priority (higher = more urgent)
  weak.sort((a, b) => b.priority - a.priority);
  return weak;
}

// Check if theme is mastered (can skip/reduce)
function isThemeMastered(theme) {
  const stats = gameState.themeStats[theme];
  if (!stats || stats.total < 20) return false; // Need min sample

  const rules = bootcampCurriculum.adaptation_rules;
  return stats.mastery >= rules.mastery_threshold;
}
```

**Integration Point:**
- Call `updateThemeStats()` in `handleCorrectAnswer()` and `handleWrongAnswer()`
- Modify lines ~2274-2340 (correct/wrong answer handlers)

---

### 2.2 Adaptive Puzzle Selector
**Location**: New function replacing `loadRatedPuzzle()` when in bootcamp mode

**Core Algorithm:**
```javascript
function loadBootcampPuzzle() {
  // 1. Determine which theme pool to use (based on day/rating)
  const dayData = bootcampCurriculum.daily_targets[gameState.bootcampDay - 1];
  const poolName = dayData.focus; // e.g., "foundation", "patterns", "combinations"
  const themePool = bootcampCurriculum.theme_pools[poolName];

  // 2. Get weak themes
  const weakThemes = getWeakThemes();

  // 3. Decide selection strategy
  const roll = Math.random();
  let selectedTheme = null;

  if (roll < 0.70 && weakThemes.length > 0) {
    // 70% chance: Focus on weakness
    selectedTheme = weakThemes[0].theme;
    logger.log('info', 'Weakness focus', { theme: selectedTheme, mastery: weakThemes[0].mastery });

  } else if (roll < 0.90) {
    // 20% chance: Maintenance (practice all themes from pool)
    const poolThemes = themePool.themes.filter(t => {
      const stats = gameState.themeStats[t.id];
      return !stats || !isThemeMastered(t.id);
    });
    if (poolThemes.length > 0) {
      selectedTheme = poolThemes[Math.floor(Math.random() * poolThemes.length)].id;
      logger.log('info', 'Maintenance', { theme: selectedTheme });
    }

  } else {
    // 10% chance: Introduce new theme
    const unseenThemes = themePool.themes.filter(t => !gameState.themeStats[t.id]);
    if (unseenThemes.length > 0) {
      selectedTheme = unseenThemes[Math.floor(Math.random() * unseenThemes.length)].id;
      logger.log('info', 'New theme', { theme: selectedTheme });
    }
  }

  // 4. Filter puzzles by theme and rating range
  const rating = gameState.rating;
  const ratingRange = themePool.rating_range;
  const minRating = Math.max(rating - 150, ratingRange[0]);
  const maxRating = Math.min(rating + 150, ratingRange[1]);

  const candidates = getAllPuzzlesWithTheme(selectedTheme, minRating, maxRating);

  if (candidates.length === 0) {
    logger.log('warn', 'No puzzles found for theme, falling back to pool', { theme: selectedTheme });
    // Fallback: any puzzle in rating range
    candidates = getAllPuzzlesInRange(minRating, maxRating);
  }

  // 5. Select random puzzle from candidates
  const puzzle = candidates[Math.floor(Math.random() * candidates.length)];
  gameState.currentPuzzle = puzzle;
  gameState.puzzlesAttempted++;
  gameState.bootcampPuzzlesToday++;

  // 6. Track session
  gameState.sessionPuzzles.push({
    puzzleId: puzzle.id,
    themes: puzzle.themes,
    rating: puzzle.rating,
    startTime: Date.now()
  });

  initializeChessInstance();
  renderBoard();
  updatePuzzleInfo();
  startTimer();

  logger.log('info', 'Loaded bootcamp puzzle', {
    theme: selectedTheme,
    puzzleRating: puzzle.rating,
    playerRating: rating
  });
}

// Helper: Get all puzzles with specific theme
function getAllPuzzlesWithTheme(theme, minRating, maxRating) {
  const allPuzzles = [];

  // Iterate through all tier databases
  Object.values(puzzleDatabase).forEach(tierPuzzles => {
    tierPuzzles.forEach(puzzle => {
      if (puzzle.themes && puzzle.themes.includes(theme) &&
          puzzle.rating >= minRating && puzzle.rating <= maxRating) {
        allPuzzles.push(puzzle);
      }
    });
  });

  return allPuzzles;
}

// Helper: Get all puzzles in rating range
function getAllPuzzlesInRange(minRating, maxRating) {
  const allPuzzles = [];

  Object.values(puzzleDatabase).forEach(tierPuzzles => {
    tierPuzzles.forEach(puzzle => {
      if (puzzle.rating >= minRating && puzzle.rating <= maxRating) {
        allPuzzles.push(puzzle);
      }
    });
  });

  return allPuzzles;
}
```

**Integration:**
- Modify `loadNextPuzzle()` to check for `gameState.inBootcamp` and call `loadBootcampPuzzle()`
- Location: ~line 2527

```javascript
function loadNextPuzzle() {
  if (gameState.currentPuzzle) {
    addToHistory(gameState.currentPuzzle);
  }

  gameState.hintUsed = false;

  if (gameState.inAssessment) {
    loadAssessmentPuzzle();
  } else if (gameState.inBootcamp) {
    loadBootcampPuzzle();  // NEW
  } else {
    loadRatedPuzzle();
  }
}
```

---

## Phase 3: UI Components

### 3.1 Mode Selection Modal
**Location**: Add new modal after welcome modal (~line 1269)

**HTML Structure:**
```html
<!-- Mode Selection Modal (shown after assessment) -->
<div class="modal-overlay" id="mode-selection-modal">
  <div class="modal large-modal">
    <div class="modal-title">Choose Your Training Path</div>

    <div class="mode-options">
      <!-- Practice Mode (existing) -->
      <div class="mode-card" onclick="selectMode('practice')">
        <div class="mode-icon">♟️</div>
        <div class="mode-name">Practice Mode</div>
        <div class="mode-description">
          Casual training at your own pace<br>
          • No time pressure<br>
          • Adaptive difficulty<br>
          • Perfect for daily practice
        </div>
      </div>

      <!-- Bootcamp Mode (NEW) -->
      <div class="mode-card highlight" onclick="selectMode('bootcamp')">
        <div class="mode-icon">🔥</div>
        <div class="mode-name">Bootcamp Mode</div>
        <div class="mode-description">
          <strong>Intensive 5-day training</strong><br>
          • 900 → 1600 rating<br>
          • 10-12 hours/day<br>
          • Adaptive weakness correction<br>
          • Real-time progress tracking
        </div>
        <div class="mode-badge">RECOMMENDED</div>
      </div>
    </div>
  </div>
</div>
```

**CSS** (add to styles section ~line 40-1200):
```css
.mode-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 30px;
}

.mode-card {
  background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
  border: 2px solid var(--primary);
  border-radius: 16px;
  padding: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.mode-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(108, 92, 231, 0.4);
  border-color: var(--gold);
}

.mode-card.highlight {
  border-color: var(--gold);
  box-shadow: 0 0 30px rgba(253, 203, 110, 0.3);
}

.mode-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.mode-name {
  font-size: 24px;
  font-weight: bold;
  color: var(--gold);
  margin-bottom: 12px;
}

.mode-description {
  color: #cbd5e0;
  line-height: 1.6;
  font-size: 14px;
}

.mode-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  background: var(--gold);
  color: #1a202c;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: bold;
  letter-spacing: 0.5px;
}
```

**JavaScript:**
```javascript
function selectMode(mode) {
  document.getElementById('mode-selection-modal').classList.remove('active');

  if (mode === 'bootcamp') {
    startBootcamp();
  } else {
    // Existing practice mode
    updateAllDisplays();
    loadNextPuzzle();
  }
}
```

---

### 3.2 Bootcamp Dashboard (HUD)
**Location**: Replace or extend existing stats display

**HTML** (add to main game area ~line 1100):
```html
<!-- Bootcamp HUD (shown only in bootcamp mode) -->
<div id="bootcamp-hud" style="display: none;">
  <!-- Daily Progress Bar -->
  <div class="bootcamp-daily-progress">
    <div class="progress-header">
      <span>DAY <span id="bootcamp-day-num">1</span> OF 5 - <span id="bootcamp-day-name">FOUNDATION BLITZ</span></span>
      <span id="bootcamp-time-today">0h 0m</span>
    </div>
    <div class="progress-bar-container">
      <div class="progress-bar" id="bootcamp-daily-bar"></div>
      <span class="progress-text">
        <span id="bootcamp-puzzles-done">0</span>/<span id="bootcamp-puzzles-target">340</span> puzzles
      </span>
    </div>
  </div>

  <!-- Rating Progress -->
  <div class="bootcamp-rating-box">
    <div class="stat-label">Rating</div>
    <div class="rating-display">
      <span id="bootcamp-rating-current">900</span>
      <span class="rating-arrow">→</span>
      <span id="bootcamp-rating-target">1050</span>
    </div>
    <div class="rating-gain" id="bootcamp-rating-gain">+0 today</div>
  </div>

  <!-- Session Stats -->
  <div class="bootcamp-session-stats">
    <div class="stat-box">
      <div class="stat-value" id="bootcamp-success-rate">0%</div>
      <div class="stat-label">Success Rate</div>
    </div>
    <div class="stat-box">
      <div class="stat-value" id="bootcamp-current-speed">0s</div>
      <div class="stat-label">Avg Speed</div>
    </div>
    <div class="stat-box">
      <div class="stat-value" id="bootcamp-session-mode">LEARNING</div>
      <div class="stat-label">Mode</div>
    </div>
  </div>

  <!-- Weak Themes Alert -->
  <div class="bootcamp-weak-themes" id="bootcamp-weak-themes" style="display: none;">
    <div class="alert-icon">⚠️</div>
    <div class="alert-text">
      <strong>Weak Theme Detected:</strong>
      <span id="weak-theme-name">Pin</span> (<span id="weak-theme-mastery">58%</span>)
      <br>
      <small>System will inject more puzzles of this type</small>
    </div>
  </div>

  <!-- Theme Mastery Sidebar -->
  <div class="theme-mastery-panel">
    <div class="panel-title">Theme Mastery</div>
    <div id="theme-mastery-list">
      <!-- Dynamically populated -->
    </div>
  </div>
</div>
```

**CSS:**
```css
#bootcamp-hud {
  position: fixed;
  top: 80px;
  left: 20px;
  right: 20px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 20px;
  z-index: 100;
  pointer-events: none;
}

.bootcamp-daily-progress {
  background: rgba(26, 32, 44, 0.95);
  border: 2px solid var(--primary);
  border-radius: 12px;
  padding: 20px;
  pointer-events: auto;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: bold;
  color: var(--gold);
}

.progress-bar-container {
  position: relative;
  background: rgba(255, 255, 255, 0.1);
  height: 30px;
  border-radius: 15px;
  overflow: hidden;
}

.progress-bar {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: linear-gradient(90deg, var(--primary), var(--gold));
  transition: width 0.5s ease;
  border-radius: 15px;
}

.progress-text {
  position: absolute;
  width: 100%;
  text-align: center;
  line-height: 30px;
  font-weight: bold;
  color: white;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}

.bootcamp-weak-themes {
  background: rgba(231, 76, 60, 0.15);
  border: 2px solid #e74c3c;
  border-radius: 12px;
  padding: 15px;
  display: flex;
  gap: 15px;
  align-items: center;
  pointer-events: auto;
  animation: pulse 2s infinite;
}

.theme-mastery-panel {
  position: fixed;
  right: 20px;
  top: 200px;
  width: 250px;
  background: rgba(26, 32, 44, 0.95);
  border: 2px solid var(--primary);
  border-radius: 12px;
  padding: 20px;
  max-height: 500px;
  overflow-y: auto;
  pointer-events: auto;
}

.theme-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.theme-item:last-child {
  border-bottom: none;
}

.theme-name {
  font-size: 13px;
  color: #cbd5e0;
}

.theme-mastery-value {
  font-weight: bold;
  font-size: 14px;
}

.theme-mastery-value.high {
  color: #48bb78;
}

.theme-mastery-value.medium {
  color: #f6ad55;
}

.theme-mastery-value.low {
  color: #fc8181;
}
```

---

### 3.3 Real-Time Updates
**Location**: New function called after each puzzle

```javascript
function updateBootcampHUD() {
  if (!gameState.inBootcamp) return;

  const dayData = bootcampCurriculum.daily_targets[gameState.bootcampDay - 1];

  // Update day info
  document.getElementById('bootcamp-day-num').textContent = gameState.bootcampDay;
  document.getElementById('bootcamp-day-name').textContent = dayData.name.toUpperCase();

  // Update progress bar
  const progress = (gameState.bootcampPuzzlesToday / dayData.puzzles_target) * 100;
  document.getElementById('bootcamp-daily-bar').style.width = progress + '%';
  document.getElementById('bootcamp-puzzles-done').textContent = gameState.bootcampPuzzlesToday;
  document.getElementById('bootcamp-puzzles-target').textContent = dayData.puzzles_target;

  // Update rating
  const ratingStart = gameState.dailyStats[`day${gameState.bootcampDay}`]?.startRating || gameState.rating;
  const ratingGain = gameState.rating - ratingStart;
  document.getElementById('bootcamp-rating-current').textContent = gameState.rating;
  document.getElementById('bootcamp-rating-target').textContent = dayData.rating_target;
  document.getElementById('bootcamp-rating-gain').textContent = `${ratingGain >= 0 ? '+' : ''}${ratingGain} today`;

  // Update session stats
  const recentPuzzles = gameState.sessionPuzzles.slice(-20);
  const successRate = recentPuzzles.length > 0
    ? (recentPuzzles.filter(p => p.correct).length / recentPuzzles.length * 100).toFixed(0)
    : 0;
  document.getElementById('bootcamp-success-rate').textContent = successRate + '%';

  const avgSpeed = recentPuzzles.length > 0
    ? (recentPuzzles.reduce((sum, p) => sum + (p.timeSpent || 30), 0) / recentPuzzles.length).toFixed(0)
    : 0;
  document.getElementById('bootcamp-current-speed').textContent = avgSpeed + 's';

  document.getElementById('bootcamp-session-mode').textContent = gameState.bootcampMode.toUpperCase();

  // Update weak themes alert
  const weakThemes = getWeakThemes();
  if (weakThemes.length > 0) {
    document.getElementById('bootcamp-weak-themes').style.display = 'flex';
    document.getElementById('weak-theme-name').textContent = weakThemes[0].theme;
    document.getElementById('weak-theme-mastery').textContent = weakThemes[0].mastery.toFixed(0) + '%';
  } else {
    document.getElementById('bootcamp-weak-themes').style.display = 'none';
  }

  // Update theme mastery list
  updateThemeMasteryPanel();
}

function updateThemeMasteryPanel() {
  const dayData = bootcampCurriculum.daily_targets[gameState.bootcampDay - 1];
  const themePool = bootcampCurriculum.theme_pools[dayData.focus];

  let html = '';
  themePool.themes.forEach(themeData => {
    const stats = gameState.themeStats[themeData.id];
    const mastery = stats ? stats.mastery.toFixed(0) : 0;
    const masteryClass = mastery >= 85 ? 'high' : mastery >= 70 ? 'medium' : 'low';
    const attempts = stats ? stats.total : 0;

    html += `
      <div class="theme-item">
        <span class="theme-name">${themeData.name} (${attempts})</span>
        <span class="theme-mastery-value ${masteryClass}">${mastery}%</span>
      </div>
    `;
  });

  document.getElementById('theme-mastery-list').innerHTML = html;
}
```

**Integration:**
- Call `updateBootcampHUD()` after each puzzle in `loadNextPuzzle()`
- Call on init if resuming bootcamp session

---

## Phase 4: Session Management

### 4.1 Bootcamp Start Function
```javascript
function startBootcamp() {
  // Initialize bootcamp state
  gameState.inBootcamp = true;
  gameState.bootcampDay = 1;
  gameState.bootcampStartTime = Date.now();
  gameState.bootcampSessionStart = Date.now();
  gameState.bootcampPuzzlesToday = 0;
  gameState.bootcampMode = 'learning';

  const dayData = bootcampCurriculum.daily_targets[0];
  gameState.bootcampTargetToday = dayData.puzzles_target;

  // Initialize daily stats
  gameState.dailyStats.day1 = {
    puzzles: 0,
    startRating: gameState.rating,
    themes: {}
  };

  // Show bootcamp UI
  document.getElementById('bootcamp-hud').style.display = 'grid';

  // Hide normal UI elements
  document.querySelector('.daily-progress').style.display = 'none';

  // Show welcome message
  showBootcampWelcome();

  // Load first puzzle
  loadNextPuzzle();

  saveGameState();

  logger.log('info', 'Bootcamp started', {
    day: 1,
    target: dayData.puzzles_target,
    ratingGoal: dayData.rating_target
  });
}

function showBootcampWelcome() {
  // Show modal with Day 1 plan
  const dayData = bootcampCurriculum.daily_targets[0];
  const themePool = bootcampCurriculum.theme_pools[dayData.focus];

  const themesHtml = themePool.themes.map(t => `
    <li><strong>${t.name}</strong>: ${t.description}</li>
  `).join('');

  showModal('bootcamp-welcome', `
    <div class="modal-emoji">🔥</div>
    <div class="modal-title">Day 1: ${dayData.name}</div>
    <div style="text-align: left; margin: 20px 0;">
      <p><strong>Goal:</strong> ${dayData.rating_start} → ${dayData.rating_target} (+${dayData.rating_gain} rating)</p>
      <p><strong>Target:</strong> ${dayData.puzzles_target} puzzles in ${dayData.hours} hours</p>
      <p><strong>Themes to master:</strong></p>
      <ul>${themesHtml}</ul>
    </div>
    <button class="btn btn-gold" onclick="closeModal('bootcamp-welcome')">Let's Go! 🚀</button>
  `);
}
```

### 4.2 Break Timer System
```javascript
let breakTimerInterval = null;
let breakTimerStart = null;

function startBreakTimer() {
  // Pause puzzle timer
  clearInterval(gameState.timerInterval);
  gameState.timerFrozen = true;

  breakTimerStart = Date.now();
  const BREAK_DURATION = 10 * 60 * 1000; // 10 minutes

  showModal('break-timer', `
    <div class="modal-emoji">☕</div>
    <div class="modal-title">Break Time!</div>
    <p>You've been solving for 50+ minutes.</p>
    <p>Take a 10-minute break:</p>
    <ul style="text-align: left; margin: 20px auto; max-width: 300px;">
      <li>✓ Walk around</li>
      <li>✓ Hydrate</li>
      <li>✓ Rest eyes</li>
      <li>✓ Stretch</li>
    </ul>
    <div id="break-timer-display" style="font-size: 48px; font-weight: bold; color: var(--gold); margin: 20px 0;">10:00</div>
    <button class="btn" onclick="skipBreak()">Skip Break</button>
    <button class="btn" onclick="extendBreak()">Extend to 15min</button>
  `);

  breakTimerInterval = setInterval(() => {
    const elapsed = Date.now() - breakTimerStart;
    const remaining = BREAK_DURATION - elapsed;

    if (remaining <= 0) {
      endBreak();
    } else {
      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      document.getElementById('break-timer-display').textContent =
        `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  }, 1000);
}

function endBreak() {
  clearInterval(breakTimerInterval);
  closeModal('break-timer');

  // Track break
  gameState.sessionBreaks.push({
    start: breakTimerStart,
    end: Date.now()
  });

  // Resume timer
  gameState.timerFrozen = false;
  gameState.timerInterval = setInterval(() => {
    if (!gameState.timerFrozen) {
      gameState.timer--;
      updateTimerDisplay();
      if (gameState.timer <= 0) handleTimeout();
    }
  }, 1000);

  logger.log('info', 'Break ended', { duration: Date.now() - breakTimerStart });
}

function skipBreak() {
  clearInterval(breakTimerInterval);
  endBreak();
}

function extendBreak() {
  // Extend to 15 minutes
  breakTimerStart = Date.now() - (10 * 60 * 1000) + (15 * 60 * 1000);
}

// Auto-trigger break timer
function checkBreakNeeded() {
  if (!gameState.inBootcamp) return;

  const sessionDuration = Date.now() - gameState.bootcampSessionStart;
  const FIFTY_MINUTES = 50 * 60 * 1000;

  // Check if 50+ minutes without a break
  const lastBreak = gameState.sessionBreaks.length > 0
    ? gameState.sessionBreaks[gameState.sessionBreaks.length - 1].end
    : gameState.bootcampSessionStart;

  const timeSinceBreak = Date.now() - lastBreak;

  if (timeSinceBreak >= FIFTY_MINUTES) {
    startBreakTimer();
  }
}
```

**Integration:**
- Call `checkBreakNeeded()` after each puzzle in `loadNextPuzzle()`

---

### 4.3 Daily Completion Report
```javascript
function completeDailyBootcamp() {
  const dayData = bootcampCurriculum.daily_targets[gameState.bootcampDay - 1];
  const stats = gameState.dailyStats[`day${gameState.bootcampDay}`];

  const ratingGain = gameState.rating - stats.startRating;
  const puzzlesDone = gameState.bootcampPuzzlesToday;
  const targetPuzzles = dayData.puzzles_target;
  const targetRating = dayData.rating_target;

  const status = ratingGain >= dayData.rating_gain ? '🔥 AHEAD OF PACE!' :
                 ratingGain >= dayData.rating_gain * 0.8 ? '✓ ON TRACK' :
                 '⚠️ BEHIND PACE';

  // Get weak themes
  const weakThemes = getWeakThemes();
  const weakHtml = weakThemes.length > 0
    ? weakThemes.slice(0, 3).map(w => `
        <li>${w.theme}: ${w.mastery.toFixed(0)}%</li>
      `).join('')
    : '<li>None! All themes above 70%</li>';

  // Get mastered themes
  const masteredThemes = Object.entries(gameState.themeStats)
    .filter(([theme, stats]) => stats.mastery >= 85 && stats.total >= 20)
    .map(([theme, stats]) => `<li>${theme}: ${stats.mastery.toFixed(0)}%</li>`)
    .join('');

  // Next day preview
  const nextDay = gameState.bootcampDay + 1;
  const nextDayData = nextDay <= 5 ? bootcampCurriculum.daily_targets[nextDay - 1] : null;
  const nextDayHtml = nextDayData ? `
    <h3>📅 TOMORROW'S PREVIEW: Day ${nextDay} - ${nextDayData.name}</h3>
    <p>
      <strong>Target:</strong> ${nextDayData.rating_start} → ${nextDayData.rating_target} (+${nextDayData.rating_gain})<br>
      <strong>Lessons:</strong> ${nextDayData.puzzles_target} puzzles<br>
      <strong>Focus:</strong> ${nextDayData.description}<br>
      <strong>Estimated:</strong> ${nextDayData.hours} hours
    </p>
    <p style="color: var(--gold); margin-top: 20px;">
      Get 8 hours sleep. See you at 8 AM! 💪
    </p>
  ` : `
    <h3>🎉 BOOTCAMP COMPLETE!</h3>
    <p>You've finished all 5 days. Final assessment tomorrow!</p>
  `;

  showModal('daily-complete', `
    <div class="modal-emoji">🎉</div>
    <div class="modal-title">DAY ${gameState.bootcampDay} COMPLETE!</div>

    <div style="text-align: left; margin: 30px 0; max-width: 600px;">
      <h3>Rating: ${stats.startRating} → ${gameState.rating} (+${ratingGain}) ${status}</h3>
      <p>
        <strong>Puzzles Solved:</strong> ${puzzlesDone}/${targetPuzzles}<br>
        <strong>Time:</strong> ${formatDuration(Date.now() - gameState.bootcampSessionStart)}
      </p>

      <h3 style="margin-top: 25px;">✅ MASTERED TODAY:</h3>
      <ul>${masteredThemes || '<li>Working on it...</li>'}</ul>

      <h3 style="margin-top: 25px;">⚠️ STILL WEAK:</h3>
      <ul>${weakHtml}</ul>

      ${nextDayHtml}
    </div>

    <button class="btn btn-gold" onclick="advanceToNextDay()">Continue to Day ${nextDay}</button>
  `);

  logger.log('info', 'Daily bootcamp complete', {
    day: gameState.bootcampDay,
    rating: gameState.rating,
    ratingGain,
    puzzles: puzzlesDone
  });
}

function advanceToNextDay() {
  closeModal('daily-complete');

  if (gameState.bootcampDay >= 5) {
    completeBootcamp();
    return;
  }

  // Advance to next day
  gameState.bootcampDay++;
  gameState.bootcampPuzzlesToday = 0;
  gameState.bootcampSessionStart = Date.now();
  gameState.sessionBreaks = [];

  const dayData = bootcampCurriculum.daily_targets[gameState.bootcampDay - 1];
  gameState.bootcampTargetToday = dayData.puzzles_target;

  // Initialize next day stats
  gameState.dailyStats[`day${gameState.bootcampDay}`] = {
    puzzles: 0,
    startRating: gameState.rating,
    themes: {}
  };

  saveGameState();
  showBootcampWelcome();
  loadNextPuzzle();
}

function formatDuration(ms) {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
}
```

---

## Phase 5: Real-Time Coaching System

### 5.1 Coaching Triggers
**Location**: New section after theme tracking (~line 2650)

**Trigger Conditions:**
```javascript
const coachingTriggers = {
  // Trigger when user struggles
  three_failures: { threshold: 3, type: 'struggle' },
  slow_solve: { threshold: 2.0, type: 'struggle' },  // 2x avg time
  success_rate_drop: { threshold: 0.5, type: 'warning' },

  // Trigger on success
  five_streak: { threshold: 5, type: 'praise' },
  mastery_achieved: { threshold: 85, type: 'celebrate' },

  // Trigger on first encounter
  new_theme: { type: 'intro' }
};
```

### 5.2 AI-Generated Coaching Messages
**Critical**: Coaching messages must be AI-generated and contextual, NOT canned templates.

**Implementation approach:**
```javascript
async function generateCoachingMessage(context) {
  // Context includes:
  // - theme: Current puzzle theme (fork, pin, etc.)
  // - triggerType: 'struggle', 'intro', 'mastered', etc.
  // - fen: Current board position
  // - solution: Puzzle solution moves
  // - recentFailures: Array of recent failed attempts
  // - performanceStats: Theme performance data
  // - timeSpent: How long user spent on this puzzle

  // Use Stockfish to analyze position
  const analysis = await analyzeWithStockfish(context.fen, 3);

  // Build context for AI coaching
  const coachingPrompt = buildCoachingPrompt({
    theme: context.theme,
    triggerType: context.triggerType,
    position: context.fen,
    topMoves: analysis.topMoves,
    evaluation: analysis.evaluation,
    recentPattern: context.recentFailures,
    mastery: context.performanceStats.mastery,
    timeSpent: context.timeSpent
  });

  // Generate contextual coaching message
  // Options:
  // 1. Use a lightweight AI API (OpenAI, Claude, etc.)
  // 2. Use Stockfish analysis + template generation
  // 3. Local LLM for offline capability

  const message = await callCoachingAI(coachingPrompt);

  return message;
}

function buildCoachingPrompt(data) {
  // Construct prompt based on trigger type
  let prompt = `You are a chess coach providing encouragement and tactical guidance.

Position: ${data.position}
Theme: ${data.theme}
Trigger: ${data.triggerType}
Evaluation: ${data.evaluation}
User mastery: ${data.mastery}%

`;

  if (data.triggerType === 'struggle') {
    prompt += `The user has failed ${data.recentPattern.length} recent attempts on ${data.theme} puzzles.
Provide a brief, encouraging tip that references specific features of THIS position.
Be conversational and supportive, not robotic.
Maximum 2 sentences.`;

  } else if (data.triggerType === 'intro') {
    prompt += `This is the user's first ${data.theme} puzzle.
Provide a brief introduction to this tactical pattern using features from THIS specific position.
Maximum 2 sentences.`;

  } else if (data.triggerType === 'mastered') {
    prompt += `The user has achieved ${data.mastery}% mastery on ${data.theme} puzzles!
Provide brief, genuine praise.
Maximum 1 sentence.`;
  }

  prompt += `\n\nGenerate ONLY the coaching message text. No labels, no formatting.`;

  return prompt;
}

async function callCoachingAI(prompt) {
  // Implementation options:

  // Option 1: OpenAI API (requires API key)
  // const response = await fetch('https://api.openai.com/v1/chat/completions', {...});

  // Option 2: Claude API (requires API key)
  // const response = await fetch('https://api.anthropic.com/v1/messages', {...});

  // Option 3: Fallback to Stockfish-based generation (offline)
  // return generateFromStockfish(prompt);

  // For now, return placeholder - will implement based on API choice
  return "AI coaching message will be generated here";
}
```

**Key Requirements:**
- Messages reference the ACTUAL position (e.g., "Notice how the knight on f3 can reach e5")
- Contextual to user's performance pattern (recent failures, time spent, mastery level)
- Conversational and supportive, not canned spam
- Maximum 2 sentences for struggle/intro, 1 sentence for praise
- Generated fresh each time, not pulled from a static library

### 5.2 Coach Display System
**Location**: New UI component

**HTML** (add to page):
```html
<!-- Coaching Toast -->
<div class="coaching-toast" id="coaching-toast" style="display: none;">
  <div class="coach-avatar">🤖</div>
  <div class="coach-message">
    <div class="coach-title" id="coach-title">Coach</div>
    <div class="coach-text" id="coach-text"></div>
  </div>
  <button class="coach-close" onclick="closeCoach()">✕</button>
</div>
```

**CSS:**
```css
.coaching-toast {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 400px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 3px solid var(--gold);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.5);
  display: flex;
  gap: 15px;
  align-items: flex-start;
  z-index: 10000;
  animation: slideInRight 0.5s ease;
}

@keyframes slideInRight {
  from {
    transform: translateX(500px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.coach-avatar {
  font-size: 48px;
  line-height: 1;
}

.coach-message {
  flex: 1;
}

.coach-title {
  font-weight: bold;
  color: var(--gold);
  font-size: 16px;
  margin-bottom: 8px;
}

.coach-text {
  color: white;
  line-height: 1.6;
  font-size: 14px;
}

.coach-close {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.coach-close:hover {
  opacity: 1;
}
```

### 5.3 Coaching Logic
**Location**: New functions after theme tracking

```javascript
// Track recent performance for coaching
let coachingContext = {
  recentFailures: [],  // Last 10 failures with themes
  currentStreak: 0,
  lastCoachTime: 0,
  coachingCooldown: 30000  // 30 seconds between coaching messages
};

function checkCoachingTriggers(puzzle, wasCorrect, timeSpent) {
  if (!gameState.inBootcamp) return;

  const now = Date.now();

  // Cooldown check - don't spam coaching
  if (now - coachingContext.lastCoachTime < coachingContext.coachingCooldown) {
    return;
  }

  const themes = puzzle.themes || [];
  const primaryTheme = themes[0];  // Focus on first theme

  if (wasCorrect) {
    coachingContext.currentStreak++;
    coachingContext.recentFailures = [];

    // Check for praise triggers
    if (coachingContext.currentStreak === 5) {
      showCoaching('general', 'praise');
    }

    // Check for mastery celebration
    const stats = gameState.themeStats[primaryTheme];
    if (stats && stats.mastery >= 85 && stats.total >= 20) {
      const justMastered = stats.mastery < 85 - 5;  // Just crossed threshold
      if (justMastered) {
        showCoaching(primaryTheme, 'mastered');
      }
    }

  } else {
    // Failed
    coachingContext.currentStreak = 0;
    coachingContext.recentFailures.push({ theme: primaryTheme, time: now });

    // Keep only last 10
    if (coachingContext.recentFailures.length > 10) {
      coachingContext.recentFailures.shift();
    }

    // Check for struggle patterns
    const recentThemeFailures = coachingContext.recentFailures.filter(f => f.theme === primaryTheme);

    if (recentThemeFailures.length >= 3) {
      // 3+ failures on this theme recently
      showCoaching(primaryTheme, 'struggle');
      coachingContext.recentFailures = [];  // Clear after coaching
    }
  }

  // Check for slow solve
  const avgTime = getAverageTime(primaryTheme);
  if (avgTime > 0 && timeSpent > avgTime * 2) {
    showCoaching(primaryTheme, 'hint');
  }

  // Check for first encounter with new theme
  const stats = gameState.themeStats[primaryTheme];
  if (stats && stats.total === 1) {
    showCoaching(primaryTheme, 'intro');
  }

  // Check overall session performance
  const recentPuzzles = gameState.sessionPuzzles.slice(-20);
  if (recentPuzzles.length >= 10) {
    const successRate = recentPuzzles.filter(p => p.correct).length / recentPuzzles.length;
    if (successRate < 0.5 && now - coachingContext.lastCoachTime > 60000) {
      showCoaching('general', 'warning');
    }
  }
}

function getAverageTime(theme) {
  const stats = gameState.themeStats[theme];
  if (!stats || stats.attempts.length === 0) return 0;

  const totalTime = stats.attempts.reduce((sum, a) => sum + a.time, 0);
  return totalTime / stats.attempts.length;
}

function showCoaching(theme, messageType) {
  const messages = coachingLibrary[theme] || coachingLibrary.general;
  const message = messages[messageType];

  if (!message) return;

  // Update toast
  document.getElementById('coach-title').textContent =
    messageType === 'mastered' ? '🎉 Mastery Achieved!' :
    messageType === 'intro' ? '💡 New Pattern' :
    messageType === 'struggle' ? '🤔 Coaching Tip' :
    messageType === 'praise' ? '🌟 Great Work!' :
    '⚠️ Focus Alert';

  document.getElementById('coach-text').innerHTML = message;

  const toast = document.getElementById('coaching-toast');
  toast.style.display = 'flex';

  // Auto-hide after 8 seconds
  setTimeout(() => {
    toast.style.display = 'none';
  }, 8000);

  coachingContext.lastCoachTime = Date.now();

  logger.log('info', 'Coaching triggered', { theme, messageType });
}

function closeCoach() {
  document.getElementById('coaching-toast').style.display = 'none';
}
```

### 5.4 Integration Points

**In handleCorrectAnswer():**
```javascript
// After updateThemeStats()
if (gameState.inBootcamp) {
  checkCoachingTriggers(gameState.currentPuzzle, true, timeSpent);
}
```

**In handleWrongAnswer():**
```javascript
// After updateThemeStats()
if (gameState.inBootcamp) {
  checkCoachingTriggers(gameState.currentPuzzle, false, timeSpent);
}
```

---

## Phase 6: Integration & Testing

### 5.1 Modify Existing Functions

**handleCorrectAnswer()** (~line 2274):
```javascript
function handleCorrectAnswer() {
  // ... existing code ...

  // ADD: Track theme performance for bootcamp
  if (gameState.inBootcamp) {
    const timeSpent = 30 - gameState.timer;
    updateThemeStats(gameState.currentPuzzle, true, timeSpent);

    // Update session tracking
    const puzzleIndex = gameState.sessionPuzzles.findIndex(p => p.puzzleId === gameState.currentPuzzle.id);
    if (puzzleIndex >= 0) {
      gameState.sessionPuzzles[puzzleIndex].correct = true;
      gameState.sessionPuzzles[puzzleIndex].timeSpent = timeSpent;
    }

    // Check break needed
    checkBreakNeeded();

    // Update HUD
    updateBootcampHUD();

    // Check daily completion
    const dayData = bootcampCurriculum.daily_targets[gameState.bootcampDay - 1];
    if (gameState.bootcampPuzzlesToday >= dayData.puzzles_target) {
      completeDailyBootcamp();
      return;
    }
  }

  // ... rest of existing code ...
}
```

**handleWrongAnswer()** (~line 2324):
```javascript
function handleWrongAnswer() {
  // ... existing code ...

  // ADD: Track theme performance for bootcamp
  if (gameState.inBootcamp) {
    const timeSpent = 30 - gameState.timer;
    updateThemeStats(gameState.currentPuzzle, false, timeSpent);

    // Update session tracking
    const puzzleIndex = gameState.sessionPuzzles.findIndex(p => p.puzzleId === gameState.currentPuzzle.id);
    if (puzzleIndex >= 0) {
      gameState.sessionPuzzles[puzzleIndex].correct = false;
      gameState.sessionPuzzles[puzzleIndex].timeSpent = timeSpent;
    }

    // Update HUD
    updateBootcampHUD();
  }

  // ... rest of existing code ...
}
```

**completeAssessment()** (~line 2957):
```javascript
function completeAssessment() {
  // ... existing code ...

  // REPLACE final line with mode selection
  // OLD: startTraining();
  // NEW:
  showModeSelection();
}

function showModeSelection() {
  document.getElementById('assessment-complete-modal').classList.remove('active');
  document.getElementById('mode-selection-modal').classList.add('active');
}
```

---

### 5.2 Testing Checklist

**Unit Tests:**
- [x] Theme stats update correctly (correct/incorrect/mastery calculation)
- [x] Weak theme identification returns correct themes
- [x] Puzzle selection filters by theme + rating
- [x] Adaptive algorithm distributes 70/20/10 correctly
- [ ] Break timer triggers at 50 minutes
- [ ] Daily completion triggers at target puzzles

**Integration Tests:**
- [ ] Mode selection shows after assessment
- [ ] Bootcamp start initializes state correctly
- [x] Puzzle loading works in bootcamp mode
- [ ] HUD updates in real-time
- [ ] localStorage saves/loads bootcamp state
- [ ] Day advancement preserves state
- [ ] Completion report shows correct stats

**E2E Tests:**
- [ ] Complete Day 1 (340 puzzles)
- [ ] Verify weak theme injection works
- [ ] Verify mastered theme skip works
- [ ] Test break timer flow
- [ ] Test daily completion flow
- [ ] Test 5-day completion

---

## Files to Create/Modify

### New Files:
1. ✅ `bootcamp-curriculum.json` (already created)
2. `BOOTCAMP_IMPLEMENTATION_PLAN.md` (this file)

### Files to Modify:
1. `index.html` - Main implementation
   - Lines to add/modify: ~1500 new lines
   - Sections: gameState, puzzle loading, UI, session management

### Estimated Size:
- **Total new code**: ~1,500-2,000 lines
- **Total modified code**: ~200 lines
- **New CSS**: ~300 lines
- **New HTML**: ~200 lines

---

## Implementation Order (Recommended)

### Sprint 1: Core Systems (use Haiku for grunt work)
1. Extend gameState with bootcamp fields
2. Load bootcamp curriculum JSON
3. Implement theme stats tracking functions
4. Implement adaptive puzzle selector

### Sprint 2: UI Components (use Sonnet for complex logic)
5. Create mode selection modal
6. Create bootcamp HUD components
7. Implement real-time HUD updates

### Sprint 3: Session Management (use Sonnet)
8. Implement bootcamp start function
9. Implement break timer system
10. Implement daily completion report

### Sprint 4: Integration & Testing (use Sonnet)
11. Modify existing answer handlers
12. Modify assessment complete flow
13. Add localStorage save/load
14. End-to-end testing

---

## Success Criteria

**Must Have:**
- ✅ Mode selection works after assessment
- ✅ Bootcamp loads adaptive curriculum
- ✅ Theme performance tracked accurately
- ✅ Weak themes get 1.5x puzzles
- ✅ Mastered themes get 0.5x puzzles
- ✅ Real-time HUD shows progress
- ✅ Daily completion report works
- ✅ State persists across sessions

**Nice to Have:**
- Theme mastery visualization (radar chart)
- Session replay/review
- Export bootcamp report
- Social sharing of progress

---

## Risk Mitigation

**Risk**: Puzzle database doesn't have enough puzzles for specific themes
**Mitigation**: Fallback to rating-based selection if theme pool < 20 puzzles

**Risk**: User closes browser mid-session
**Mitigation**: Auto-save state after each puzzle via localStorage

**Risk**: Performance issues with large puzzle database (38MB JSON)
**Mitigation**: Already loading async, use browser caching

**Risk**: User completes day early (< target puzzles)
**Mitigation**: Allow manual day advancement, show "ahead of schedule" message

---

**Ready for implementation!** 🚀

Estimated time: 6-8 hours development + 2 hours testing = 8-10 hours total
