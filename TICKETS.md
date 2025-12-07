# ChessBlitz Arena - Issue Tickets

**Last Updated**: 2025-12-07 16:17 UTC

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

**Ticket Count**: Open: 6 | Closed: 2 | Total: 8
