<?php
// Script de diagnóstico temporal - ELIMINAR EN PRODUCCIÓN
require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

header('Content-Type: application/json');

$results = [];

// Test 1: Equipo con relaciones
try {
    $equipos = App\Models\Equipo::with(['torneo', 'categoria', 'deporte'])->limit(3)->get();
    $results['equipos'] = ['status' => 'OK', 'count' => $equipos->count(), 'sample' => $equipos->first()?->toArray()];
} catch (\Throwable $e) {
    $results['equipos'] = ['status' => 'ERROR', 'message' => $e->getMessage(), 'file' => $e->getFile(), 'line' => $e->getLine()];
}

// Test 2: Arbitro con persona
try {
    $arbitros = App\Models\Arbitro::with('persona')->limit(3)->get();
    $results['arbitros'] = ['status' => 'OK', 'count' => $arbitros->count(), 'sample' => $arbitros->first()?->toArray()];
} catch (\Throwable $e) {
    $results['arbitros'] = ['status' => 'ERROR', 'message' => $e->getMessage(), 'file' => $e->getFile(), 'line' => $e->getLine()];
}

// Test 3: Jugador con persona y equipo
try {
    $jugadores = App\Models\Jugador::with(['persona', 'equipo'])->limit(3)->get();
    $results['jugadores'] = ['status' => 'OK', 'count' => $jugadores->count(), 'sample' => $jugadores->first()?->toArray()];
} catch (\Throwable $e) {
    $results['jugadores'] = ['status' => 'ERROR', 'message' => $e->getMessage(), 'file' => $e->getFile(), 'line' => $e->getLine()];
}

// Test 4: Auditoria insert
try {
    $check = App\Models\Auditoria::count();
    $results['auditoria'] = ['status' => 'OK', 'count' => $check];
} catch (\Throwable $e) {
    $results['auditoria'] = ['status' => 'ERROR', 'message' => $e->getMessage(), 'file' => $e->getFile(), 'line' => $e->getLine()];
}

// Test 5: Notificaciones table
try {
    \Illuminate\Support\Facades\Schema::hasTable('notificaciones');
    $check = \Illuminate\Support\Facades\DB::table('notificaciones')->count();
    $results['notificaciones_table'] = ['status' => 'OK', 'count' => $check];
} catch (\Throwable $e) {
    $results['notificaciones_table'] = ['status' => 'ERROR', 'message' => $e->getMessage()];
}

// Test 6: personal_access_tokens
try {
    $check = \Illuminate\Support\Facades\DB::table('personal_access_tokens')->count();
    $results['personal_access_tokens'] = ['status' => 'OK', 'count' => $check];
} catch (\Throwable $e) {
    $results['personal_access_tokens'] = ['status' => 'ERROR', 'message' => $e->getMessage()];
}

echo json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
