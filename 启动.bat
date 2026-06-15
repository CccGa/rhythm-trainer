@echo off
cd /d "%~dp0"

start "" /B node server.cjs

start "" /B npm run dev

timeout /t 5 /nobreak >nul

start "" http://localhost:5173