# Sistema Gestor de Torneos Deportivos

Sistema completo de gestión de torneos deportivos desarrollado con Laravel y React.

## 🚀 Características

### Módulos Principales
- ✅ **Gestión de Torneos** - Crear, editar y administrar torneos
- ✅ **Equipos e Inscripciones** - Registro y gestión de equipos
- ✅ **Jugadores y Personas** - Base de datos de jugadores con carnets digitales
- ✅ **Partidos y Fixtures** - Programación automática de encuentros
- ✅ **Estadísticas** - Seguimiento de rendimiento y resultados
- ✅ **Tabla de Posiciones** - Clasificación automática
- ✅ **Árbitros** - Gestión de árbitros y asignaciones
- ✅ **Noticias y Galería** - Contenido multimedia
- ✅ **Auditoría** - Registro de acciones del sistema

### Roles de Usuario
- **Administrador** - Control total del sistema
- **Representante** - Gestión de equipos propios
- **Árbitro** - Acceso a partidos asignados
- **Usuario** - Consulta de información pública

## 📋 Requisitos

- PHP 8.2+
- PostgreSQL 14+
- Node.js 18+
- Composer
- NPM

## 🔧 Instalación

```bash
# Clonar repositorio
git clone <repo-url>
cd gestor

# Instalar dependencias PHP
composer install

# Instalar dependencias JS
npm install

# Configurar entorno
cp .env.example .env
php artisan key:generate

# Configurar base de datos en .env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=gestor_torneos
DB_USERNAME=postgres
DB_PASSWORD=tu_password

# Ejecutar migraciones
php artisan migrate

# Compilar assets
npm run build

# Iniciar servidor
php artisan serve
```

## 🎯 Uso

### Desarrollo
```bash
# Terminal 1: Servidor Laravel
php artisan serve

# Terminal 2: Vite dev server
npm run dev
```

### Producción
```bash
npm run build
php artisan optimize
php artisan config:cache
php artisan route:cache
```

## 📁 Estructura del Proyecto

```
gestor/
├── app/
│   ├── Http/Controllers/Api/  # Controladores API
│   ├── Models/                # Modelos Eloquent
│   ├── Services/              # Lógica de negocio
│   └── Traits/                # Traits reutilizables
├── resources/
│   ├── js/
│   │   ├── Pages/            # Componentes React
│   │   └── components/       # Componentes reutilizables
│   └── views/                # Vistas Blade
├── routes/
│   └── api.php               # Rutas API
└── database/
    └── migrations/           # Migraciones
```

## 🔐 API Endpoints

### Autenticación
- POST `/api/login` - Iniciar sesión
- POST `/api/register` - Registrar usuario
- POST `/api/logout` - Cerrar sesión

### Torneos
- GET `/api/torneos` - Listar torneos
- POST `/api/torneos` - Crear torneo
- PUT `/api/torneos/{id}` - Actualizar torneo
- DELETE `/api/torneos/{id}` - Eliminar torneo

### Partidos
- GET `/api/partidos` - Listar partidos
- POST `/api/partidos/{id}/iniciar` - Iniciar partido
- POST `/api/partidos/{id}/finalizar` - Finalizar partido

### Jugadores
- GET `/api/jugadores` - Listar jugadores
- POST `/api/jugadores/{cedula}/generar-carnet` - Generar carnet
- GET `/api/jugadores/{cedula}/carnet-pdf` - Descargar PDF

## 🛠️ Tecnologías

### Backend
- Laravel 11
- PostgreSQL
- Sanctum (Autenticación)
- DomPDF (Generación de PDFs)
- QR Code Generator

### Frontend
- React 18
- React Router
- Lucide Icons
- HTML2Canvas
- jsPDF

## 📝 Licencia

MIT License

## 👥 Autores

Universidad Estatal de Bolívar
