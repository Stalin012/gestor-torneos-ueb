<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$request = Illuminate\Http\Request::create('/api/equipos', 'GET');
$request->headers->set('Authorization', 'Bearer 1|tokeninventado');
try {
    $response = $kernel->handle($request);
    echo $response->getContent();
} catch (\Throwable $e) {
    echo "ERROR: \n";
    echo $e->getMessage() . "\n" . $e->getFile() . ':' . $e->getLine() . "\n";
    echo $e->getTraceAsString();
}
