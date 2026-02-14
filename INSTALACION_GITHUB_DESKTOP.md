# 📥 Guía de Instalación con GitHub Desktop

## 🚀 Para Colaboradores - Cómo Clonar el Proyecto

### 1. Descargar GitHub Desktop
- Ve a: https://desktop.github.com/
- Descarga e instala GitHub Desktop
- Inicia sesión con tu cuenta de GitHub

### 2. Clonar el Repositorio
1. Abre GitHub Desktop
2. Haz clic en **"Clone a repository from the Internet"**
3. En la pestaña **"GitHub.com"**, busca: `gestor-torneos-ueb`
4. Selecciona la carpeta donde quieres guardar el proyecto
5. Haz clic en **"Clone"**

### 3. Configuración del Proyecto

#### Backend (Laravel)
```bash
cd gestor/backend
composer install
cp .env.example .env
php artisan key:generate
```

#### Base de Datos
1. Crea una base de datos PostgreSQL llamada `gestor_torneos`
2. Edita `backend/.env`:
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=gestor_torneos
DB_USERNAME=postgres
DB_PASSWORD=tu_password
```

3. Ejecuta las migraciones:
```bash
php artisan migrate:fresh --seed
```

#### Frontend (React)
```bash
cd gestor/frontend
npm install
cp .env.example .env
```

Edita `frontend/.env`:
```env
VITE_API_URL=http://127.0.0.1:8000/api
```

### 4. Ejecutar el Proyecto

#### Opción 1: Script Automático
```bash
# Desde la raíz del proyecto
./start-project.bat
```

#### Opción 2: Manual
**Terminal 1 - Backend:**
```bash
cd backend
php artisan serve
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Acceder al Sistema
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000

### 6. Credenciales de Prueba
| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@ueb.edu.ec | password |
| Representante | luis@ueb.edu.ec | password |
| Árbitro | bethy@ueb.edu.ec | password |
| Usuario | winston@ueb.edu.ec | password |

## 🔄 Trabajar con Cambios

### Obtener Últimos Cambios
1. En GitHub Desktop, haz clic en **"Fetch origin"**
2. Si hay cambios, haz clic en **"Pull origin"**

### Hacer Cambios
1. Realiza tus modificaciones en el código
2. En GitHub Desktop verás los archivos modificados
3. Escribe un mensaje descriptivo del commit
4. Haz clic en **"Commit to main"**
5. Haz clic en **"Push origin"** para subir los cambios

### Crear Ramas (Recomendado)
1. En GitHub Desktop, haz clic en **"Current branch"**
2. Haz clic en **"New branch"**
3. Nombra tu rama: `feature/nueva-funcionalidad`
4. Realiza tus cambios y commits
5. Haz clic en **"Create Pull Request"** cuando termines

## ⚠️ Requisitos del Sistema
- **PHP** >= 8.1
- **Composer** >= 2.0
- **Node.js** >= 18.0
- **PostgreSQL** >= 14.0
- **npm** >= 9.0

## 🆘 Problemas Comunes

### Error de Composer
```bash
composer install --ignore-platform-reqs
```

### Error de npm
```bash
npm install --legacy-peer-deps
```

### Error de Base de Datos
- Verifica que PostgreSQL esté ejecutándose
- Confirma las credenciales en `.env`
- Ejecuta: `php artisan migrate:fresh --seed`

### Error de CORS
- Verifica que `VITE_API_URL` esté correcto en `frontend/.env`
- Reinicia ambos servidores

## 📞 Soporte
Si tienes problemas:
1. Revisa esta guía
2. Consulta el archivo `PROYECTO_COMPLETO.md`
3. Crea un issue en GitHub
4. Contacta al equipo de desarrollo