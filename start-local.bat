@echo off
rem Movie Bash - run on this Windows PC (needs Node.js 20+ and PostgreSQL running).
rem Creates the database, tables and starter content automatically (npm run dev does it), then starts the site at http://localhost:3105
cd /d "%~dp0"
if not exist .env.local (
  echo .env.local not found. Copy .env.example to .env.local and set DATABASE_URL and JWT_SECRET first.
  pause
  exit /b 1
)
if not exist node_modules call npm install || goto error
call npm run dev
goto :eof
:error
echo Something went wrong. See the messages above.
pause
