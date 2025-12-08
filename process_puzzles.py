#!/usr/bin/env python3
"""
Process Lichess puzzle database:
- Sample 10% of puzzles
- Filter by rating (600-2000+)
- Convert to JSON format matching current structure
"""

import csv
import json
import random
from collections import defaultdict

def parse_puzzle(row):
    """Convert CSV row to puzzle object"""
    puzzle_id = row['PuzzleId']
    fen = row['FEN']
    moves = row['Moves'].split()
    rating = int(row['Rating'])
    themes = row['Themes'].split()

    # Extract player moves as solution (every other move, starting with first)
    # Format: player_move1 opponent_response1 player_move2 opponent_response2...
    # We want: [player_move1, player_move2, ...]
    solution = [moves[i] for i in range(0, len(moves), 2)] if moves else []

    # Determine side to move from FEN
    fen_parts = fen.split()
    to_move = "White" if fen_parts[1] == 'w' else "Black"

    # Generate title from themes
    theme_names = {
        'fork': 'Fork',
        'pin': 'Pin',
        'skewer': 'Skewer',
        'discoveredAttack': 'Discovered Attack',
        'doubleCheck': 'Double Check',
        'mateIn1': 'Mate in 1',
        'mateIn2': 'Mate in 2',
        'mateIn3': 'Mate in 3',
        'hangingPiece': 'Hanging Piece',
        'sacrifice': 'Sacrifice',
        'crushing': 'Crushing Move',
        'defensiveMove': 'Defense',
        'quietMove': 'Quiet Move',
        'attackingF2F7': 'f7 Attack',
        'advantage': 'Winning Advantage'
    }

    title = "Tactical Puzzle"
    hint = "Find the best move!"

    for theme in themes:
        if theme in theme_names:
            title = theme_names[theme]
            break

    # Generate hints based on themes
    if 'fork' in themes:
        hint = "Look for a fork attacking multiple pieces!"
    elif 'pin' in themes:
        hint = "Can you pin a piece?"
    elif 'skewer' in themes:
        hint = "Attack through one piece to another!"
    elif 'mateIn1' in themes:
        hint = "Checkmate in one move!"
    elif 'mateIn2' in themes:
        hint = "Force checkmate in two moves!"
    elif 'hangingPiece' in themes:
        hint = "There's an undefended piece!"
    elif 'sacrifice' in themes:
        hint = "A sacrifice leads to victory!"
    elif 'discoveredAttack' in themes:
        hint = "Move one piece to unleash another!"

    return {
        'id': puzzle_id,
        'fen': fen,
        'solution': [solution],
        'hint': hint,
        'title': title,
        'toMove': to_move,
        'rating': rating,
        'themes': themes
    }

def categorize_by_tier(puzzles):
    """Organize puzzles into rating tiers"""
    tiers = {
        'beginner': [],      # 600-799
        'easy': [],          # 800-999
        'intermediate': [],  # 1000-1199
        'advanced': [],      # 1200-1399
        'expert': [],        # 1400-1699
        'master': []         # 1700+
    }

    for puzzle in puzzles:
        rating = puzzle['rating']

        if 600 <= rating < 800:
            tiers['beginner'].append(puzzle)
        elif 800 <= rating < 1000:
            tiers['easy'].append(puzzle)
        elif 1000 <= rating < 1200:
            tiers['intermediate'].append(puzzle)
        elif 1200 <= rating < 1400:
            tiers['advanced'].append(puzzle)
        elif 1400 <= rating < 1700:
            tiers['expert'].append(puzzle)
        elif rating >= 1700:
            tiers['master'].append(puzzle)

    return tiers

def main():
    print("Processing Lichess puzzle database...")
    print("Step 1: Reading and sampling CSV (2%)...")

    puzzles = []
    sample_rate = 0.02  # 2% for smaller file size

    with open('lichess_puzzles.csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)

        for i, row in enumerate(reader):
            # Sample 10%
            if random.random() > sample_rate:
                continue

            try:
                rating = int(row['Rating'])

                # Only include puzzles in our target range (600-2000)
                if 600 <= rating <= 2000:
                    puzzle = parse_puzzle(row)
                    puzzles.append(puzzle)

                # Progress update
                if i % 100000 == 0:
                    print(f"  Processed {i:,} rows, kept {len(puzzles):,} puzzles...")

            except (ValueError, KeyError) as e:
                # Skip malformed rows
                continue

    print(f"\nStep 2: Collected {len(puzzles):,} puzzles")
    print("Step 3: Categorizing by tier...")

    tiers = categorize_by_tier(puzzles)

    # Print statistics
    print("\nPuzzle Distribution:")
    for tier_name, tier_puzzles in tiers.items():
        print(f"  {tier_name:12s}: {len(tier_puzzles):6,} puzzles")

    # Save to JSON
    print("\nStep 4: Saving to JSON...")

    output = {
        'meta': {
            'total_puzzles': len(puzzles),
            'source': 'Lichess Puzzle Database',
            'sample_rate': f'{int(sample_rate * 100)}%',
            'date_processed': '2025-12-07'
        },
        'tiers': tiers
    }

    with open('puzzles.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2)

    print(f"✅ Saved to puzzles.json ({len(puzzles):,} puzzles)")
    print("\nReady to integrate into index.html!")

if __name__ == '__main__':
    main()
