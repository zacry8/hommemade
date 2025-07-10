#!/bin/bash

# Quick Push - Double-click to deploy
# This script automatically adds, commits, and pushes changes

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Quick Push to GitHub"
echo "======================="
echo ""

# Call the main git push script
if "$SCRIPT_DIR/scripts/git-push.sh"; then
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