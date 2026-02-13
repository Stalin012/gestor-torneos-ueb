@echo off
echo ========================================
echo Limpiando cache y reiniciando proyecto
echo ========================================
echo.

echo [1/4] Deteniendo servidor si esta corriendo...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/4] Limpiando cache de Vite...
if exist node_modules\.vite rmdir /s /q node_modules\.vite
if exist dist rmdir /s /q dist

echo [3/4] Limpiando cache del navegador (instrucciones)...
echo.
echo IMPORTANTE: Abre tu navegador y presiona:
echo - Chrome/Edge: Ctrl + Shift + Delete
echo - Firefox: Ctrl + Shift + Delete
echo.
echo Selecciona "Imagenes y archivos en cache" y limpia.
echo.
pause

echo [4/4] Iniciando servidor de desarrollo...
npm run dev

pause
