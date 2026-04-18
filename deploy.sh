#!/bin/bash

# Turf Slot Booking - Quick Deployment Script
# This script automates deployment to Vercel

set -e  # Exit on error

echo "🚀 Turf Slot Booking - Deployment Script"
echo "========================================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing Git repository..."
    git init
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "📝 Committing changes..."
    git add .
    read -p "Enter commit message (default: 'Update app'): " COMMIT_MSG
    COMMIT_MSG=${COMMIT_MSG:-"Update app"}
    git commit -m "$COMMIT_MSG"
else
    echo "✅ No changes to commit"
fi

# Check if remote exists
if ! git remote get-url origin &>/dev/null; then
    echo "🔗 Setting up GitHub remote..."
    read -p "Enter GitHub repository URL: " REPO_URL
    git remote add origin "$REPO_URL"
fi

# Push to GitHub
echo "📤 Pushing to GitHub..."
git branch -M main
git push -u origin main

echo ""
echo "✅ Code pushed to GitHub!"
echo ""
echo "Next steps to deploy to Vercel:"
echo "1. Go to https://vercel.com/dashboard"
echo "2. Click 'Add New' > 'Project'"
echo "3. Select your GitHub repository"
echo "4. Add environment variables:"
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "   - SUPABASE_SERVICE_ROLE_KEY"
echo "5. Click 'Deploy'"
echo ""
echo "Or use Vercel CLI:"
echo "  npm install -g vercel"
echo "  vercel --prod"
echo ""
echo "For detailed deployment guide, see DEPLOYMENT.md"
