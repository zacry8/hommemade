#!/bin/bash

# Git Push Helper Script
# Handles the complete git workflow: add -> commit -> push

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Change to project directory
cd "$PROJECT_DIR"
print_status "Working in: $(pwd)"

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not a git repository!"
    exit 1
fi

# Check git status
print_status "Checking git status..."
if git diff-index --quiet HEAD -- 2>/dev/null && [ -z "$(git ls-files --other --exclude-standard)" ]; then
    print_warning "No changes detected. Nothing to commit."
    exit 0
fi

# Show current status
print_status "Current git status:"
git status --short

# Add all files
print_status "Adding all files..."
git add .

# Get commit message (first parameter or default)
if [ "$#" -eq 0 ]; then
    COMMIT_MSG="Update site - $(date '+%Y-%m-%d %H:%M:%S')"
else
    COMMIT_MSG="$1"
fi

# Commit changes
print_status "Committing changes with message: '$COMMIT_MSG'"
git commit -m "$COMMIT_MSG"

# Push to remote
print_status "Pushing to remote repository..."
if git push; then
    print_success "Successfully pushed to GitHub!"
    print_success "Your changes are now live at: https://github.com/zacry8/hommemade"
else
    print_error "Failed to push to remote repository"
    exit 1
fi

print_success "Deployment complete!"