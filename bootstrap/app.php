<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\AdminMiddleware; 
use App\Http\Middleware\RepresentanteMiddleware; // 👈 IMPORTANTE

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        apiPrefix: 'api',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // 👉 Aquí se registran aliases de middleware en Laravel 11
        $middleware->alias([
            'admin' => AdminMiddleware::class,
            'representante' => RepresentanteMiddleware::class,
        ]);

        // Si quieres, aquí también podrías alias otros middleware personalizados
        // $middleware->alias('otro', \App\Http\Middleware\OtroMiddleware::class);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })
    ->create();
