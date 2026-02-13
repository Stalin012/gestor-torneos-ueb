@echo off
echo ========================================
echo   GESTOR DE TORNEOS - STARTUP SCRIPT
echo ========================================
echo.

echo [1/3] Verificando servicios...
echo.

REM Verificar si PostgreSQL está ejecutándose
echo Verificando PostgreSQL...
pg_isready -h 127.0.0.1 -p 5432 >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] PostgreSQL no está ejecutándose
    echo Por favor, inicia PostgreSQL antes de continuar
    pause
    exit /b 1
)
echo [OK] PostgreSQL está ejecutándose
echo.

echo [2/3] Iniciando Backend (Laravel)...
start "Backend - Laravel" cmd /k "cd backend && php artisan serve"
timeout /t 3 >nul
echo [OK] Backend iniciado en http://127.0.0.1:8000
echo.

echo [3/3] Iniciando Frontend (React + Vite)...
start "Frontend - React" cmd /k "cd frontend && npm run dev"
timeout /t 3 >nul
echo [OK] Frontend iniciado en http://localhost:5173
echo.

echo ========================================
echo   PROYECTO INICIADO CORRECTAMENTE
echo ========================================
echo.
echo Backend:  http://127.0.0.1:8000
echo Frontend: http://localhost:5173
echo.
echo Presiona cualquier tecla para abrir el navegador...
pause >nul

start http://localhost:5173

echo.
echo Para detener los servidores, cierra las ventanas de comandos
echo o presiona Ctrl+C en cada una.
echo.
pause
