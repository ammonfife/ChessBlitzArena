# Chess Puzzle Progression Model
## Student Advancement Algorithm

**Last Updated**: 2025-12-08
**Purpose**: Define how puzzles are selected and how students advance in rating

---

## Rating Tiers & Puzzle Distribution

### Tier System (FIDE-aligned)

| Tier | Rating Range | FIDE Equivalent | Puzzle Count (Target) | % of Database |
|------|--------------|-----------------|----------------------|---------------|
| **Beginner** | 600-899 | Novice/Beginner | 10,000+ | 25% |
| **Amateur** | 900-1099 | Class E/D | 8,000+ | 20% |
| **Intermediate** | 1100-1299 | Class C | 8,000+ | 20% |
| **Advanced** | 1300-1499 | Class B | 6,000+ | 15% |
| **Expert** | 1500-1699 | Class A | 5,000+ | 12.5% |
| **Master** | 1700-1999 | Expert/Candidate Master | 3,000+ | 7.5% |
| **Grandmaster** | 2000+ | National Master+ | 2,000+ | 5% |

**Total Target**: 40,000+ puzzles across all tiers

### Puzzle Difficulty Characteristics by Tier

#### Beginner (600-899)
**Tactical Themes**:
- Mate in 1 (40%)
- Simple captures (30%)
- Basic forks (knight, bishop)
- Undefended pieces
- Back rank threats
- Scholar's Mate patterns

**Complexity**: 1-2 moves deep
**Time Target**: 10-30 seconds
**Success Rate Target**: 70-80%

**Example Puzzles**:
```
1. Scholar's Mate Setup (600)
   FEN: r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq -
   Solution: Qxf7#
   Theme: Mate in 1

2. Free Piece (650)
   FEN: rnbqkbnr/ppp2ppp/8/3pp3/4P3/3B4/PPPP1PPP/RNBQK1NR w KQkq -
   Solution: Bxh7
   Theme: Undefended piece

3. Knight Fork (700)
   FEN: rnbqkb1r/ppp2ppp/5n2/3pp3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq -
   Solution: Nxe5
   Theme: Knight fork
```

#### Amateur (900-1099)
**Tactical Themes**:
- Mate in 2 (30%)
- Pins (25%)
- Forks (20%)
- Skewers (15%)
- Discovered attacks (10%)

**Complexity**: 2-3 moves deep
**Time Target**: 30-60 seconds
**Success Rate Target**: 60-70%

**Example Puzzles**:
```
1. Pin to Win (900)
   FEN: r1bqkb1r/pppp1ppp/2n2n2/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R w KQkq -
   Solution: Bxc6, dxc6, Nxe5
   Theme: Pin exploitation

2. Queen Fork (1000)
   FEN: r1bqkb1r/pppp1ppp/2n5/4p3/2BnP3/5N2/PPPP1PPP/RNBQK2R w KQkq -
   Solution: Nxd4, exd4, Qxd4 (forks king and knight)
   Theme: Queen fork

3. Back Rank Mate (1050)
   FEN: 6k1/5ppp/8/8/8/8/5PPP/R5K1 w - -
   Solution: Ra8#
   Theme: Back rank weakness
```

#### Intermediate (1100-1299)
**Tactical Themes**:
- Mate in 2-3 (25%)
- Combinations (30%)
- Deflection/Decoy (20%)
- Zwischenzug (15%)
- Double attacks (10%)

**Complexity**: 3-4 moves deep
**Time Target**: 60-120 seconds
**Success Rate Target**: 50-60%

#### Advanced (1300-1499)
**Tactical Themes**:
- Complex combinations (40%)
- Sacrifice patterns (25%)
- Endgame tactics (20%)
- Positional puzzles (15%)

**Complexity**: 4-6 moves deep
**Time Target**: 2-4 minutes
**Success Rate Target**: 40-50%

#### Expert (1500-1699)
**Tactical Themes**:
- Multi-move combinations (35%)
- Quiet moves (20%)
- Defensive resources (20%)
- Complex endgames (15%)
- Opening traps (10%)

**Complexity**: 6-8 moves deep
**Time Target**: 4-8 minutes
**Success Rate Target**: 35-45%

#### Master (1700-1999)
**Tactical Themes**:
- Deep calculations (40%)
- Prophylaxis (20%)
- Zugzwang (15%)
- Fortress breaking (15%)
- Theoretical endgames (10%)

**Complexity**: 8-12 moves deep
**Time Target**: 8-15 minutes
**Success Rate Target**: 30-40%

#### Grandmaster (2000+)
**Tactical Themes**:
- GM-level positions (50%)
- Study-like positions (25%)
- Theoretical novelties (15%)
- Computer-generated puzzles (10%)

**Complexity**: 12+ moves deep
**Time Target**: 15-30 minutes
**Success Rate Target**: 25-35%

---

## Student Advancement Algorithm

### Core Principle: Adaptive Difficulty with Spaced Repetition

```javascript
class StudentAdvancementModel {
    constructor(studentProfile) {
        this.profile = studentProfile;
        this.ratingK = 32; // Elo K-factor (higher = faster changes)
        this.performanceWindow = 10; // Last N puzzles for trend analysis
    }

    /**
     * Select next puzzle based on student's current state
     * @returns {Puzzle} Next puzzle to present
     */
    selectNextPuzzle() {
        // 1. Calculate target rating based on recent performance
        const targetRating = this.calculateTargetRating();

        // 2. Identify weak themes to address
        const weakThemes = this.identifyWeakThemes();

        // 3. Get candidate puzzles
        const candidates = this.filterPuzzleCandidates(targetRating, weakThemes);

        // 4. Apply spaced repetition (avoid recently seen)
        const filtered = this.applySpacedRepetition(candidates);

        // 5. Weight by priority (weakness > rating match > variety)
        const selected = this.weightedSelection(filtered, targetRating, weakThemes);

        return selected;
    }

    /**
     * Calculate target puzzle rating based on performance
     */
    calculateTargetRating() {
        const recentPuzzles = this.profile.recentPuzzles.slice(-this.performanceWindow);

        if (recentPuzzles.length === 0) {
            return this.profile.rating; // Start at current rating
        }

        // Calculate success rate in recent puzzles
        const correctCount = recentPuzzles.filter(p => p.correct).length;
        const successRate = correctCount / recentPuzzles.length;

        // Adjust target based on success rate
        let targetRating = this.profile.rating;

        if (successRate > 0.8) {
            // Too easy, increase by 50-100
            targetRating += 50 + (successRate - 0.8) * 250;
        } else if (successRate > 0.6) {
            // Good zone, slight increase
            targetRating += 20;
        } else if (successRate < 0.4) {
            // Too hard, decrease by 50-100
            targetRating -= 50 + (0.4 - successRate) * 250;
        } else if (successRate < 0.5) {
            // Slightly hard, small decrease
            targetRating -= 20;
        }
        // 0.5-0.6 = maintain current level

        // Clamp to valid range
        return Math.max(600, Math.min(2700, targetRating));
    }

    /**
     * Identify themes where student is weak
     */
    identifyWeakThemes() {
        const themeStats = this.profile.themePerformance;
        const weakThemes = [];

        for (const [theme, stats] of Object.entries(themeStats)) {
            const successRate = stats.correct / (stats.correct + stats.incorrect);
            const attempts = stats.correct + stats.incorrect;

            // Consider weak if:
            // - Success rate < 50% AND
            // - At least 5 attempts (sufficient sample)
            if (successRate < 0.5 && attempts >= 5) {
                weakThemes.push({
                    theme: theme,
                    successRate: successRate,
                    attempts: attempts,
                    priority: (0.5 - successRate) * attempts // Higher = more urgent
                });
            }
        }

        // Sort by priority, return top 3
        return weakThemes
            .sort((a, b) => b.priority - a.priority)
            .slice(0, 3)
            .map(w => w.theme);
    }

    /**
     * Filter puzzles by rating range and theme
     */
    filterPuzzleCandidates(targetRating, weakThemes) {
        const allPuzzles = this.getAllPuzzles();

        return allPuzzles.filter(puzzle => {
            // Rating criteria (±200 max, prefer ±100)
            const ratingDiff = Math.abs(puzzle.rating - targetRating);
            if (ratingDiff > 200) return false;

            // Theme criteria (bonus for weak themes)
            const hasWeakTheme = puzzle.themes.some(t => weakThemes.includes(t));

            return true; // All within ±200 are candidates
        });
    }

    /**
     * Apply spaced repetition - avoid recently seen puzzles
     */
    applySpacedRepetition(candidates) {
        const recentIds = new Set(
            this.profile.recentPuzzles.slice(-50).map(p => p.puzzleId)
        );

        return candidates.filter(p => !recentIds.has(p.puzzleId));
    }

    /**
     * Weighted selection prioritizing weak themes and optimal difficulty
     */
    weightedSelection(candidates, targetRating, weakThemes) {
        const weighted = candidates.map(puzzle => {
            let weight = 1;

            // Weight 1: Rating closeness (max 5x)
            const ratingDiff = Math.abs(puzzle.rating - targetRating);
            if (ratingDiff <= 50) weight *= 5;
            else if (ratingDiff <= 100) weight *= 3;
            else if (ratingDiff <= 150) weight *= 2;

            // Weight 2: Weak theme bonus (max 10x)
            const weakThemeCount = puzzle.themes.filter(t => weakThemes.includes(t)).length;
            weight *= (1 + weakThemeCount * 3);

            // Weight 3: Variety bonus (themes not recently practiced)
            const recentThemes = new Set(
                this.profile.recentPuzzles.slice(-10)
                    .flatMap(p => p.themes)
            );
            const newThemeCount = puzzle.themes.filter(t => !recentThemes.has(t)).length;
            weight *= (1 + newThemeCount * 0.5);

            return { puzzle, weight };
        });

        // Weighted random selection
        const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
        let random = Math.random() * totalWeight;

        for (const {puzzle, weight} of weighted) {
            random -= weight;
            if (random <= 0) return puzzle;
        }

        // Fallback
        return candidates[0];
    }

    /**
     * Update student profile after puzzle attempt
     */
    updateAfterPuzzle(puzzle, result) {
        // 1. Update rating using Elo-like system
        const expected = this.calculateExpectedScore(this.profile.rating, puzzle.rating);
        const actual = result.correct ? 1 : 0;
        const ratingChange = Math.round(this.ratingK * (actual - expected));

        this.profile.rating += ratingChange;
        this.profile.ratingHistory.push({
            timestamp: Date.now(),
            rating: this.profile.rating,
            change: ratingChange
        });

        // 2. Update theme performance
        for (const theme of puzzle.themes) {
            if (!this.profile.themePerformance[theme]) {
                this.profile.themePerformance[theme] = { correct: 0, incorrect: 0 };
            }

            if (result.correct) {
                this.profile.themePerformance[theme].correct++;
            } else {
                this.profile.themePerformance[theme].incorrect++;
            }
        }

        // 3. Update streak
        if (result.correct) {
            this.profile.currentStreak++;
            this.profile.bestStreak = Math.max(this.profile.bestStreak, this.profile.currentStreak);
        } else {
            this.profile.currentStreak = 0;
        }

        // 4. Add to recent puzzles (for trend analysis)
        this.profile.recentPuzzles.push({
            puzzleId: puzzle.id,
            rating: puzzle.rating,
            themes: puzzle.themes,
            correct: result.correct,
            timeSpent: result.timeSpent,
            timestamp: Date.now()
        });

        // Keep only last 100 puzzles
        if (this.profile.recentPuzzles.length > 100) {
            this.profile.recentPuzzles.shift();
        }

        // 5. Check for tier advancement
        this.checkTierAdvancement();

        return {
            ratingChange,
            newRating: this.profile.rating,
            weakThemes: this.identifyWeakThemes()
        };
    }

    /**
     * Calculate expected score using Elo formula
     */
    calculateExpectedScore(playerRating, puzzleRating) {
        const diff = puzzleRating - playerRating;
        return 1 / (1 + Math.pow(10, diff / 400));
    }

    /**
     * Check if student advanced to new tier
     */
    checkTierAdvancement() {
        const tiers = [
            { name: 'Beginner', min: 0, max: 899 },
            { name: 'Amateur', min: 900, max: 1099 },
            { name: 'Intermediate', min: 1100, max: 1299 },
            { name: 'Advanced', min: 1300, max: 1499 },
            { name: 'Expert', min: 1500, max: 1699 },
            { name: 'Master', min: 1700, max: 1999 },
            { name: 'Grandmaster', min: 2000, max: 9999 }
        ];

        const newTier = tiers.find(t =>
            this.profile.rating >= t.min && this.profile.rating <= t.max
        );

        if (newTier && newTier.name !== this.profile.tier) {
            this.profile.previousTier = this.profile.tier;
            this.profile.tier = newTier.name;
            this.profile.tierAdvancementDate = Date.now();
            return true; // Trigger celebration
        }

        return false;
    }
}
```

---

## Rapid Improvement Mechanics

### 1. Difficulty Sweet Spot
**Target Success Rate**: 60-70%
- Too high (>80%): Student not challenged, slow progress
- Too low (<40%): Student frustrated, gives up
- Optimal (60-70%): Flow state, rapid learning

### 2. Spaced Repetition Schedule
```
First exposure:  Immediate
Review 1:        +1 day
Review 2:        +3 days
Review 3:        +7 days
Review 4:        +14 days
Mastered:        +30 days
```

### 3. Weakness Targeting
- **70% focus** on weak themes (pins, forks, etc.)
- **20% focus** on maintaining strengths
- **10% focus** on new themes (variety)

### 4. Time-Based Adjustments
```javascript
// Adjust rating based on solve time
if (timeSpent < averageTime * 0.5) {
    // Solved too quickly, increase difficulty bonus
    effectiveRating += 50;
} else if (timeSpent > averageTime * 2) {
    // Struggled, decrease difficulty
    effectiveRating -= 30;
}
```

### 5. Streak Multipliers
```javascript
// XP multipliers based on streak
const streakBonus = {
    0-2: 1.0x,    // No bonus
    3-4: 1.2x,    // Small bonus
    5-9: 1.5x,    // Medium bonus
    10-19: 2.0x,  // Large bonus
    20+: 3.0x     // Epic bonus
};
```

---

## Expected Progression Timeline

### Beginner → Amateur (600 → 900)
- **Puzzles Required**: ~200-300
- **Time**: 20-30 hours
- **Focus**: Basic tactical vision
- **Success Rate**: 70-75%

### Amateur → Intermediate (900 → 1100)
- **Puzzles Required**: ~400-500
- **Time**: 40-50 hours
- **Focus**: Combination tactics
- **Success Rate**: 65-70%

### Intermediate → Advanced (1100 → 1300)
- **Puzzles Required**: ~600-800
- **Time**: 60-80 hours
- **Focus**: Complex calculations
- **Success Rate**: 60-65%

### Advanced → Expert (1300 → 1500)
- **Puzzles Required**: ~800-1000
- **Time**: 80-100 hours
- **Focus**: Positional understanding
- **Success Rate**: 55-60%

### Expert → Master (1500 → 1700)
- **Puzzles Required**: ~1000-1500
- **Time**: 100-150 hours
- **Focus**: Deep calculation + strategy
- **Success Rate**: 50-55%

### Master → Grandmaster (1700 → 2000)
- **Puzzles Required**: ~1500-2500
- **Time**: 150-250 hours
- **Focus**: GM-level precision
- **Success Rate**: 45-50%

---

## Performance Metrics

### Key Indicators
1. **Rating Velocity**: Points gained per hour
2. **Success Rate**: % correct in last 50 puzzles
3. **Theme Mastery**: % success per theme
4. **Time Efficiency**: Average solve time vs expected
5. **Consistency**: Rating standard deviation

### Target Metrics for Rapid Improvement
- **Rating Velocity**: +10 points/hour (aggressive), +5 points/hour (sustainable)
- **Success Rate**: 60-70% (optimal challenge)
- **Theme Mastery**: 80%+ on all themes before tier advancement
- **Time Efficiency**: Within ±20% of expected time
- **Consistency**: Low variance (student isn't guessing)

---

## AI Coach Integration

The AI Coach uses this model to:
1. **Identify focus areas** from weak themes
2. **Select training positions** at optimal difficulty
3. **Provide targeted explanations** for patterns student misses
4. **Adjust pacing** based on fatigue/performance trends
5. **Celebrate milestones** when advancing tiers

**Coach Intervention Triggers**:
- Success rate drops below 40% → Easier puzzles + encouragement
- Success rate above 85% → Harder puzzles + challenge
- Weak theme detected (3+ failures) → Theme-focused drill
- Plateau detected (no rating gain in 50 puzzles) → Strategy shift
- Breakthrough detected (rapid gains) → Reinforce techniques

---

## Data Collection Requirements

### Per Puzzle
```json
{
  "puzzleId": "lichess_00042",
  "fen": "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq -",
  "rating": 650,
  "themes": ["mate", "mateIn1"],
  "solution": ["h5f7"],
  "popularity": 95,
  "attempts": 13215
}
```

### Per Student Session
```json
{
  "sessionId": "20251208_123456_abc",
  "puzzleId": "lichess_00042",
  "correct": true,
  "timeSpent": 12.5,
  "hintsUsed": 0,
  "movesAttempted": ["h5g6", "h5f7"],
  "timestamp": "2025-12-08T12:34:56Z"
}
```

---

## References
- Lichess Puzzle Database: https://database.lichess.org/#puzzles
- FIDE Rating System: https://handbook.fide.com/
- Spaced Repetition Research: Ebbinghaus Forgetting Curve
- Flow State Theory: Csikszentmihalyi (1990)

---

**Next Steps**:
1. Implement `StudentAdvancementModel` class in index.html
2. Download Lichess puzzle database (5.6M puzzles)
3. Process puzzles into tier-organized JSON
4. Integrate with existing puzzle selection logic
5. Add performance tracking dashboard
