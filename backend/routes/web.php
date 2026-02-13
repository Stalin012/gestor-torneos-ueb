<?php

use Illuminate\Support\Facades\Route;

// Sanctum routes
Route::middleware(['web'])->group(function () {
    Route::get('/sanctum/csrf-cookie', [\Laravel\Sanctum\Http\Controllers\CsrfCookieController::class, 'show']);
});

// Ruta raíz para backend - devuelve info de la API
Route::get('/', function () {
    return response()->json([
        'message' => 'UEB Sports Management API',
        'version' => '1.0.0',
        'status' => 'running',
        'endpoints' => [
            'api/torneos/publicos' => 'Torneos públicos',
            'api/noticias' => 'Noticias',
            'api/galeria' => 'Galería',
            'api/login' => 'Autenticación',
        ]
    ]);
});

// Ruta para validar carnet mediante QR
Route::get('/carnet/validar/{token}', [App\Http\Controllers\Api\CarnetController::class, 'validar'])
    ->name('carnet.validar');
