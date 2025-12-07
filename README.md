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

## Documentation

### For Users
- **[UserExperienceRequirements.md](UserExperienceRequirements.md)** - Complete UX specifications and requirements
- **[TESTING_STATUS.md](TESTING_STATUS.md)** - Current testing status and results

### For Developers
- **[QUICKSTART.md](QUICKSTART.md)** - Get started in 2 minutes
- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Comprehensive development guide
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deployment and release process
- **[API.md](API.md)** - JavaScript API reference
- **[TICKETS.md](TICKETS.md)** - Issue tracker and roadmap (25 tickets)

### Session Notes
- **[SESSION_2025-12-07_E2B_TESTING.md](SESSION_2025-12-07_E2B_TESTING.md)** - E2B testing infrastructure setup
- **[ASYNC_EVAL_*.txt](ASYNC_EVAL_20251207_161557.txt)** - Async UX evaluation instructions

## Testing

### Automated Tests
```bash
# Run basic functionality tests
cd ../e2b
python examples/07_chess_blitz_test.py

# Run async UX evaluation (recommended)
python examples/10_chess_ux_async.py
```

### Manual Testing
- Open `index.html` in browser
- Follow checklist in [DEVELOPMENT.md](DEVELOPMENT.md#manual-testing-checklist)
- Use `chessDebug.*` methods in browser console

## Contributing

1. Read [DEVELOPMENT.md](DEVELOPMENT.md) for detailed guidelines
2. Check [TICKETS.md](TICKETS.md) for open issues
3. Archive current version: `./archive-version.sh v1.x.x`
4. Make changes to `index.html`
5. Test locally (manual + automated)
6. Commit and push
7. Previous version always available at `/last`

## License

MIT License
