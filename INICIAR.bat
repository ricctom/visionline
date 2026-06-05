@echo off
echo Iniciando Visionline...
start "Backend - Visionline" cmd /k "cd /d "%~dp0" && node src/app.js"
timeout /t 3 /nobreak >nul
start "Frontend - Visionline" cmd /k "cd /d "%~dp0client" && npx vite"
timeout /t 4 /nobreak >nul
start http://localhost:5173
echo Listo! Abriendo el navegador...
