<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

Route::get('/debug-db', [\App\Http\Controllers\Api\DebugController::class, 'inspectTables']);
Route::get('/fix-storage', [\App\Http\Controllers\Api\DebugController::class, 'inspectAndFixStorage']);
Route::get('/fix-sequences', [\App\Http\Controllers\Api\DebugController::class, 'fixSequences']);

Route::get('/', function () {
    return response()->json(['message' => 'API is running']);
});

// ===== RUTA PÚBLICA PARA SERVIR ARCHIVOS DE STORAGE =====
Route::get('/files/{path}', function ($path) {
    // Limpiar el path de caracteres extraños que puedan venir del encoding
    $path = ltrim(urldecode($path), '/');
    
    if (!Storage::disk('public')->exists($path)) {
        // Enviar un 404 pequeño sin cuerpo HTML para evitar CORB
        return response('', 404)->header('Content-Type', 'image/jpeg');
    }
    
    $file = Storage::disk('public')->get($path);
    $mime = Storage::disk('public')->mimeType($path);
    
    return response($file, 200)
        ->header('Content-Type', $mime)
        ->header('Cache-Control', 'public, max-age=86400');
})->where('path', '.*');


// =======================
// Controladores API
// =======================
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\InscripcionController;
use App\Http\Controllers\Api\TorneoController;
use App\Http\Controllers\Api\EquipoController;
use App\Http\Controllers\Api\JugadorController;
use App\Http\Controllers\Api\PartidoController;
use App\Http\Controllers\Api\EstadisticaController;
use App\Http\Controllers\Api\DeporteController;
use App\Http\Controllers\Api\CategoriaController;
use App\Http\Controllers\Api\ArbitroController;
use App\Http\Controllers\Api\NoticiaController;
use App\Http\Controllers\Api\GaleriaController;
use App\Http\Controllers\Api\TablaPosicionesController;
use App\Http\Controllers\Api\UsuarioController;
use App\Http\Controllers\Api\FixtureController;
use App\Http\Controllers\Api\AuditoriaController;
use App\Http\Controllers\Api\ConfiguracionController;
use App\Http\Controllers\Api\PersonaController;
use App\Http\Controllers\Api\RepresentanteEquipoController;
use App\Http\Controllers\Api\CarnetController;
use App\Http\Controllers\Api\EquipoInscritoController;
use App\Http\Controllers\Api\PerfilRepresentanteController;
use App\Http\Controllers\Api\UserProfileController;

// ========================================================================
// 1. RUTAS PÚBLICAS Y AUTENTICACIÓN
// ========================================================================
Route::post('/login',    [AuthController::class, 'login'])->name('api.login');
Route::post('/register', [AuthController::class, 'register']);

// Catálogos públicos
Route::get('/deportes',   [DeporteController::class, 'index']);
Route::get('/categorias', [CategoriaController::class, 'index']);
Route::get('/carreras', function() { return response()->json([]); });

// Torneos públicos
Route::get('/torneos/publicos', [TorneoController::class, 'publicos']);
Route::get('/torneos', [TorneoController::class, 'index']); // Hacer pública la lista de torneos
Route::get('/torneos/{id}', [TorneoController::class, 'show']); // Hacer público el detalle de torneo
Route::get('/torneos/{torneoId}/tabla-posiciones', [TablaPosicionesController::class, 'show']);

// Equipos públicos
Route::get('/equipos', [EquipoController::class, 'index']);
Route::get('/equipos/{id}', [EquipoController::class, 'show']);

// Partidos públicos
Route::get('/partidos', [PartidoController::class, 'index']);
Route::get('/partidos/{id}', [PartidoController::class, 'show']);

// Jugadores públicos
Route::get('/jugadores', [JugadorController::class, 'index']);
Route::get('/jugadores/{cedula}', [JugadorController::class, 'show']);

// Inscripciones públicas
Route::get('/inscripciones/pendientes', [InscripcionController::class, 'pendientes']);
Route::get('/inscripciones', [InscripcionController::class, 'index']);
Route::get('/inscripciones/{id}', [InscripcionController::class, 'show']);

// Árbitros públicos
Route::get('/arbitros', [ArbitroController::class, 'index']);
Route::get('/arbitros/{cedula}', [ArbitroController::class, 'show']);

// Personas públicas (Solo lectura)
Route::get('/personas', [PersonaController::class, 'index']);
Route::get('/personas/{cedula}', [PersonaController::class, 'show']);

// Configuración pública
Route::get('/configuracion', [ConfiguracionController::class, 'index']);


// Estadísticas públicas
Route::get('/estadisticas', [EstadisticaController::class, 'index']);
Route::get('/estadisticas/partido/{partidoId}', [EstadisticaController::class, 'porPartido']);
Route::get('/estadisticas/torneo/{torneoId}', [EstadisticaController::class, 'porTorneo']);

// Fixture público (Cambiado a POST y movido a Admin)


use App\Http\Controllers\Api\NotificacionController;

// Noticias y galería
Route::get('/noticias', [NoticiaController::class, 'index']);
Route::get('/noticias/{id}', [NoticiaController::class, 'show']);
Route::get('/galeria',  [GaleriaController::class, 'index']);

// Notificaciones
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/notificaciones', [NotificacionController::class, 'index']);
    Route::post('/notificaciones', [NotificacionController::class, 'store']);
    // Usar POST en vez de PATCH para evitar problemas con servidores compartidos
    Route::post('/notificaciones/read-all', [NotificacionController::class, 'markAllAsRead']);
    Route::match(['patch', 'post'], '/notificaciones/{id}/read', [NotificacionController::class, 'markAsRead']);
});

// Ruta de diagnóstico temporal para notificaciones (ELIMINAR después de debug)
Route::middleware(['auth:sanctum'])->get('/notificaciones/debug', function (Request $request) {
    try {
        $cedula = $request->user()->cedula;
        $columns = DB::select("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'notificaciones' ORDER BY ordinal_position");
        $count = DB::table('notificaciones')->count();
        $sample = DB::table('notificaciones')->limit(2)->get();
        
        // Intentar actualizar una  
        $testId = $sample->first()?->id;
        $updateResult = null;
        if ($testId) {
            try {
                $updateResult = DB::table('notificaciones')->where('id', $testId)->update(['leida' => true, 'updated_at' => now()]);
            } catch (\Exception $ue) {
                $updateResult = 'ERROR: ' . $ue->getMessage();
            }
        }

        return response()->json([
            'user_cedula' => $cedula,
            'table_exists' => true,
            'columns' => $columns,
            'total_rows' => $count,
            'sample' => $sample,
            'test_update_id' => $testId,
            'test_update_result' => $updateResult,
        ]);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()], 500);
    }
});

// Configuración pública
Route::get('/configuracion/publica', [ConfiguracionController::class, 'publicIndex']);

// Carnet público
Route::get('/jugadores/{cedula}/carnet-pdf', [JugadorController::class, 'carnetPdf'])->name('jugadores.carnet-pdf')->where('cedula', '[0-9]+');
Route::get('/jugadores/{cedula}/info', [JugadorController::class, 'generarCarnet'])->where('cedula', '[0-9]+');

Route::get('/usuarios/{cedula}/carnet-pdf', [UsuarioController::class, 'carnetPdf'])->name('usuarios.public.carnet-pdf')->where('cedula', '[0-9]+');
Route::get('/usuarios/{cedula}/info', [UsuarioController::class, 'generarCarnet'])->where('cedula', '[0-9]+');

// ------------------------------------------------------------------------
// 2. RUTAS PROTEGIDAS (Bearer Token Sanctum)
// ------------------------------------------------------------------------
Route::middleware(['auth:sanctum'])->group(function () {

    // ---------------- AUTH ----------------
    Route::get('/user',    [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // ---------------- PERFIL DE ÁRBITRO ----------------
    Route::prefix('arbitro/perfil')->group(function () {
        Route::put('/',         [App\Http\Controllers\Api\PerfilArbitroController::class, 'updatePerfil']);
        Route::put('/password', [App\Http\Controllers\Api\PerfilArbitroController::class, 'updatePassword']);
        Route::post('/foto',    [App\Http\Controllers\Api\PerfilArbitroController::class, 'updateFoto']);
    });

    // ---------------- TORNEOS ----------------
    Route::post('torneos', [TorneoController::class, 'store']);
    Route::put('torneos/{id}', [TorneoController::class, 'update']);
    Route::delete('torneos/{id}', [TorneoController::class, 'destroy']);
    Route::post('torneos/{id}/iniciar',   [TorneoController::class, 'iniciar']);
    Route::post('torneos/{id}/finalizar', [TorneoController::class, 'finalizar']);
    Route::get('torneos/{id}/equipos',    [TorneoController::class, 'equipos']);

    // ---------------- EQUIPOS ----------------
    Route::post('equipos', [EquipoController::class, 'store']);
    Route::put('equipos/{id}', [EquipoController::class, 'update']);
    Route::delete('equipos/{id}', [EquipoController::class, 'destroy']);
    Route::get('equipos/{id}/jugadores',                        [EquipoController::class, 'jugadores']);
    Route::post('equipos/{id}/agregar-jugador',                 [EquipoController::class, 'agregarJugador']);
    Route::delete('equipos/{equipoId}/jugador/{jugadorCedula}', [EquipoController::class, 'removerJugador']);

    // ---------------- JUGADORES ----------------
    Route::post('jugadores', [JugadorController::class, 'store']);
    Route::match(['put', 'patch', 'post'], 'jugadores/{cedula}', [JugadorController::class, 'update']);
    Route::delete('jugadores/{cedula}', [JugadorController::class, 'destroy']);
    Route::get('jugadores/{cedula}/estadisticas', [JugadorController::class, 'estadisticas']);
    Route::post('jugadores/{cedula}/generar-carnet', [JugadorController::class, 'generarCarnet'])
        ->name('jugadores.generar-carnet');

    // ---------------- PARTIDOS ----------------
    Route::post('partidos', [PartidoController::class, 'store']);
    Route::put('partidos/{id}', [PartidoController::class, 'update']);
    Route::delete('partidos/{id}', [PartidoController::class, 'destroy']);
    Route::post('partidos/{id}/iniciar',            [PartidoController::class, 'iniciar']);
    Route::post('partidos/{id}/finalizar',          [PartidoController::class, 'finalizar']);
    Route::put('partidos/{id}/actualizar-marcador', [PartidoController::class, 'actualizarMarcador']);

    // ---------------- FIXTURE ----------------
    // Ya es pública

    // ---------------- AUDITORÍA ----------------
    // Ya es pública

    // ---------------- CONFIGURACIÓN ----------------
    Route::put('configuracion',       [ConfiguracionController::class, 'update']);
    Route::post('configuracion/logo', [ConfiguracionController::class, 'uploadLogo']);

    // ---------------- ESTADÍSTICAS ----------------
    Route::post('estadisticas',                    [EstadisticaController::class, 'store']);
    Route::put('estadisticas/{id}',                [EstadisticaController::class, 'update']);
    Route::delete('estadisticas/{id}',             [EstadisticaController::class, 'destroy']);

    // ---------------- PERSONAS (Acciones Protegidas) ----------------
    Route::post('personas', [PersonaController::class, 'store']);
    Route::match(['put', 'patch', 'post'], 'personas/{cedula}', [PersonaController::class, 'update']);
    Route::delete('personas/{cedula}', [PersonaController::class, 'destroy']);

    // ====================================================================
    // 3. RUTAS ADMINISTRADOR (auth:sanctum + admin)
    // ====================================================================
    Route::middleware('admin')->group(function () {

        // Catálogos
        Route::post('deportes', [DeporteController::class, 'store']);
        Route::put('deportes/{id}', [DeporteController::class, 'update']);
        Route::delete('deportes/{id}', [DeporteController::class, 'destroy']);
        Route::post('categorias', [CategoriaController::class, 'store']);
        Route::put('categorias/{id}', [CategoriaController::class, 'update']);
        Route::delete('categorias/{id}', [CategoriaController::class, 'destroy']);

        Route::post('arbitros', [ArbitroController::class, 'store']);
        Route::put('arbitros/{cedula}', [ArbitroController::class, 'update']);
        Route::delete('arbitros/{cedula}', [ArbitroController::class, 'destroy']);

        // Contenido
        Route::post('noticias', [NoticiaController::class, 'store']);
        Route::match(['put', 'patch', 'post'], 'noticias/{id}', [NoticiaController::class, 'update']);
        Route::delete('noticias/{id}', [NoticiaController::class, 'destroy']);
        Route::post('galeria', [GaleriaController::class, 'store']);
        Route::match(['put', 'patch', 'post'], 'galeria/{id}', [GaleriaController::class, 'update']);
        Route::delete('galeria/{id}', [GaleriaController::class, 'destroy']);

        // Auditoría
        Route::get('auditoria', [AuditoriaController::class, 'index']);

        // Usuarios del sistema (gestión completa)
        Route::get('usuarios', [UsuarioController::class, 'index']);
        Route::get('usuarios/verificar-persona/{cedula}', [UsuarioController::class, 'verificarPersona']);
        Route::get('usuarios/{cedula}', [UsuarioController::class, 'show'])->where('cedula', '[0-9]+');
        Route::post('usuarios', [UsuarioController::class, 'store']);
        Route::patch('usuarios/{cedula}', [UsuarioController::class, 'update'])->where('cedula', '[0-9]+');
        Route::delete('usuarios/{cedula}', [UsuarioController::class, 'destroy'])->where('cedula', '[0-9]+');


        // Dashboard
        Route::get('admin/dashboard', [AuthController::class, 'adminDashboard']);
        Route::get('admin/reportes',  [AuthController::class, 'reportes']);

        // -------- INSCRIPCIONES (SOLO ADMIN) --------
        Route::post('inscripciones', [InscripcionController::class, 'store']);
        Route::put('inscripciones/{id}', [InscripcionController::class, 'update']);
        Route::delete('inscripciones/{id}', [InscripcionController::class, 'destroy']);
        Route::post('inscripciones/{inscripcion}/aprobar', [InscripcionController::class, 'aprobar']);
        Route::post('inscripciones/{inscripcion}/rechazar',[InscripcionController::class, 'rechazar']);

        // -------- FIXTURE (ADMIN) --------
        Route::post('fixtures/generar/{torneoId}', [FixtureController::class, 'generar']);
    });

});

// ========================================================================
// 4. RUTAS REPRESENTANTE (auth:sanctum + representante)
// ========================================================================
Route::middleware(['auth:sanctum', 'representante'])
    ->prefix('representante')
    ->group(function () {

        // Equipos del representante
        Route::get('/equipos',        [RepresentanteEquipoController::class, 'index']);
        Route::post('/equipos',       [RepresentanteEquipoController::class, 'store']);
        Route::get('/equipos/{id}',   [RepresentanteEquipoController::class, 'show']);
        Route::put('/equipos/{id}',   [RepresentanteEquipoController::class, 'update']);
        Route::delete('/equipos/{id}',[RepresentanteEquipoController::class, 'destroy']);
        Route::get('/equipos/{id}/jugadores', [RepresentanteEquipoController::class, 'jugadoresEquipo']);

        // Nómina
        Route::get('/equipo/jugadores/nomina', [RepresentanteEquipoController::class, 'nominaJugadores']);
        Route::get('/equipo/jugadores',        [RepresentanteEquipoController::class, 'listarJugadores']);
        Route::post('/equipo/jugadores',       [RepresentanteEquipoController::class, 'agregarJugador']);
        Route::delete('/equipo/jugadores/{cedula}', [RepresentanteEquipoController::class, 'removerJugador']);

        // Importar CSV
        Route::post('/equipo/jugadores/import', [RepresentanteEquipoController::class, 'importarNomina']);

        // Inscripciones del representante
        Route::get('/equipo/inscripciones', [RepresentanteEquipoController::class, 'inscripciones']);
        Route::post('/inscripcion', [RepresentanteEquipoController::class, 'solicitarInscripcion']);

        Route::get('/equipos/{id}/estadisticas', [\App\Http\Controllers\Api\EstadisticasRepresentanteController::class, 'show']);
        Route::get('/partidos', [\App\Http\Controllers\Api\PartidosRepresentanteController::class, 'index']);
        Route::put('/perfil',   [\App\Http\Controllers\Api\PerfilRepresentanteController::class, 'updatePerfil']);
        Route::put('/password', [\App\Http\Controllers\Api\PerfilRepresentanteController::class, 'updatePassword']);

        Route::post('/perfil/foto',  [\App\Http\Controllers\Api\PerfilRepresentanteController::class, 'updateFoto']);
    });

// ========================================================================
// 5. RUTAS ADICIONALES PROTEGIDAS (auth:sanctum)
// ========================================================================
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/jugador/perfil', [UserProfileController::class, 'show']);
    Route::post('/jugador/perfil/foto', [UserProfileController::class, 'updateFoto']);
    Route::get('/usuario/equipos-inscritos', [EquipoInscritoController::class, 'index']);
    Route::get('/carnet/info/{cedula}', [CarnetController::class, 'info']);
});
