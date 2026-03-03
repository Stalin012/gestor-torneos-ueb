<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    echo "Testing Torneo load with relations...\n";
    $t = App\Models\Torneo::with(['deporte', 'categoria'])->first();
    echo "Torneo: " . ($t ? ($t->nombre . " (Dep: " . $t->deporte->nombre . ", Cat: " . $t->categoria->nombre . ")") : "NULL") . "\n";
    
    echo "\nTesting Equipo load with relations...\n";
    $e = App\Models\Equipo::with(['torneo', 'categoria', 'deporte'])->first();
    echo "Equipo: " . ($e ? ($e->nombre . " (Tor: " . $e->torneo->nombre . ")") : "NULL") . "\n";

    echo "\nTesting Inscripcion load with relations...\n";
    $i = App\Models\Inscripcion::with(['torneo', 'equipo'])->first();
    echo "Inscripcion: " . ($i ? ("ID: " . $i->id) : "NULL") . "\n";

} catch (\Exception $e) {
    echo "Falla en carga: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . " Line: " . $e->getLine() . "\n";
}
