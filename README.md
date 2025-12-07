# ChessBlitz Arena

A gamified rapid chess improvement tool with Roblox-style engagement mechanics.

## Features
- **10-Puzzle Assessment**: Calibrates your rating (600-2000)
- **XP & Levels**: Level up with celebrations
- **Streak System**: Fire animations + XP multipliers at 3+ streak
- **Power-Ups**: Hint, Freeze Timer, Skip, Double XP
- **AI-Powered Hints**: Stockfish engine analyzes positions & suggests best moves
- **Board Skins**: 9 unlockable themes
- **Daily Challenges**: Complete 5 puzzles for rewards
- **Achievements**: 8 badges to collect
- **Accelerated Ranking**: Dynamic difficulty + streak bonuses
- **Comprehensive Logging**: Track all user actions, errors, and AI analysis

## Quick Start
```bash
open index.html
# or
npm start
```

## Ranking System
- Beginner (0-899)
- Amateur (900-1099)
- Intermediate (1100-1299)
- Advanced (1300-1499)
- Expert (1500-1699)
- Master (1700-1999)
- Grandmaster (2000+)

## Tech
- Pure HTML/CSS/JS (no build required)
- Stockfish.js for AI analysis
- Chess.js for move validation
- LocalStorage for progress
- Self-contained single file

## Versions

- **Latest**: https://chess.genomicdigital.com (always current)
- **Previous**: https://chess.genomicdigital.com/last (stable fallback)
- **Archive**: See `versions/` directory

### Before Major Changes

```bash
./archive-version.sh              # Auto-timestamp
./archive-version.sh v2.0.0       # Named version
```

## Debug Console

Open DevTools and use:

```javascript
chessDebug.getLogs()           // View all logs
chessDebug.getErrors()         // View errors only
chessDebug.exportLogs()        // Download logs as JSON
chessDebug.showStats()         // View game state
chessDebug.getAIAnalysis()     // Get AI analysis for current position
```

## Contributing

1. Archive current version: `./archive-version.sh v1.x.x`
2. Make changes to `index.html`
3. Test locally
4. Commit and push
5. Previous version always available at `/last`

MIT License
