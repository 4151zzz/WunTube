@echo off
cd /d "%~dp0"

pause

node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js not found! Please install from https://nodejs.org
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

echo.
echo Starting WunTube Server...
echo Browser will open at http://localhost:3000
echo Close this window to stop the server.
echo.

start "" cmd /c "timeout /t 3 >nul && start http://localhost:3000"

node server.js

pause
