# ChessBlitz Arena - Issue Tickets

**Last Updated**: 2025-12-07 23:37 UTC

---

## High Priority

### TICKET-001: Stockfish AI Engine Initialization Timing
**Status**: Open
**Priority**: High
**Discovered**: 2025-12-07 (E2B testing)
**Severity**: Major - Feature not working on initial load

**Description**:
Stockfish AI engine shows `ready=False` and `hasEngine=False` during initial page load. This prevents the hint system from working immediately when users start the assessment.

**Location**:
- File: `index.html`
- Lines: 1328-1423 (AIEngine class)

**Current Behavior**:
- Engine status checked too early
- CDN loading may be slow
- No retry mechanism

**Expected Behavior**:
- AI engine should be ready within 5 seconds of page load
- Hint button should be disabled until engine ready
- Visual indicator showing "AI Loading..." state

**Reproduction**:
1. Load https://ammonfife.github.io/ChessBlitzArena/
2. Click "START ASSESSMENT"
3. Immediately click hint button
4. Result: Engine not ready, hints don't work

**Test Evidence**:
- E2B Test (Sandbox: i3px2h0osbpcs71cxdqub)
- Test date: 2025-12-07 22:51 UTC
- Result: `aiEngine.isReady = false`, `aiEngine.engine = null`

**Related Files**:
- `index.html:1328-1423` (AIEngine class)
- `index.html:1807-1850` (showHint function)

---

### TICKET-002: Piece Selection Visual Feedback Missing
**Status**: Open
**Priority**: High
**Discovered**: 2025-12-07 (E2B testing)
**Severity**: Major - UX requirement violation

**Description**:
When a piece is clicked, the click event is registered but the `.selected` CSS class is not being applied. Users get no visual confirmation that they've selected a piece.

**Location**:
- File: `index.html`
- Lines: 1706-1747 (handleSquareClick function)
- Lines: 410-417 (CSS .square.selected)

**Current Behavior**:
- `handleSquareClick` is called
- `gameState.selectedSquare` is set
- No visual change on the board
- `.selected` class not applied to DOM element

**Expected Behavior**:
- Immediate visual feedback (< 100ms) when piece clicked
- Selected square should have yellow border/background
- Legal moves should be highlighted
- Deselect on second click or clicking empty square

**Reproduction**:
1. Load site and start assessment
2. Click any white piece
3. Observe: No visual change on clicked square
4. Check DevTools: `.selected` class not in DOM

**Test Evidence**:
- E2B Test (Sandbox: i3px2h0osbpcs71cxdqub)
- Test date: 2025-12-07 22:51 UTC
- Result: "Piece not selected" despite click registered

**UX Requirements**:
- Violates: "Piece selection: Immediate visual feedback (< 50ms)"
- Reference: UserExperienceRequirements.md

---

## Medium Priority

### TICKET-003: Custom Domain DNS Verification
**Status**: Open
**Priority**: Medium
**Discovered**: 2025-12-07 (E2B testing)

**Description**:
Custom domain chess.genomicdigital.com configured but needs verification.

---

### TICKET-004: Mobile Responsiveness Testing
**Status**: Open
**Priority**: Medium
**Discovered**: 2025-12-07 (Planning)

**Description**:
Mobile responsiveness needs testing with real devices (iOS, Android, tablets).

---

## Low Priority

### TICKET-005: Performance Benchmarking
**Status**: Open
**Priority**: Low

**Description**:
Need comprehensive performance benchmarking (FCP, TTI, Lighthouse, 60fps).

---

### TICKET-006: Automated Daily Testing
**Status**: Open
**Priority**: Low

**Description**:
Set up GitHub Actions for daily automated testing.

---

### TICKET-009: GitHub Actions CI/CD Pipeline
**Status**: Open
**Priority**: Low
**Discovered**: 2025-12-07 (Infrastructure)

**Description**:
Create GitHub Actions workflow for automated testing on push/PR.

**Tasks**:
- Create `.github/workflows/test.yml`
- Run E2B tests on push to main
- Run E2B tests on pull requests
- Report test results as PR comments
- Badge in README showing test status

**Resources**:
- GitHub Secrets already configured (E2B_API_KEY, ANTHROPIC_API_KEY)
- Test script: `e2b/examples/07_chess_blitz_test.py`

---

### TICKET-010: Push Repos to GitHub
**Status**: ✅ Closed
**Priority**: High (P0)
**Discovered**: 2025-12-07 (Session cleanup)
**Closed**: 2025-12-07 23:36 UTC

**Description**:
Both repos have commits ahead of origin that need to be pushed.

**Resolution**:
All repositories successfully pushed to GitHub:
- ammonfife/e2b: New main branch created and pushed (7 commits)
- ammonfife/ChessBlitzArena: Pushed 6 commits (14f436c..792038f)
- ammonfife/GitHubGitHub: Pushed 2 commits (ff4e2f0b4..2c1b0b1de)

**Commands Executed**:
```bash
cd /Users/benfife/github/ammonfife/e2b && git push origin main
cd /Users/benfife/github/ammonfife/ChessBlitzArena && git push origin main
cd /Users/benfife/github/ammonfife/GitHubGitHub && git push origin main
```

---

### TICKET-011: e2b-claude CLI Error Handling
**Status**: Open
**Priority**: Low
**Discovered**: 2025-12-07 (Nice to have)

**Description**:
Improve error handling and user feedback in e2b-claude CLI tool.

**Improvements**:
- Better error messages for API failures
- Retry logic for transient failures
- Progress indicators during long operations
- Timeout handling with user-friendly messages
- Validation of E2B_API_KEY before sandbox creation

**File**: `/Users/benfife/github/ammonfife/e2b/e2b_claude_cli.py`

---

### TICKET-012: CLI Tool Testing Suite
**Status**: Open
**Priority**: Low
**Discovered**: 2025-12-07 (Nice to have)

**Description**:
Create test suite for e2b-claude CLI tool.

**Tests needed**:
- Unit tests for sandbox creation
- Integration tests for full workflow
- Mock E2B API for faster testing
- Test error scenarios
- Test result collection

**Location**: `e2b/tests/test_e2b_claude_cli.py` (new)

---

### TICKET-013: Redis Monitoring Dashboard
**Status**: Open
**Priority**: Low
**Discovered**: 2025-12-07 (Nice to have)

**Description**:
Create web dashboard for monitoring Redis queues and agent status.

**Features**:
- View all open tickets
- See agent status updates
- Monitor task queues
- Search historical data
- Real-time updates

**Tech**: Simple Flask app or static HTML + Redis REST API

---

### TICKET-014: Session Resumability Documentation
**Status**: Open
**Priority**: Low
**Discovered**: 2025-12-07 (Nice to have)

**Description**:
Document how to resume sessions and use resumable session files.

**Needs**:
- Guide for creating resumable session files
- Examples of session resumption
- Redis integration for session discovery
- Best practices for session handoffs

**Reference**: `SESSION_2025-12-07_E2B_TESTING.md`

---

### TICKET-015: E2B Template Optimization
**Status**: Open
**Priority**: Low
**Discovered**: 2025-12-07 (Nice to have)

**Description**:
Create custom E2B template with pre-installed tools to speed up sandbox creation.

**Pre-install**:
- Chromium + ChromeDriver
- Playwright + browsers
- Claude CLI
- Common Python packages

**Benefit**: Reduce sandbox setup time from ~60s to ~10s

---

## Completed

### ✅ TICKET-007: UX Requirements Documentation
**Status**: Closed
**Completed**: 2025-12-07

Created UserExperienceRequirements.md (388 lines, 14 sections).

---

### ✅ TICKET-008: E2B Testing Infrastructure
**Status**: Closed
**Completed**: 2025-12-07

Created 4 E2B test scripts with Playwright automation.

---

### TICKET-016: Board Skins Unlock Verification
**Status**: Open
**Priority**: Low
**Discovered**: 2025-12-07 (Feature verification)

**Description**:
Verify that board skins unlock properly at designated levels and can be applied.

**Test Cases**:
- Reach level 5, verify new skin unlocks
- Apply unlocked skin, verify board updates
- Locked skins show preview but can't be applied
- Skin persists after page refresh

---

### TICKET-017: Achievement System Testing
**Status**: Open
**Priority**: Low
**Discovered**: 2025-12-07 (Feature verification)

**Description**:
Test all 8 achievements can be earned and display correctly.

**Achievements to verify**:
- First puzzle solved
- 10 puzzles streak
- Level 10 reached
- 100 puzzles completed
- Perfect day (5/5 puzzles correct)
- Speed demon (puzzle in < 10s)
- Comeback (3 streak after 3 fails)
- Perfectionist (95% accuracy)

---

### TICKET-018: Sound Effects Implementation
**Status**: Open
**Priority**: Low
**Discovered**: 2025-12-07 (Nice to have)

**Description**:
Add optional sound effects for enhanced Roblox-style feel.

**Sounds needed**:
- Correct move (success chime)
- Wrong move (error sound)
- Level up (celebration)
- Streak milestone (powerup sound)
- Button clicks (subtle)
- Achievement earned (fanfare)

**Implementation**:
- Mute toggle in settings
- LocalStorage persistence
- Lightweight audio files (<50KB each)

---

### TICKET-019: Tutorial/Onboarding Flow
**Status**: Open
**Priority**: Medium
**Discovered**: 2025-12-07 (UX improvement)

**Description**:
Add optional first-time user tutorial explaining game mechanics.

**Tutorial steps**:
1. Welcome + explanation of assessment
2. How to move pieces
3. Power-ups explanation
4. XP/leveling system
5. Daily challenges intro

**Requirements**:
- Skippable
- Show once (LocalStorage flag)
- Reset option in settings
- < 30 seconds if not skipped

---

### TICKET-020: Analytics Integration
**Status**: Open
**Priority**: Low
**Discovered**: 2025-12-07 (Growth tracking)

**Description**:
Add privacy-friendly analytics to track usage and optimize UX.

**Metrics to track**:
- Page views
- Assessment completion rate
- Average puzzles per session
- Bounce rate
- Time to first puzzle
- Power-up usage rates
- Most used board skins

**Privacy**:
- No personal data
- Respect Do Not Track
- Cookie consent banner
- GDPR compliant

**Options**: Plausible, Simple Analytics, or custom

---

### TICKET-021: SEO Optimization
**Status**: Open
**Priority**: Medium
**Discovered**: 2025-12-07 (Discoverability)

**Description**:
Optimize for search engines to increase organic discovery.

**Tasks**:
- Add meta descriptions
- Open Graph tags for social sharing
- Structured data (Schema.org)
- robots.txt
- sitemap.xml
- Performance optimization (Lighthouse 90+)
- Mobile-friendly verification

---

### TICKET-022: Social Sharing Features
**Status**: Open
**Priority**: Low
**Discovered**: 2025-12-07 (Viral growth)

**Description**:
Allow users to share achievements and progress on social media.

**Shareable content**:
- "I just reached level X in ChessBlitz Arena!"
- "Got a 10-puzzle streak!"
- "Unlocked the [skin name] board skin"
- Current rating + tier badge

**Platforms**:
- Twitter/X (with image)
- LinkedIn
- Discord (webhook)
- Copy link

---

### TICKET-023: Leaderboard System
**Status**: Open
**Priority**: Low
**Discovered**: 2025-12-07 (Competitive feature)

**Description**:
Add global and friends leaderboards for competitive engagement.

**Requirements**:
- Anonymous by default
- Optional display name
- Filter by timeframe (daily, weekly, all-time)
- Categories: Rating, XP, Streak, Speed
- Real-time updates
- Backend needed (Firebase/Supabase)

---

### TICKET-024: Puzzle Generator Integration
**Status**: Open
**Priority**: Medium
**Discovered**: 2025-12-07 (Content scalability)

**Description**:
Currently using static puzzle set. Need dynamic puzzle generation or API integration.

**Options**:
- Lichess puzzle API (free)
- Chess.com puzzle API
- Custom generator using Stockfish
- Community submissions

**Benefits**:
- Unlimited puzzles
- Always fresh content
- Difficulty calibration
- No repetition

---

### TICKET-025: Offline Mode Support
**Status**: Open
**Priority**: Low
**Discovered**: 2025-12-07 (PWA feature)

**Description**:
Add Service Worker for offline functionality and PWA installation.

**Features**:
- Cache HTML/CSS/JS
- Cache puzzle data
- Work offline after first load
- Install as app (PWA)
- Background sync when online

**Benefits**:
- Better mobile experience
- Faster load times
- Engagement boost

---

**Ticket Count**: Open: 22 | Closed: 3 | Total: 25

---

## Ticket Summary by Priority

**High Priority (P0-P1)**: 2 tickets
- TICKET-001: Stockfish AI initialization
- TICKET-002: Piece selection CSS

**Medium Priority**: 2 tickets
- TICKET-003: DNS verification
- TICKET-004: Mobile testing

**Low Priority**: 8 tickets
- TICKET-005: Performance benchmarking
- TICKET-006: Automated daily testing
- TICKET-009: GitHub Actions CI/CD
- TICKET-011: CLI error handling
- TICKET-012: CLI testing suite
- TICKET-013: Redis monitoring
- TICKET-014: Session resumability docs
- TICKET-015: E2B template optimization
