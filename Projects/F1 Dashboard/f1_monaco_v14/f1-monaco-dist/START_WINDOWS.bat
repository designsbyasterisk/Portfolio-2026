@echo off
echo === F1 Monaco Track Stats ===
echo Installing dependencies...
call npm install
echo.
echo Starting dev server...
echo Open http://localhost:5173 in Chrome
echo (Keep this window open!)
echo.
call npm run dev
