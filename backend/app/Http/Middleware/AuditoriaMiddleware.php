<?php

namespace App\Http\Middleware;

use App\Helpers\AuditoriaHelper;
use Closure;
use Illuminate\Http\Request;

class AuditoriaMiddleware
{
    /**
     * Registra automáticamente acciones en todas las rutas API.
     */
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        try {
            $path = $request->path();

            // Solo auditar lo que sea /api/*
            if (!str_starts_with($path, 'api/')) {
                return $response;
            }

            // Evitar que la propia consulta de auditoría se audite si quieres
            if ($path === 'api/auditoria') {
                return $response;
            }

            $method   = $request->method();
            $segments = $request->segments(); // ['api', 'torneos', '5', 'finalizar', ...]
            $entidad  = $segments[1] ?? 'Sistema';   // segundo segmento después de 'api'
            $entidadId = $segments[2] ?? null;

            $accion = match ($method) {
                'POST'   => 'Creación/Acción vía API',
                'PUT', 'PATCH' => 'Modificación vía API',
                'DELETE' => 'Eliminación vía API',
                'GET'    => 'Consulta vía API',
                default  => $method . ' vía API',
            };

            $detalle = sprintf(
                'Ruta: %s | Método: %s | Status: %s | IP: %s',
                $path,
                $method,
                $response->getStatusCode(),
                $request->ip()
            );

            AuditoriaHelper::log(
                $accion,
                ucfirst($entidad),
                $entidadId,
                $detalle
            );
        } catch (\Throwable $e) {
            \Log::warning('Error en AuditoriaMiddleware: ' . $e->getMessage());
        }

        return $response;
    }
}
