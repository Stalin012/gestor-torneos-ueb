# Manual Técnico y del Administrador - UEB SPORT

## 1. Introducción al Sistema
UEB SPORT es una plataforma integral para la gestión de torneos deportivos universitarios. La arquitectura combina un robusto backend desarrollado en Laravel (PHP) con una interfaz frontend reactiva construida en React. El sistema utiliza una base de datos relacional para garantizar la integridad de los datos de torneos, estadísticas y auditoría.

---

## 2. Gestión Estratégica y Configuración Inicial

### 2.1 Configuración de Identidad Visual
El Administrador tiene la potestad de ajustar la marca blanca del sistema para que se alinee con las directrices de la Universidad.
- **Logo del Sistema:** Acceda a "Configuración > General" para cargar el escudo oficial de la institución. Se recomienda el uso de archivos `.png` con fondo transparente para las versiones de escritorio y dispositivos móviles.
- **Nombre del Sistema:** Defina el título principal que aparecerá en la página de inicio, correos electrónicos y encabezados de reportes.
- **Variables de Entorno:** Para personalizaciones profundas, el administrador técnico debe verificar el archivo `.env` del backend y el frontend para configurar las URLs de API y Storage correspondientes.

### 2.2 Gestión de Catálogos Maestros
Antes de lanzar cualquier torneo, es obligatorio poblar los catálogos base:
1.  **Disciplinas (Deportes):** Registre cada deporte (Fútbol, Baloncesto, Vóley, Tenis de Mesa, etc.). Cada deporte puede tener asignado un icono y un color temático que se reflejará en la interfaz pública.
2.  **Categorías:** Configure niveles de competencia como "Interfacultades", " Administrativos", "Docentes", "Libre" o por género (Masculino, Femenino, Mixto).
3.  **Ubicaciones:** Registre los escenarios deportivos (Coliseo Universitario, Canchas Centrales, Estadio Municipal, etc.) para facilitar la programación de encuentros.

---

## 3. Administración del Ciclo de Vida de los Torneos

### 3.1 Planificación y Creación
Para crear un nuevo campeonato:
1.  Vaya al módulo **"Torneos"**.
2.  Haga clic en **"Nuevo Torneo"**.
3.  Defina los parámetros:
    - **Modalidad:** Liga (todos contra todos), Eliminación Directa (Brackets) o Fase de Grupos + Playoffs.
    - **Fechas:** Establezca el rango de inscripción y el rango de competencia.
    - **Descripción:** Redacte las bases del torneo, premios y reglamentos.

### 3.2 Gestión de Inscripciones (El Embudo de Calidad)
Como administrador, usted es el filtro de seguridad:
- **Revisión de Solicitudes:** Reciba solicitudes de los Representantes de Clubes.
- **Verificación de Nóminas:** Asegure que cada equipo tenga el mínimo de jugadores requeridos y que cada jugador tenga su foto de perfil y cédula actualizada.
- **Acción de Resolución:** Marque como "Aprobado" para autorizar la participación o "Observado/Rechazado" con un comentario aclaratorio para el representante.

### 3.3 Generación y Gestión de Calendarios
- **Generación Automática:** El sistema puede cruzar los equipos aprobados y generar un calendario optimizado evitando choques de horarios o sedes.
- **Edición Manual:** Usted puede reprogramar fechas u horarios específicos en caso de imprevistos climatológicos o institucionales.
- **Asignación de Jueces:** Designe al menos un Árbitro principal para cada encuentro. Solo los árbitros designados tendrán permiso para modificar el acta del partido.

---

## 4. Usuarios, Roles y Seguridad

### 4.1 Gestión de Usuarios
A diferencia de los jugadores que se auto-registran, los perfiles con poder administrativo deben ser creados o elevados por un administrador superior:
- **Administrador:** Acceso total.
- **Secretaría/Asistente:** Acceso a inscripciones y gestión de datos, pero sin permisos de configuración global o auditoría.
- **Árbitro:** Acceso limitado a la gestión de sus partidos asignados.

### 4.2 El Módulo de Auditoría (Trazabilidad Total)
El sistema implementa un log de auditoría inmutable:
- **Rastreo de Cambios:** Visualice qué usuario modificó un marcador, quién eliminó un jugador o quién cambió la configuración del sistema.
- **Seguridad Forense:** En caso de discrepancias en los resultados, la auditoría permite ver el valor anterior y el valor nuevo de cada campo en la base de datos.
- **Filtrado Avanzado:** Busque por rango de fechas, ID de usuario o tipo de acción (CREATE, UPDATE, DELETE).

---

## 5. Reportes y Estadísticas Consolidadas
El administrador tiene acceso a reportes exportables:
- **Tablas de Posiciones Consolidadas:** Verificación de gualdad de puntos y criterios de desempate.
- **Listados de Goleadores (Pichichi):** Ranking de desempeño individual en todos los torneos activos.
- **Reporte de Disciplina:** Listado de jugadores con tarjetas acumuladas o suspensiones pendientes.

---

## 6. Mantenimiento y Soporte Técnico
- **Copia de Seguridad:** Se recomienda realizar respaldos semanales de la base de datos a través de los scripts proporcionados en el servidor.
- **Gestión de Archivos (Storage):** Supervise el uso de disco de las fotos de los jugadores y escudos de equipos. El sistema optimiza imágenes automáticamente, pero una limpieza anual es sugerida.
- **Logs de Servidor:** Para errores inesperados (Error 500), revise la carpeta `storage/logs` dentro del backend de Laravel.
