<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$request = Illuminate\Http\Request::create('/api/torneos', 'POST', [
    'nombre' => 'Copa de Prueba '.rand(1, 100),
    'deporte_id' => '1',
    'categoria_id' => '',
    'estado' => 'Activo'
]);
$request->headers->set('Accept', 'application/json');
try {
    $response = $kernel->handle($request);
    echo $response->getContent();
} catch (\Throwable $e) {
    echo "ERROR: " . $e->getMessage();
}
