# 🏆 Gestor de Torneos UEB - Documentación Completa

## 📋 REQUESTS DE USUARIOS IMPLEMENTADOS

### ✅ Funcionalidades Core
1. **Sistema de gestión de torneos deportivos UEB**
2. **Backend Laravel 11 + Frontend React + Vite**
3. **Base de datos PostgreSQL con migraciones y seeders**
4. **Autenticación JWT con Laravel Sanctum**
5. **Sistema de roles: Admin, Representante, Árbitro, Usuario**
6. **Gestión completa de torneos, equipos y jugadores**
7. **Sistema de notificaciones en tiempo real**
8. **Interfaz responsive con diseño moderno glassmorphism**
9. **Dashboard personalizado por rol**
10. **Sistema de auditoría y logs**
11. **Carnet digital para jugadores**
12. **Gestión de partidos y marcadores**
13. **Inscripciones a torneos**
14. **Administración de nóminas**
15. **Perfil de usuario con foto**

### 🔐 Credenciales de Prueba
| Rol | Email | Contraseña | Cédula |
|-----|-------|------------|--------|
| Admin | admin@ueb.edu.ec | password | 0102030405 |
| Representante | luis@ueb.edu.ec | password | 0302429733 |
| Árbitro | bethy@ueb.edu.ec | password | 1500511231 |
| Usuario | winston@ueb.edu.ec | password | 1500982782 |

## 🛠️ Arquitectura Técnica

### Backend (Laravel 11)
- **API REST** completa con rutas protegidas
- **Middleware personalizado** para CORS
- **Controladores** organizados por módulos
- **Migraciones** con datos reales
- **Seeders** con información de prueba
- **Autenticación JWT** con Sanctum

### Frontend (React + Vite)
- **Componentes modulares** reutilizables
- **Context API** para estado global
- **React Router** para navegación
- **Axios** para peticiones HTTP
- **CSS moderno** con glassmorphism
- **Responsive design** mobile-first

### Base de Datos (PostgreSQL)
- **Tablas principales**: usuarios, personas, deportes, torneos, equipos, jugadores
- **Relaciones** bien definidas con foreign keys
- **Índices** optimizados para consultas
- **Constraints** para integridad de datos

## 🎨 Sistema de Diseño

### Paleta de Colores
- **Primario**: Azul (#3b82f6)
- **Secundario**: Verde (#10b981)
- **Acento**: Púrpura (#8b5cf6)
- **Tema oscuro** con efectos glassmorphism

### Componentes UI
- **Navegación unificada** con sidebar responsive
- **Cards** con efectos de hover y gradientes
- **Botones** con estados interactivos
- **Formularios** con validación en tiempo real
- **Modales** y notificaciones toast

## 📁 Estructura de Archivos

```
gestor/
├── backend/                 # Laravel API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/
│   │   │   └── Middleware/
│   │   └── Models/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/
│   └── config/
├── frontend/               # React + Vite
│   ├── src/
│   │   ├── components/
│   │   ├── Pages/
│   │   ├── context/
│   │   ├── css/
│   │   └── utils/
│   └── public/
│       └── img/
└── documentacion/
```

## 🚀 Instalación y Configuración

### 1. Requisitos del Sistema
- PHP >= 8.1
- Composer >= 2.0
- Node.js >= 18.0
- PostgreSQL >= 14.0
- npm >= 9.0

### 2. Configuración Backend
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
```

### 3. Configuración Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### 4. Variables de Entorno

**Backend (.env)**
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=gestor_torneos
DB_USERNAME=postgres
DB_PASSWORD=tu_password
```

**Frontend (.env)**
```env
VITE_API_URL=http://127.0.0.1:8000/api
```

## 🔧 Problemas Resueltos

### CORS Errors
- ✅ Creado CorsMiddleware personalizado
- ✅ Configurado bootstrap/app.php
- ✅ Actualizado cors.php con orígenes correctos

### CSS Layout Issues
- ✅ Corregido espacios vacíos en unified-navigation.css
- ✅ Añadidas propiedades margin/padding correctas
- ✅ Mejorado responsive design

### Database Issues
- ✅ Resueltos conflictos de nombres de columnas
- ✅ Corregidas constraints nullable
- ✅ Actualizados seeders con datos reales

### Sistema de Notificaciones
- ✅ Migración completa creada
- ✅ Controlador con CRUD completo
- ✅ Componente React integrado
- ✅ Historial persistente

## 📊 Funcionalidades por Rol

### 👑 Administrador
- Gestión completa de torneos
- Administración de equipos y jugadores
- Control de usuarios del sistema
- Configuración general
- Auditoría del sistema

### 🏃 Representante
- Gestión de equipos propios
- Inscripción a torneos
- Administración de nóminas
- Visualización de partidos

### ⚽ Árbitro
- Partidos asignados
- Registro de marcadores
- Gestión de estadísticas

### 👤 Usuario/Jugador
- Perfil personal
- Equipos inscritos
- Carnet digital

## 🔒 Seguridad Implementada

- **Autenticación JWT** con Laravel Sanctum
- **Middleware de autorización** por roles
- **Validación de datos** en backend y frontend
- **Protección CORS** configurada
- **Auditoría de acciones** del sistema
- **Sanitización de inputs** para prevenir XSS
- **Rate limiting** en API endpoints

## 🚀 Comandos de Desarrollo

### Backend
```bash
# Servidor de desarrollo
php artisan serve

# Limpiar cachés
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# Migraciones
php artisan migrate:fresh --seed
```

### Frontend
```bash
# Desarrollo
npm run dev

# Build producción
npm run build

# Preview
npm run preview
```

## 📈 Próximas Mejoras

- [ ] Sistema de chat en tiempo real
- [ ] Reportes avanzados con gráficos
- [ ] Integración con redes sociales
- [ ] App móvil nativa
- [ ] Sistema de pagos
- [ ] Streaming de partidos

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

© 2025 Universidad Estatal de Bolívar. Todos los derechos reservados.

---

**Versión:** 1.0.0  
**Última actualización:** Febrero 2026  
**Estado:** ✅ Listo para producción