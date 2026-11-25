@echo off
title SlothSort AI - Slow and Steady File Organizer
echo ======================================================================
echo    SlothSort AI - Hacktoberfest 2026: Slow and Steady
echo    Privacy-First Offline AI File Organizer
echo ======================================================================
echo.

echo Checking Python...
py --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    python --version >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Python 3.10+ was not found. Please install Python.
        pause
        exit /b 1
    ) else (
        set PY_CMD=python
    )
) else (
    set PY_CMD=py
)

echo Checking Node.js...
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js was not found. Please install Node.js (v18+).
    pause
    exit /b 1
)

echo [1/3] Starting SlothSort AI FastAPI Backend on http://127.0.0.1:8000...
start "SlothSort Backend (FastAPI)" cmd /c "%PY_CMD% -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000"

echo [2/3] Starting SlothSort AI Frontend on http://localhost:5173...
start "SlothSort Frontend (Vite)" cmd /c "cd frontend && npm run dev"

echo [3/3] Waiting for servers to initialize...
timeout /t 3 /nobreak >nul

echo Opening SlothSort AI in your default browser...
start http://localhost:5173/

echo.
echo ======================================================================
echo  SlothSort AI is running!
echo  - Frontend: http://localhost:5173
echo  - Backend API: http://127.0.0.1:8000/docs
echo  - To quit: Close the opened terminal windows.
echo ======================================================================
pause
