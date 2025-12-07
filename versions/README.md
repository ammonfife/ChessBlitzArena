# Version Archive

This directory contains archived versions of ChessBlitz Arena.

## Current Versions

- **Latest**: [/](https://chess.genomicdigital.com) (index.html)
- **Previous**: [/last](https://chess.genomicdigital.com/last) (last.html)

## Archived Versions

Each major update is archived with timestamp:

- `vYYYYMMDD_HHMMSS.html` - Auto-timestamped versions
- `v1.0.0.html` - Named versions

## Usage

Before making major changes:

```bash
./archive-version.sh              # Auto-timestamp
./archive-version.sh v2.0.0       # Named version
```

This will:
1. Save current index.html to versions/
2. Update last.html (public /last URL)
3. Create git commit
4. Preserve rollback capability

## Version History

| Date | Version | Description |
|------|---------|-------------|
| 2025-12-07 | Initial | AI integration, logging, piece colors |
