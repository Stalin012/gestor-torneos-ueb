<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Authentication Defaults
    |--------------------------------------------------------------------------
    |
    | This option defines the default authentication "guard" and password
    | reset "broker" for your application. You may change these values
    | as required, but they're a perfect start for most applications.
    |
    */

    'defaults' => [
        'guard' => env('AUTH_GUARD', 'web'),
        'passwords' => env('AUTH_PASSWORD_BROKER', 'users'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Authentication Guards (Guardias de Autenticación)
    |--------------------------------------------------------------------------
    |
    | Define cada guardia de autenticación. El 'web' es para sesiones (cookies)
    | y el 'api' es para tokens (Sanctum/JWT).
    |
    */
    'guards' => [
        'web' => [
            'driver' => 'session',
            'provider' => 'users',
        ],

        'api' => [
            'driver' => 'sanctum',
            'provider' => 'users',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | User Providers (Proveedores de Usuarios)
    |--------------------------------------------------------------------------
    |
    | Define cómo se recuperan los usuarios de la base de datos.
    |
    */

    'providers' => [
        'users' => [
            'driver' => 'eloquent',
            // 🛑 CAMBIO CLAVE: Ahora apunta al modelo 'Usuario' personalizado
            'model' => App\Models\User::class, 
        ],
        // Si no tienes una tabla 'users', puedes eliminar el proveedor comentado
        // 'users' => [
        //     'driver' => 'database',
        //     'table' => 'users', 
        // ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Resetting Passwords
    |--------------------------------------------------------------------------
    |
    | Configuraciones para la funcionalidad de restablecimiento de contraseñas.
    |
    */

    'passwords' => [
        'users' => [
            'provider' => 'users',
            'table' => env('AUTH_PASSWORD_RESET_TOKEN_TABLE', 'password_reset_tokens'),
            'expire' => 60,
            'throttle' => 60,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Password Confirmation Timeout
    |--------------------------------------------------------------------------
    |
    | Tiempo de espera antes de que se solicite la reconfirmación de contraseña.
    |
    */

    'password_timeout' => env('AUTH_PASSWORD_TIMEOUT', 10800),

];