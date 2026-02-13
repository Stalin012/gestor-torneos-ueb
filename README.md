# 🏆 Gestor de Torneos UEB

Sistema integral de gestión deportiva para la Universidad Estatal de Bolívar.

## 🚀 Características

- **Backend Laravel 11** con API REST completa
- **Frontend React + Vite** con interfaz moderna
- **Base de datos PostgreSQL** con migraciones y seeders
- **Autenticación JWT** con Laravel Sanctum
- **Sistema de roles** (Admin, Representante, Árbitro, Usuario)
- **Gestión completa de torneos** y equipos
- **Sistema de notificaciones** en tiempo real
- **Interfaz responsive** con diseño moderno

## 📋 Requisitos

- **PHP** >= 8.1
- **Composer** >= 2.0
- **Node.js** >= 18.0
- **PostgreSQL** >= 14.0
- **npm** >= 9.0

## 🛠️ Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/gestor-torneos-ueb.git
cd gestor-torneos-ueb
```

### 2. Configurar Backend (Laravel)
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

### 3. Configurar Base de Datos
Edita el archivo `backend/.env`:
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=gestor_torneos
DB_USERNAME=postgres
DB_PASSWORD=tu_password
```

### 4. Ejecutar Migraciones y Seeders
```bash
php artisan migrate:fresh --seed
```

### 5. Configurar Frontend (React)
```bash
cd ../frontend
npm install
cp .env.example .env
```

Edita el archivo `frontend/.env`:
```env
VITE_API_URL=http://127.0.0.1:8000/api
```

## 🚀 Ejecutar el Proyecto

### Opción 1: Script Automático
```bash
# Desde la raíz del proyecto
./start-project.bat
```

### Opción 2: Manual

**Backend:**
```bash
cd backend
php artisan serve
```

**Frontend:**
```bash
cd frontend
npm run dev
```

## 👥 Credenciales de Prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@ueb.edu.ec | password |
| Representante | luis@ueb.edu.ec | password |
| Árbitro | bethy@ueb.edu.ec | password |
| Usuario | winston@ueb.edu.ec | password |

## 📁 Estructura del Proyecto

```
gestor/
├── backend/              # Laravel API
│   ├── app/
│   ├── database/
│   ├── routes/
│   └── .env
├── frontend/            # React + Vite
│   ├── src/
│   ├── public/
│   └── .env
├── documentacion/       # Documentación
└── README.md
```

## 🔧 Comandos Útiles

### Backend
```bash
# Limpiar cachés
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# Ejecutar migraciones
php artisan migrate

# Ejecutar seeders específicos
php artisan db:seed --class=ConfiguracionSeeder
```

### Frontend
```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview
```

## 🌟 Funcionalidades

### Administrador
- ✅ Gestión completa de torneos
- ✅ Administración de equipos y jugadores
- ✅ Control de usuarios del sistema
- ✅ Configuración general
- ✅ Auditoría del sistema

### Representante
- ✅ Gestión de equipos propios
- ✅ Inscripción a torneos
- ✅ Administración de nóminas
- ✅ Visualización de partidos

### Árbitro
- ✅ Partidos asignados
- ✅ Registro de marcadores
- ✅ Gestión de estadísticas

### Usuario/Jugador
- ✅ Perfil personal
- ✅ Equipos inscritos
- ✅ Carnet digital

## 🔒 Seguridad

- Autenticación JWT con Laravel Sanctum
- Middleware de autorización por roles
- Validación de datos en backend y frontend
- Protección CORS configurada
- Auditoría de acciones del sistema

## 🚀 Despliegue

### Producción
1. Configurar variables de entorno para producción
2. Ejecutar `npm run build` en el frontend
3. Configurar servidor web (Apache/Nginx)
4. Configurar base de datos PostgreSQL
5. Ejecutar migraciones en producción

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

© 2025 Universidad Estatal de Bolívar. Todos los derechos reservados.

## 📞 Soporte

Para reportar problemas o solicitar ayuda:
- Crear un issue en GitHub
- Contactar al equipo de desarrollo

---

**Versión:** 1.0.0  
**Última actualización:** Febrero 2026