@echo off
REM TVS Procurement - Production Runner
REM Uses PM2 to keep services alive

REM 1. Install PM2 if not exists
call npm list -g pm2 >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing PM2...
    call npm install -g pm2
)

REM 2. Delete existing
echo Stopping existing services...
call pm2 delete all

REM 3. Start services
echo Starting services...
call pm2 start ecosystem.config.js

REM 4. Save list
call pm2 save

echo ----------------------------------------
echo Services started!
echo Backend: http://localhost:8020
echo Frontend: http://localhost:3020
echo ----------------------------------------
echo To view logs: pm2 logs
echo To stop: pm2 stop all
pause
