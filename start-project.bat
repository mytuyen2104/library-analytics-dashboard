@echo off
echo Dang khoi dong he thong UTH Library Analytics...

:: 1. Khoi dong container Metabase tren Docker
start "Metabase BI" cmd /k "docker start metabase"

:: 2. Khoi dong Backend API (Port 5000)
start "Backend API" cmd /k "cd backend && node server.js"

:: 3. Khoi dong Frontend React (Port 5173)
start "Frontend React" cmd /k "cd frontend && npm run dev"

:: 4. (Tuy chon) Bo dau :: o dong duoi neu ban muon bat luon Cloudflare Tunnel
:: start "Cloudflare Tunnel" cmd /k "cloudflared tunnel run"

echo Da khoi dong xong tat ca dich vu!