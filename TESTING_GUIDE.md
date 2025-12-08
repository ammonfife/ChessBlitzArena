# ChessBlitz Arena Testing Guide

## Website URL
http://chess.genomicdigital.com

## CI/CD Integration

### GitHub Actions Workflow
Tests run automatically via GitHub Actions (`.github/workflows/e2b-tests.yml`):

- **Daily**: Runs at 6 AM UTC every day
- **On Push**: Runs when code is pushed to main/master
- **On PR**: Runs on pull requests to main/master
- **Manual**: Can be triggered manually from Actions tab

### Workflow Features
- Runs `test-live-site.py` against the live site
- Captures screenshots on success and failure
- Creates GitHub issues on test failures
- Uploads test artifacts (screenshots, logs)

### Viewing Test Results
1. Go to repository → Actions tab
2. Select "E2B Live Site Tests" workflow
3. Click on a run to see details
4. Download artifacts for screenshots and logs

### Manual Workflow Trigger
1. Go to Actions → E2B Live Site Tests
2. Click "Run workflow" dropdown
3. Select branch and click "Run workflow"

## Automated Testing

### Quick Test (Browser Console)
1. Open the website: http://chess.genomicdigital.com
2. Open browser DevTools (F12 or Cmd+Option+I on Mac, Ctrl+Shift+I on Windows)
3. Go to the Console tab
4. Copy and paste the contents of `test-script.js` into the console
5. Press Enter to run all automated tests
6. Review the test results

### Using chessDebug Console
The website includes a built-in debug console. In the browser console, run:

```javascript
// View all logs
chessDebug.getLogs()

// View errors only
chessDebug.getErrors()

// Export logs as JSON
chessDebug.exportLogs()

// View game state
chessDebug.showStats()

// Get AI analysis for current position
chessDebug.getAIAnalysis()
```

## Manual Testing Checklist

### 1. Initial Load Test
- [ ] **Does the site load?**
  - Open http://chess.genomicdigital.com
  - Page should display within 2-3 seconds
  - Background should show a gradient (dark blue/purple)
  - Floating particles animation should be visible

- [ ] **Are all UI elements visible?**
  - Header with "Chess Blitz Arena" logo
  - Stats bar (Rating, Level, XP, Coins, Streak)
  - Main content area with "START ASSESSMENT" button
  - Left sidebar with Power-Ups panel
  - Chess board container (may be empty before starting)

### 2. Chess Board Visibility Test
- [ ] **Before starting assessment:**
  - Board should show 64 squares (8x8 grid)
  - Squares should alternate between light and dark colors
  - No pieces visible yet (board is empty)

- [ ] **Click "START ASSESSMENT"**
  - Board should populate with chess pieces
  - Puzzle instruction should appear above the board
  - Timer should start counting

- [ ] **Are pieces visible and colored correctly?**
  - White pieces (King ♔, Queen ♕, Rook ♖, Bishop ♗, Knight ♘, Pawn ♙)
    - Should be WHITE color (#ffffff)
    - Should have dark shadow for contrast
  - Black pieces (King ♚, Queen ♛, Rook ♜, Bishop ♝, Knight ♞, Pawn ♟)
    - Should be DARK color (#1a1a1a)
    - Should have light shadow for contrast
  - All pieces should be clearly distinguishable

### 3. Piece Click Test
- [ ] **Click on a chess piece:**
  - Clicking on a piece of the correct color (whose turn it is) should:
    - Highlight the square (selection indicator)
    - Log the action in console
  - Clicking on wrong color piece should:
    - Not select the piece
    - Log a warning about wrong color

- [ ] **Click on destination square:**
  - After selecting a piece, click on another square
  - If move is valid:
    - Piece should move to new position
    - Board should update
    - Next puzzle should load (or show result)
  - If move is invalid:
    - Piece should not move
    - Feedback should be provided

### 4. Hint Button Test
- [ ] **Click the Hint button (💡 HINT):**
  - Button is in the left sidebar under "Power-Ups"
  - Shows count of remaining hints (default: 3)

- [ ] **When hint is used:**
  - Puzzle instruction should update with hint text
  - Target square should highlight (with 'hint' class - yellow glow)
  - Highlight should disappear after 3 seconds
  - AI should analyze position (shows "AI analyzing..." then suggestion)
  - Hint count should decrease by 1
  - If no hints remaining, button should not respond

### 5. Power-Ups Test
- [ ] **Freeze Timer (❄️):**
  - Freezes timer for 10 seconds
  - Timer color changes to cyan (#00cec9)

- [ ] **Skip Puzzle (⏭️):**
  - Skips current puzzle
  - Loads next puzzle immediately

- [ ] **2X XP (✨):**
  - Doubles XP gain for 3 puzzles
  - Shows "DOUBLE XP!" indicator

### 6. Console Error Check
Open browser DevTools and check Console tab for:

- [ ] **No JavaScript errors**
  - Red error messages indicate problems
  - Common errors to look for:
    - "Uncaught TypeError"
    - "Uncaught ReferenceError"
    - "Failed to load resource"

- [ ] **Expected info messages:**
  - "ChessBlitz Arena started"
  - "Debug console available"
  - "Stockfish AI engine initialized" (or warning if not available)

- [ ] **Run debug commands:**
  ```javascript
  // Should return array of log entries
  chessDebug.getLogs()

  // Should return only errors (hopefully empty array)
  chessDebug.getErrors()
  ```

### 7. External Dependencies Check
- [ ] **Chess.js library:**
  - Run in console: `typeof Chess`
  - Should return: "function"

- [ ] **Stockfish AI:**
  - Run in console: `typeof STOCKFISH`
  - Should return: "function" (or "undefined" if CDN fails)

### 8. Responsive Design Test
- [ ] **Desktop (1920x1080):**
  - All elements should be visible
  - Chess board should be centered
  - Sidebars should not overlap content

- [ ] **Tablet (768px):**
  - Layout should adjust
  - Chess board should remain playable

- [ ] **Mobile (375px):**
  - Layout should stack vertically
  - Chess board should scale appropriately

### 9. Performance Test
- [ ] **Page load time:**
  - Initial load < 3 seconds
  - External scripts (Chess.js, Stockfish) may take longer

- [ ] **Interaction responsiveness:**
  - Piece clicks should respond immediately
  - Board updates should be smooth
  - No lag when moving pieces

### 10. Game Flow Test
Complete a full assessment:
- [ ] Start assessment (10 puzzles)
- [ ] Solve at least 3 puzzles correctly
- [ ] Use at least one hint
- [ ] Complete all 10 puzzles
- [ ] Assessment complete modal should appear
- [ ] Rating should be calculated and displayed
- [ ] Coins should be awarded

## Expected Results Summary

### Site Should Load:
✓ Page loads successfully
✓ All assets load (fonts, styles)
✓ No 404 errors in Network tab

### Pieces Should Be Visible:
✓ 64 squares on chess board
✓ White pieces displayed in white color with dark shadow
✓ Black pieces displayed in dark color with light shadow
✓ All 6 piece types distinguishable (King, Queen, Rook, Bishop, Knight, Pawn)

### Pieces Should Respond to Clicks:
✓ Clicking piece of correct color selects it (highlights square)
✓ Clicking second square attempts move
✓ Valid moves update the board
✓ Invalid moves provide feedback

### Hint Button Should Work:
✓ Button is visible and labeled "💡 HINT"
✓ Shows remaining hint count
✓ Clicking displays hint text
✓ Highlights target square with yellow glow
✓ AI provides move suggestion
✓ Hint count decreases

### Console Should Be Clean:
✓ No red error messages
✓ chessDebug object available
✓ getLogs() returns array of logs
✓ getErrors() returns empty array (or minimal errors)

## Common Issues and Solutions

### Issue: Pieces not visible
**Solution:** Check if assessment has been started. Board is empty until "START ASSESSMENT" is clicked.

### Issue: Pieces all same color
**Solution:** Check CSS - .white-piece and .black-piece classes may not be applying. Verify in Elements tab.

### Issue: Hint button not working
**Solution:** Check if hints are available (count > 0). Check console for errors. Verify current puzzle is loaded.

### Issue: Stockfish not loading
**Solution:** This is external CDN dependency. If offline or CDN is down, AI hints won't work but game still playable.

### Issue: Clicks not registering
**Solution:** Check if event listeners are attached. Verify in Console with `getEventListeners($0)` after selecting square in Elements tab.

## Automated Test Results Interpretation

When running the test script, you should see:

- **Passed:** 15-20 tests (all core functionality working)
- **Failed:** 0 tests (any failures indicate problems)
- **Warnings:** 0-5 tests (minor issues, site may still be functional)

### Key Tests:
- Site Loads
- Chess Board Element
- Piece Colors
- Hint Button
- Debug Console
- Console Errors (should be 0)
- Chess.js Library
- Stockfish Engine (may warn if CDN issue)

## Screenshots to Capture

1. **Homepage (before starting)**
   - Shows initial state with START ASSESSMENT button

2. **Game Board (during play)**
   - Shows chess pieces visible and colored correctly
   - White pieces clearly white, black pieces clearly dark

3. **Hint Active**
   - Shows hint text displayed
   - Target square highlighted

4. **DevTools Console**
   - Shows chessDebug.getLogs() output
   - Shows no errors (clean console)

## Report Template

```
ChessBlitz Arena Test Report
Date: [DATE]
URL: http://chess.genomicdigital.com
Browser: [Chrome/Firefox/Safari] [Version]

✓ Site loads: YES / NO
✓ Pieces visible: YES / NO
✓ Pieces colored correctly (white vs black): YES / NO
✓ Pieces respond to clicks: YES / NO
✓ Hint button works: YES / NO
✓ Console errors: [COUNT or "None"]
✓ chessDebug.getLogs() works: YES / NO

Screenshot: [Attached/Not attached]
Console output: [Attached/Not attached]

Additional notes:
[Any other observations]
```

## Extending Tests

### Adding New Tests to test-live-site.py

The test script uses Selenium WebDriver. To add new tests:

```python
# Example: Add a new test for a specific feature
print("\n🆕 Test X: Your new test...")
try:
    # Use WebDriverWait for elements that may take time to load
    element = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, 'your-element-id'))
    )

    # Execute JavaScript if needed
    result = driver.execute_script("return yourFunction();")

    # Assert expected behavior
    if result == expected_value:
        print("✅ Test passed")
    else:
        print(f"❌ Test failed: expected {expected_value}, got {result}")

except Exception as e:
    print(f"❌ Test error: {e}")
```

### Test Categories

1. **Load Tests**: Verify page and assets load correctly
2. **UI Tests**: Verify visual elements are present and styled
3. **Interaction Tests**: Verify clicks and user actions work
4. **Integration Tests**: Verify external dependencies (Chess.js, Stockfish)
5. **Performance Tests**: Verify load times and responsiveness

### Best Practices

- Always use WebDriverWait instead of `time.sleep()` when possible
- Use try/except blocks to handle test failures gracefully
- Take screenshots on failure for debugging
- Log descriptive messages with emojis for easy scanning
- Keep tests independent (each test should not rely on others)

### Running Tests Locally

```bash
# Install dependencies
pip install selenium webdriver-manager

# Run tests
python test-live-site.py
```

### Adding Tests to CI/CD

Tests in `test-live-site.py` automatically run in CI/CD. To add a new test file:

1. Create your test file (e.g., `test-new-feature.py`)
2. Update `.github/workflows/e2b-tests.yml` to run it:

```yaml
- name: Run new feature tests
  run: python test-new-feature.py
```

## Performance Benchmarks

Track these metrics over time:

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Page Load | < 3s | Browser DevTools Network tab |
| First Paint | < 1.5s | Lighthouse audit |
| Board Render | < 500ms | `chessDebug.getLogs()` timestamps |
| Piece Click Response | < 100ms | Performance profiler |
| AI Analysis | < 10s | Test script timing |

## Redis Integration

Test results can be logged to Redis for tracking:

```bash
# Log test start
redis-cli SET "chess_blitz:test:last_run" "$(date -u +%Y-%m-%dT%H:%M:%SZ)"

# Log test result
redis-cli SET "chess_blitz:test:last_result" "pass"  # or "fail"

# View recent test results
redis-cli LRANGE "chess_blitz:test:history" 0 -1
```
