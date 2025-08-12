#!/bin/bash

# Start the API server in background
echo "🚀 Starting real-time API server..."
node api-server.cjs &
API_PID=$!

# Wait a moment for API to start
sleep 2

# Check if API server is running
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ API server running on port 3001"
else
    echo "❌ Failed to start API server"
    exit 1
fi

# Start the frontend dev server
echo "🎯 Starting frontend dev server..."
npm run dev

# Cleanup function
cleanup() {
    echo "🛑 Stopping servers..."
    kill $API_PID 2>/dev/null
    exit 0
}

# Set up trap to kill background process on script exit
trap cleanup EXIT INT TERM
