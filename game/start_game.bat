@echo off
title Football Legends - 3D Game Server
echo ===================================================
echo       FOOTBALL LEGENDS: STARTING SYSTEM...
echo ===================================================

:: This part opens your browser to the local game address
echo [1/2] Launching Chrome/Default Browser...
start http://localhost:8000

:: This part starts the Python server to load your 3D assets
echo [2/2] Starting Python 3D Engine Server...
echo.
echo NOTE: Keep this window open while playing!
echo.
python -m http.server 8000

pause

