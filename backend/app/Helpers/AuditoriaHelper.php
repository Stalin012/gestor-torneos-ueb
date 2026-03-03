<?php

namespace App\Helpers;

use App\Models\Auditoria;
use Illuminate\Support\Facades\Auth;

class AuditoriaHelper
{
    /**
     * Registra una acción en la bitácora de auditoría.
     */
    public static function log(string $accion, string $entidad, ?string $entidadId, ?string $detalle): void
    {
        try {
            // Obtener cédula del usuario autenticado (si hay)
            $usuarioCedula = Auth::check() ? Auth::user()->cedula : 'SISTEMA';

            Auditoria::create([
                'timestamp'      => now(),
                'usuario_cedula' => $usuarioCedula,
                'accion'         => $accion,
                'entidad'        => $entidad,
                'entidad_id'     => (string)$entidadId,
                'detalle'        => $detalle,
            ]);
        } catch (\Throwable $e) {
            \Log::error('Falla al registrar auditoría en Helper: ' . $e->getMessage());
        }
    }
}
