<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== Verificación de Fotos de Jugadores ===\n\n";

$jugadores = App\Models\Jugador::with('persona')->take(3)->get();

foreach ($jugadores as $jugador) {
    echo "Jugador: {$jugador->cedula}\n";
    echo "  Nombre: {$jugador->persona->nombres} {$jugador->persona->apellidos}\n";
    echo "  Foto (DB): " . ($jugador->persona->foto ?? 'NULL') . "\n";
    echo "  Foto URL: " . ($jugador->persona->foto_url ?? 'NULL') . "\n";
    
    if ($jugador->persona->foto) {
        $path = storage_path('app/public/' . $jugador->persona->foto);
        echo "  Archivo existe: " . (file_exists($path) ? 'SÍ' : 'NO') . "\n";
        if (file_exists($path)) {
            echo "  Tamaño: " . filesize($path) . " bytes\n";
        }
    }
    echo "\n";
}

echo "\n=== Verificación del enlace simbólico ===\n";
$publicStorage = public_path('storage');
echo "public/storage existe: " . (file_exists($publicStorage) ? 'SÍ' : 'NO') . "\n";
echo "Es enlace simbólico: " . (is_link($publicStorage) ? 'SÍ' : 'NO') . "\n";

if (is_link($publicStorage)) {
    echo "Apunta a: " . readlink($publicStorage) . "\n";
}

echo "\n=== Archivos en storage/app/public/fotos ===\n";
$fotosPath = storage_path('app/public/fotos');
if (is_dir($fotosPath)) {
    $files = scandir($fotosPath);
    foreach ($files as $file) {
        if ($file !== '.' && $file !== '..') {
            echo "  - $file (" . filesize($fotosPath . '/' . $file) . " bytes)\n";
        }
    }
} else {
    echo "  Directorio no existe\n";
}
