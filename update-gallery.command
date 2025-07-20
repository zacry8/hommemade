#!/bin/bash

# Gallery Update Script
# Double-click this file to update your gallery instantly!

echo "🚀 Updating Gallery..."
echo "======================="

# Navigate to the project directory
cd "$(dirname "$0")"

# Generate portfolio from photos
echo "📁 Scanning portfolio folders..."
npm run generate-portfolio

# Check if successful
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Gallery updated successfully!"
    echo "📸 Found photos in your portfolio folders"
    echo "🌐 Gallery data regenerated"
    echo ""
    echo "🔥 Your gallery is ready!"
    echo "Visit: http://localhost:3000/gallery.html"
    echo ""
    
    # Optionally open gallery in browser
    read -p "Open gallery in browser? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open "gallery.html"
    fi
else
    echo ""
    echo "❌ Update failed"
    echo "Make sure you have photos in your /portfolio/ folders"
fi

echo ""
echo "Press any key to close..."
read -n 1 -s