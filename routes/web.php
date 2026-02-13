<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('app'); // Carga React
});

Route::get('/react', function () {
    return view('app'); // Alternativa

});

Route::view('/{any}', 'app')->where('any', '^(?!api).*$');
// Ruta para validar carnet mediante QR
Route::get('/carnet/validar/{token}', [App\Http\Controllers\Api\CarnetController::class, 'validar'])
    ->name('carnet.validar');
