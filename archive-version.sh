#!/bin/bash
# Archive current version before making major changes

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
VERSION_NAME="${1:-v$TIMESTAMP}"

echo "📦 Archiving current version as: $VERSION_NAME"

# Copy to versions directory
cp index.html "versions/$VERSION_NAME.html"

# Update /last
cp index.html last.html

echo "✅ Archived to:"
echo "   - versions/$VERSION_NAME.html"
echo "   - last.html (public /last URL)"

# Git commit
git add versions/ last.html
git commit -m "archive: Save version $VERSION_NAME before major changes"
echo "🚀 Run 'git push' to deploy archive"
