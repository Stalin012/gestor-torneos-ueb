<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

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

// Torneos públicos
Route::get('/torneos/publicos', [TorneoController::class, 'publicos']);
Route::get('/torneos/{torneoId}/tabla-posiciones', [TablaPosicionesController::class, 'show']);

// Noticias y galería
Route::get('/noticias', [NoticiaController::class, 'index']);
Route::get('/galeria',  [GaleriaController::class, 'index']);

// Carnet público
Route::get('/jugadores/{cedula}/carnet-pdf', [JugadorController::class, 'carnetPdf'])
    ->name('jugadores.carnet-pdf');
Route::get('/jugadores/{cedula}/info', [JugadorController::class, 'generarCarnet']);

// ========================================================================
// 2. RUTAS PROTEGIDAS (auth:sanctum)
// ========================================================================
Route::middleware('auth:sanctum')->group(function () {

    // ---------------- AUTH ----------------
    Route::get('/user',    [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // ---------------- TORNEOS ----------------
    Route::apiResource('torneos', TorneoController::class);
    Route::post('torneos/{id}/iniciar',   [TorneoController::class, 'iniciar']);
    Route::post('torneos/{id}/finalizar', [TorneoController::class, 'finalizar']);
    Route::get('torneos/{id}/equipos',    [TorneoController::class, 'equipos']);

    // ---------------- EQUIPOS ----------------
    Route::apiResource('equipos', EquipoController::class);
    Route::get('equipos/{id}/jugadores',                        [EquipoController::class, 'jugadores']);
    Route::post('equipos/{id}/agregar-jugador',                 [EquipoController::class, 'agregarJugador']);
    Route::delete('equipos/{equipoId}/jugador/{jugadorCedula}', [EquipoController::class, 'removerJugador']);

    // ---------------- JUGADORES ----------------
    Route::get('jugadores/{cedula}/estadisticas', [JugadorController::class, 'estadisticas']);
    Route::post('jugadores/{cedula}/generar-carnet', [JugadorController::class, 'generarCarnet'])
        ->name('jugadores.generar-carnet');
    Route::apiResource('jugadores', JugadorController::class);

    // ---------------- PARTIDOS ----------------
    Route::apiResource('partidos', PartidoController::class);
    Route::post('partidos/{id}/iniciar',            [PartidoController::class, 'iniciar']);
    Route::post('partidos/{id}/finalizar',          [PartidoController::class, 'finalizar']);
    Route::put('partidos/{id}/actualizar-marcador', [PartidoController::class, 'actualizarMarcador']);

    // ---------------- FIXTURE ----------------
    Route::get('fixtures/generar/{torneoId}', [FixtureController::class, 'generar']);

    // ---------------- AUDITORÍA ----------------
    Route::get('auditoria', [AuditoriaController::class, 'index']);

    // ---------------- CONFIGURACIÓN ----------------
    Route::get('configuracion',       [ConfiguracionController::class, 'index']);
    Route::put('configuracion',       [ConfiguracionController::class, 'update']);
    Route::post('configuracion/logo', [ConfiguracionController::class, 'uploadLogo']);

    // ---------------- ESTADÍSTICAS ----------------
    Route::get('estadisticas',                     [EstadisticaController::class, 'index']);
    Route::post('estadisticas',                    [EstadisticaController::class, 'store']);
    Route::put('estadisticas/{id}',                [EstadisticaController::class, 'update']);
    Route::delete('estadisticas/{id}',             [EstadisticaController::class, 'destroy']);
    Route::get('estadisticas/partido/{partidoId}', [EstadisticaController::class, 'porPartido']);
    Route::get('estadisticas/torneo/{torneoId}',   [EstadisticaController::class, 'porTorneo']);

    // ---------------- PERSONAS ----------------
    Route::apiResource('personas', PersonaController::class);

    // ====================================================================
    // 3. RUTAS ADMINISTRADOR (auth:sanctum + admin)
    // ====================================================================
    Route::middleware('admin')->group(function () {

        // Catálogos
        Route::apiResource('deportes', DeporteController::class)->except(['index']);
        Route::apiResource('categorias', CategoriaController::class)->except(['index', 'show']);

        Route::apiResource('arbitros', ArbitroController::class);

        // Contenido
        Route::apiResource('noticias', NoticiaController::class)->except(['index']);
        Route::apiResource('galeria',  GaleriaController::class)->except(['index']);

        // Usuarios
        Route::prefix('usuarios')->group(function () {
            Route::get('/',          [UsuarioController::class, 'index']);
            Route::get('/{cedula}',  [UsuarioController::class, 'show']);
            Route::post('/',         [UsuarioController::class, 'store']);
            Route::patch('/{cedula}',[UsuarioController::class, 'update']);
            Route::delete('/{cedula}',[UsuarioController::class, 'destroy']);
            Route::get('/verificar-persona/{cedula}', [UsuarioController::class, 'verificarPersona']);
        });

        // Dashboard
        Route::get('admin/dashboard', [AuthController::class, 'adminDashboard']);
        Route::get('admin/reportes',  [AuthController::class, 'reportes']);

        // -------- INSCRIPCIONES (SOLO ADMIN) --------
        Route::get('inscripciones/pendientes',             [InscripcionController::class, 'pendientes']);
        Route::post('inscripciones/{inscripcion}/aprobar', [InscripcionController::class, 'aprobar']);
        Route::post('inscripciones/{inscripcion}/rechazar',[InscripcionController::class, 'rechazar']);
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

        // Nómina
        Route::get('/equipo/jugadores/nomina', [RepresentanteEquipoController::class, 'nominaJugadores']);
        Route::get('/equipo/jugadores',        [RepresentanteEquipoController::class, 'listarJugadores']);
        Route::post('/equipo/jugadores',       [RepresentanteEquipoController::class, 'agregarJugador']);
        Route::delete('/equipo/jugadores/{cedula}', [RepresentanteEquipoController::class, 'removerJugador']);

        // Importar CSV
        Route::post('/equipo/jugadores/import', [RepresentanteEquipoController::class, 'importarNomina']);

        // Inscripciones del representante
        Route::get('/equipo/inscripciones', [RepresentanteEquipoController::class, 'inscripciones']);

        Route::get('/partidos', [RepresentanteEquipoController::class, 'partidos']);
        Route::put('/perfil',   [PerfilRepresentanteController::class, 'updatePerfil']);
        Route::put('/password', [PerfilRepresentanteController::class, 'updatePassword']);

        Route::post('/perfil/foto',  [PerfilRepresentanteController::class, 'updateFoto']);
    });

// ========================================================================
// 5. RUTAS ADICIONALES PROTEGIDAS (auth:sanctum)
// ========================================================================
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/jugador/perfil', [UserProfileController::class, 'show']);
    Route::get('/usuario/equipos-inscritos', [EquipoInscritoController::class, 'index']);
    Route::get('/carnet/info/{cedula}', [CarnetController::class, 'info']);
});
