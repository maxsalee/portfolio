@echo off
title Max Lee Portfolio - Local Preview
echo Starting local server...
echo.
echo The site will open at: http://127.0.0.1:4173
echo Press Ctrl+C to stop the server.
echo.

REM Check if node is available
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found in PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Start server in background and open browser
start "Portfolio Server" /b node server.js
timeout /t 2 >nul
start "" "http://127.0.0.1:4173"

echo Server running. Close this window to stop.
pause