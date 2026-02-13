<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Verificar si el usuario está autenticado
        if (! $request->user()) {
            return response()->json([
                'message' => 'No autenticado. Se requiere un token de acceso.',
            ], 401);
        }

        // 2. Verificar el Rol (Campo 'rol' del modelo Usuario)
        if ($request->user()->rol !== 'admin') {
            return response()->json([
                'message' => 'Acceso denegado. Se requiere rol de Administrador.',
            ], 403);
        }

        // 3. Si las verificaciones son exitosas, permitir el paso a la ruta
        return $next($request);
    }
}
