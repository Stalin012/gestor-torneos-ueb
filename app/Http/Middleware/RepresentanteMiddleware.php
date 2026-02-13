<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RepresentanteMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'No autenticado.'], 401);
        }

        $rol = strtolower((string) ($user->rol ?? ''));

        if ($rol !== 'representante' && $rol !== 'admin') {
            return response()->json([
                'message' => 'Acceso denegado. Se requiere rol de Representante o Administrador.',
                'tu_rol' => $rol
            ], 403);
        }

        return $next($request);
    }
}
