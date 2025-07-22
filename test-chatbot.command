#!/bin/bash

# Simple local test server for Homme Made Chatbot
# This allows testing the frontend without Vercel CLI

echo "🤖 Starting Homme Made AI Chatbot Test Server..."
echo "📍 Testing frontend pages (API requires Vercel deployment)"

# Check if Python is available
if command -v python3 &> /dev/null; then
    echo "🐍 Using Python 3 server"
    cd "$(dirname "$0")/public"
    python3 -m http.server 8080
elif command -v python &> /dev/null; then
    echo "🐍 Using Python 2 server"
    cd "$(dirname "$0")/public"
    python -m SimpleHTTPServer 8080
else
    echo "❌ Python not found. Please install Python or use Vercel CLI:"
    echo "   npm install -g vercel"
    echo "   vercel login"
    echo "   npm run dev"
    exit 1
fi

echo ""
echo "🚀 Server started at http://localhost:8080"
echo "📱 Test pages:"
echo "   • Main site: http://localhost:8080"
echo "   • AI Assistants: http://localhost:8080/chatbot.html"
echo "   • Creative Director: http://localhost:8080/chatbot-creative-director.html"
echo "   • Automation Consultant: http://localhost:8080/chatbot-automation-consultant.html"
echo "   • Portfolio Assistant: http://localhost:8080/chatbot-portfolio-assistant.html"
echo ""
echo "⚠️  Note: Chat functionality requires deployment to Vercel for API access"
echo "💬 Frontend UI and navigation will work locally"
echo ""
echo "Press Ctrl+C to stop the server"