@echo off
echo Installing dependencies...
call npm install
echo.
echo Starting WealthAssist dev server...
echo.
echo App will be available at: http://localhost:3000
echo.
call npm run dev
pause
