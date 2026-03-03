<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines which cross-origin requests may execute
    | code across web domains. You are free to adjust these settings.
    |
    | Please check the documentation for more information:
    | https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['*'],

    'allowed_methods' => ['*'], // Permite todos los métodos HTTP (GET, POST, PUT, DELETE, OPTIONS, etc.)

    'allowed_origins' => [],


    'allowed_origins_patterns' => [
        '/^https?:\/\/(.*)deportesueb\.com$/',
    ],


    'allowed_headers' => ['*'], // Permite todas las cabeceras HTTP

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true, // MUY IMPORTANTE: Permite el envío de cookies y cabeceras de autorización con solicitudes CORS. Necesario para Laravel Sanctum.

];
