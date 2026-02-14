@echo off
echo ========================================
echo    PREPARANDO PROYECTO PARA GITHUB
echo ========================================
echo.

echo [1/6] Inicializando repositorio Git...
git init
echo.

echo [2/6] Agregando archivos al staging...
git add .
echo.

echo [3/6] Creando primer commit...
git commit -m "🚀 Initial commit: Gestor de Torneos UEB

✅ Backend Laravel 11 con API REST completa
✅ Frontend React + Vite con diseño moderno
✅ Base de datos PostgreSQL con seeders
✅ Autenticación JWT con Laravel Sanctum
✅ Sistema de roles (Admin, Representante, Árbitro, Usuario)
✅ Gestión completa de torneos y equipos
✅ Sistema de notificaciones en tiempo real
✅ Interfaz responsive con glassmorphism
✅ Dashboard personalizado por rol
✅ Sistema de auditoría y logs

Credenciales de prueba:
- Admin: admin@ueb.edu.ec / password
- Representante: luis@ueb.edu.ec / password
- Árbitro: bethy@ueb.edu.ec / password
- Usuario: winston@ueb.edu.ec / password"
echo.

echo [4/6] Configurando rama principal...
git branch -M main
echo.

echo [5/6] Para subir a GitHub, ejecuta:
echo git remote add origin https://github.com/tu-usuario/gestor-torneos-ueb.git
echo git push -u origin main
echo.

echo [6/6] Archivos listos para GitHub:
echo ✅ README.md - Documentación principal
echo ✅ PROYECTO_COMPLETO.md - Documentación técnica completa
echo ✅ .gitignore - Archivos excluidos
echo ✅ .env.example - Variables de entorno de ejemplo
echo ✅ Código fuente completo con comentarios
echo.

echo ========================================
echo   PROYECTO LISTO PARA GITHUB! 🚀
echo ========================================
pause