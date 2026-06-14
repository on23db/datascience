@echo off
title Python HTTP Server

REM Prüfen, ob Python verfügbar ist
python --version >nul 2>&1
if errorlevel 1 (
    echo Fehler: Python wurde nicht gefunden.
    echo Bitte Python installieren oder zum PATH hinzufuegen.
    pause
    exit /b 1
)

REM Server in neuem Fenster starten
start "Python HTTP Server" cmd /k "python -m http.server 8000"

REM Kurz warten, damit der Server starten kann
timeout /t 2 /nobreak >nul

REM Browser oeffnen
start http://localhost:8000/index.html

exit