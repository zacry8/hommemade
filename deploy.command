#!/bin/bash

# Interactive Deploy - Double-click for custom deployment
# This script prompts for a commit message before deploying

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "📦 Interactive Deploy to GitHub"
echo "==============================="
echo ""

# Show current git status
cd "$SCRIPT_DIR"
echo "📋 Current changes:"
git status --short
echo ""

# Prompt for commit message
echo "✏️  Enter a commit message (or press Enter for auto-generated):"
read -p "💬 Message: " COMMIT_MSG

echo ""
echo "🚀 Deploying your changes..."
echo ""

# Call the main git push script with custom message
if [ -n "$COMMIT_MSG" ]; then
    "$SCRIPT_DIR/scripts/git-push.sh" "$COMMIT_MSG"
else
    "$SCRIPT_DIR/scripts/git-push.sh"
fi

# Check the exit status
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully deployed your changes!"
    echo ""
    echo "View your site at:"
    echo "📋 Local: file://$SCRIPT_DIR/index.html"
    echo "🌐 GitHub: https://github.com/zacry8/hommemade"
    
    # Check if Vercel is configured
    if [ -f "$SCRIPT_DIR/vercel.json" ]; then
        echo "☁️  Vercel deployment will happen automatically"
    fi
else
    echo ""
    echo "❌ Deployment failed!"
    echo "Please check the error messages above."
fi

echo ""
echo "Press any key to close this window..."
read -n 1 -s