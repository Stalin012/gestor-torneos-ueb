<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines which domains are allowed to access your
    | application's resources from a different domain. You may enable
    | CORS for all origins and all HTTP methods.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'representante/*', 'arbitro/*', 'admin/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'https://gx2lf4t9.brs.devtunnels.ms:5173',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://192.168.100.24:5173',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
