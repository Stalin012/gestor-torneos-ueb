<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== Actualización de foto para jugador de prueba ===\n\n";

// Buscar el jugador que tiene la foto
$persona = App\Models\Persona::where('cedula', '0102345678')->first();

if ($persona) {
    echo "Persona encontrada: {$persona->nombres} {$persona->apellidos}\n";
    echo "Foto actual: " . ($persona->foto ?? 'NULL') . "\n\n";
    
    // Actualizar con la ruta correcta
    $persona->foto = 'fotos/capitan-deportivo-cuenca-1770298535.jpg';
    $persona->save();
    
    echo "Foto actualizada a: {$persona->foto}\n";
    echo "Foto URL: {$persona->foto_url}\n";
    
    // Verificar que el archivo existe
    $filePath = storage_path('app/public/' . $persona->foto);
    echo "Archivo existe: " . (file_exists($filePath) ? 'SÍ' : 'NO') . "\n";
    
    if (file_exists($filePath)) {
        echo "Tamaño: " . filesize($filePath) . " bytes\n";
    }
} else {
    echo "Persona no encontrada. Creando persona de prueba...\n";
    
    $persona = App\Models\Persona::create([
        'cedula' => '0102345678',
        'nombres' => 'Capitán Deportivo',
        'apellidos' => 'Cuenca',
        'foto' => 'fotos/capitan-deportivo-cuenca-1770298535.jpg'
    ]);
    
    echo "Persona creada: {$persona->nombres} {$persona->apellidos}\n";
    echo "Foto: {$persona->foto}\n";
    echo "Foto URL: {$persona->foto_url}\n";
}

echo "\n=== Verificando todos los jugadores ===\n";
$jugadores = App\Models\Jugador::with('persona')->get();
foreach ($jugadores as $j) {
    echo "\nJugador: {$j->cedula}\n";
    echo "  Nombre: {$j->persona->nombres} {$j->persona->apellidos}\n";
    echo "  Foto: " . ($j->persona->foto ?? 'NULL') . "\n";
    echo "  Foto URL: " . ($j->persona->foto_url ?? 'NULL') . "\n";
}
