# Quick Test Reference - ChessBlitz Arena

## 🚀 5-Minute Quick Test

### 1. Open Website
```
http://chess.genomicdigital.com
```

### 2. Run Auto-Test (Browser Console)
```javascript
// Copy/paste from: test-script.js
// Or use this one-liner to check basics:
console.log('Site:', document.body ? '✓ Loaded' : '✗ Failed');
console.log('Board:', document.getElementById('chess-board') ? '✓ Found' : '✗ Missing');
console.log('Debug:', typeof chessDebug !== 'undefined' ? '✓ Available' : '✗ Missing');
console.log('Chess.js:', typeof Chess !== 'undefined' ? '✓ Loaded' : '✗ Failed');
console.log('Stockfish:', typeof STOCKFISH !== 'undefined' ? '✓ Loaded' : '✗ Failed');
```

### 3. Quick Visual Check
- [ ] Page loads (blue/purple gradient background)
- [ ] "START ASSESSMENT" button visible
- [ ] Click "START ASSESSMENT"
- [ ] Chess pieces appear (white and black distinguishable)
- [ ] Click a piece (should highlight)
- [ ] Click "💡 HINT" (should show hint)

### 4. Check Console
```javascript
chessDebug.getLogs()    // Should return array
chessDebug.getErrors()  // Should be empty or minimal
```

---

## ✅ Expected Results

| Item | Expected |
|------|----------|
| Page load time | < 3 seconds |
| Chess board squares | 64 (8x8 grid) |
| White piece color | #ffffff (white) |
| Black piece color | #1a1a1a (dark) |
| Default hints | 3 |
| Puzzle timer | 30 seconds |
| Console errors | 0 critical |

---

## 🎨 Visual Reference

### Piece Colors
**White pieces:** ♔ ♕ ♖ ♗ ♘ ♙
- Color: Pure white with black outline
- Should be clearly visible on light AND dark squares

**Black pieces:** ♚ ♛ ♜ ♝ ♞ ♟
- Color: Dark gray with white outline
- Should be clearly visible on light AND dark squares

### Board Colors
- Light squares: Varies by theme (default: lighter)
- Dark squares: Varies by theme (default: darker)
- Selected square: Highlighted border
- Hint square: Yellow glow

---

## 🐛 Known Issues

**Board Orientation Bug (Line 1820)**
```javascript
// Current (wrong):
const displayRow = isBlackToMove ? row : row;

// Should be:
const displayRow = isBlackToMove ? 7 - row : row;
```
Impact: May not flip board for Black to move

---

## 📋 Report Template

```
PASS / FAIL: Site loads
PASS / FAIL: Pieces visible
PASS / FAIL: Colors correct (white vs black)
PASS / FAIL: Clicks work
PASS / FAIL: Hint works
PASS / FAIL: No errors

Console errors: [count or "none"]
Screenshot: [yes/no]
```

---

## 🔧 Debug Commands

```javascript
// View all logs
chessDebug.getLogs()

// View errors only
chessDebug.getErrors()

// View game state
chessDebug.showStats()

// Export logs
chessDebug.exportLogs()

// Get AI analysis
chessDebug.getAIAnalysis()

// Check if pieces loaded
document.querySelectorAll('.white-piece').length  // White pieces count
document.querySelectorAll('.black-piece').length  // Black pieces count
```

---

## 📂 Test Files

1. **test-script.js** - Full automated test suite
2. **TESTING_GUIDE.md** - Detailed manual testing guide
3. **CODE_ANALYSIS_REPORT.md** - Technical code analysis
4. **TEST_RESULTS_SUMMARY.md** - Expected results summary
5. **QUICK_TEST_REFERENCE.md** - This file

---

## ⚡ Fastest Test

Open console, paste this, press Enter:

```javascript
(function(){
  const tests = {
    'Site loaded': !!document.body,
    'Board exists': !!document.getElementById('chess-board'),
    'Debug console': typeof chessDebug !== 'undefined',
    'Chess.js': typeof Chess !== 'undefined',
    'Stockfish': typeof STOCKFISH !== 'undefined',
    'Start button': !!document.querySelector('button[onclick="startAssessment()"]'),
    'Hint button': !!document.getElementById('power-hint')
  };

  console.table(tests);

  const passed = Object.values(tests).filter(v => v).length;
  const total = Object.keys(tests).length;

  console.log(`%c${passed}/${total} tests passed`,
    passed === total ? 'color: #00b894; font-weight: bold; font-size: 16px;' : 'color: #e74c3c; font-weight: bold; font-size: 16px;'
  );

  return tests;
})();
```

Expected output: 7/7 tests passed (all green checkmarks)
