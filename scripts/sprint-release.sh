#!/bin/bash
# Quick sprint release script for WeBuddhist-Studio

echo "🚀 Creating WeBuddhist-Studio Sprint Release with Timestamp Version"
echo "=================================================================="

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Not in a git repository"
    exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

# Run the Node.js release script
node scripts/release-sprint.js --type sprint

echo ""
echo "✅ WeBuddhist-Studio sprint release completed!"
echo "📋 To view all tags: git tag -l"
echo "📋 To view recent tags: git tag -l --sort=-version:refname | head -10"
