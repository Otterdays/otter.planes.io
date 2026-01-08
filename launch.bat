@echo off
setlocal enabledelayedexpansion

:: Store original directory
set "ORIG_DIR=%CD%"

:: Check if Node.js is installed
where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Check if npm is installed
where npm >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm is not installed or not in PATH
    pause
    exit /b 1
)

echo ========================================
echo   Otter Planes IO - Launch Script
echo ========================================
echo.

:: Install client dependencies (skip if node_modules exists)
echo [1/4] Checking client dependencies...
cd /d "%ORIG_DIR%\client"
if not exist "node_modules" (
    echo        Installing client dependencies...
    call npm install --silent
    if errorlevel 1 (
        echo [ERROR] Failed to install client dependencies
        cd /d "%ORIG_DIR%"
        pause
        exit /b 1
    )
    echo        Client dependencies installed
) else (
    echo        Client dependencies already installed (skipping)
)

:: Install server dependencies (skip if node_modules exists)
echo [2/4] Checking server dependencies...
cd /d "%ORIG_DIR%\server"
if not exist "node_modules" (
    echo        Installing server dependencies...
    call npm install --silent
    if errorlevel 1 (
        echo [ERROR] Failed to install server dependencies
        cd /d "%ORIG_DIR%"
        pause
        exit /b 1
    )
    echo        Server dependencies installed
) else (
    echo        Server dependencies already installed (skipping)
)

:: Check for port conflicts (optional warning)
echo [3/4] Checking ports...
netstat -an | findstr ":3001" >nul 2>&1
if not errorlevel 1 (
    echo        [WARNING] Port 3001 may be in use
)
netstat -an | findstr ":3000" >nul 2>&1
if not errorlevel 1 (
    echo        [WARNING] Port 3000 may be in use
)

:: Start server
echo [4/4] Starting servers...
cd /d "%ORIG_DIR%\server"
start "Otter Planes - Server (Port 3001)" cmd /k "title Otter Planes Server && npm run dev"
echo        Server starting in new window...

:: Wait for server to initialize
timeout /t 2 /nobreak >nul

:: Start client
cd /d "%ORIG_DIR%\client"
start "Otter Planes - Client (Port 3000)" cmd /k "title Otter Planes Client && npm run dev"
echo        Client starting in new window...

:: Return to original directory
cd /d "%ORIG_DIR%"

echo.
echo ========================================
echo   Launch Complete!
echo ========================================
echo.
echo   Server: http://localhost:3001
echo   Client: http://localhost:3000
echo.
echo   Both servers are running in separate windows.
echo   Close those windows to stop the servers.
echo.
echo   Press any key to close this window...
pause >nul

