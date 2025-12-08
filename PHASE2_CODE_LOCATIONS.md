# Phase 2: Code Locations Reference

Quick reference for navigating the Phase 2 implementation in `index.html`.

## Core Functions

| Function | Line | Purpose |
|----------|------|---------|
| `updateThemeStats()` | 2765 | Track performance per theme after each puzzle |
| `getMasterySnapshot()` | 2824 | Get current mastery percentages for all themes |
| `getWeakThemes()` | 2823 | Identify themes below 70% mastery, sorted by priority |
| `isThemeMastered()` | 2849 | Check if theme >= 85% with min 10 attempts |
| `loadBootcampPuzzle()` | 2862 | Main adaptive puzzle selector (70/20/10 algorithm) |
| `getAllPuzzlesWithTheme()` | 2965 | Helper: Filter puzzles by theme + rating |
| `getAllPuzzlesInRange()` | 2986 | Helper: Filter puzzles by rating range only |

## Integration Points

| Location | Line | Modification |
|----------|------|--------------|
| `loadNextPuzzle()` | 2603 | Added `else if (gameState.inBootcamp)` branch |
| `handleCorrectAnswer()` | 2457-2468 | Added theme stats tracking for bootcamp mode |
| `handleWrongAnswer()` | 2508-2519 | Added theme stats tracking for bootcamp mode |

## Data Structures

| Structure | Line | Description |
|-----------|------|-------------|
| `gameState.themeStats` | 1647 | Theme performance tracking (adaptive core) |
| `gameState.sessionPuzzles` | 1650 | Session tracking array |
| `gameState.inBootcamp` | 1638 | Bootcamp mode flag |
| `gameState.bootcampDay` | 1639 | Current day (1-5) |
| `gameState.bootcampPuzzlesToday` | 1643 | Puzzles completed today |

## Dependencies

| Resource | Location | Purpose |
|----------|----------|---------|
| `bootcampCurriculum` | 1932 | Global variable loaded from JSON |
| `loadBootcampCurriculum()` | 1934 | Async loader function |
| `bootcamp-curriculum.json` | Root dir | Curriculum configuration |
| `puzzles.json` | Root dir | 47,996 Lichess puzzles with themes |

## Testing

To test the adaptive selection:

1. Set `gameState.inBootcamp = true`
2. Set `gameState.bootcampDay = 1`
3. Call `loadBootcampPuzzle()`
4. Observe console logs for theme selection strategy

## Algorithm Flow

```
loadBootcampPuzzle()
  ↓
1. Get theme pool for current day (foundation/patterns/etc)
  ↓
2. Get weak themes (< 70% mastery)
  ↓
3. Select theme (70/20/10 split):
   - 70%: Weakest theme
   - 20%: Random non-mastered theme
   - 10%: New unseen theme
  ↓
4. Filter puzzles by theme + rating (±150 from player)
  ↓
5. Select random puzzle from candidates
  ↓
6. Track in sessionPuzzles array
```

## Logging

All functions log to console using `logger.log()`:
- **info**: Normal operations (theme selected, puzzle loaded)
- **warn**: Fallback scenarios (no themed puzzles found)
- **error**: Critical issues (curriculum not loaded)

Filter console by "Bootcamp" to see adaptive selection in action.

---

**Quick Jump Commands:**

```bash
# View theme tracking
sed -n '2765,2812p' index.html

# View adaptive selector
sed -n '2862,2963p' index.html

# View integration in handleCorrectAnswer
sed -n '2457,2468p' index.html

# View integration in handleWrongAnswer
sed -n '2508,2519p' index.html
```
