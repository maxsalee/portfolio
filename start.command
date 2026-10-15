#!/bin/bash
# Max Lee Portfolio - Local Preview Launcher
# Double-click or run: ./start.command

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "Starting local server..."
echo "The site will open at: http://127.0.0.1:4173"
echo "Press Ctrl+C to stop the server."
echo

# Check if node is available
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js not found."
    echo "Please install Node.js from https://nodejs.org/"
    read -p "Press Enter to exit..."
    exit 1
fi

# Start server in background
node server.js &
SERVER_PID=$!

# Give server a moment to start
sleep 2

# Open browser (macOS: open, Linux: xdg-open)
if command -v open &> /dev/null; then
    open "http://127.0.0.1:4173"
elif command -v xdg-open &> /dev/null; then
    xdg-open "http://127.0.0.1:4173"
else
    echo "Could not auto-open browser. Please visit: http://127.0.0.1:4173"
fi

# Wait for server (keeps terminal open)
wait $SERVER_PID