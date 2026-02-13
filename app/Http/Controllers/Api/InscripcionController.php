<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inscripcion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class InscripcionController extends Controller
{
    /**
     * GET /api/inscripciones/pendientes
     * Lista inscripciones pendientes con equipo, torneo e integrantes
     */
    public function pendientes()
    {
        try {
            $inscripciones = Inscripcion::with([
                    'torneo:id,nombre',
                    'equipo' => function ($q) {
                        $q->select('id', 'nombre', 'representante_cedula')
                          ->withCount('jugadores');
                    },
                ])
                ->where('estado', 'Pendiente')
                ->orderByDesc('created_at')
                ->get();

            return response()->json($inscripciones);
        } catch (\Throwable $e) {
            Log::error('Error en InscripcionController@pendientes', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Error al obtener inscripciones pendientes.',
            ], 500);
        }
    }

    /**
     * POST /api/inscripciones/{inscripcion}/aprobar
     * SOLO cambia el estado (el equipo ya existe)
     */
    public function aprobar(Inscripcion $inscripcion)
    {
        if ($inscripcion->estado !== 'Pendiente') {
            return response()->json([
                'message' => 'La inscripción ya fue procesada.',
            ], 400);
        }

        try {
            $inscripcion->update([
                'estado' => 'Aprobada',
            ]);

            return response()->json([
                'message'     => 'Inscripción aprobada correctamente.',
                'inscripcion' => $inscripcion->load([
                    'torneo:id,nombre',
                    'equipo:id,nombre,representante_cedula',
                ]),
            ]);
        } catch (\Throwable $e) {
            Log::error('Error en InscripcionController@aprobar', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Error al aprobar la inscripción.',
            ], 500);
        }
    }

    /**
     * POST /api/inscripciones/{inscripcion}/rechazar
     * SOLO cambia el estado
     */
    public function rechazar(Inscripcion $inscripcion)
    {
        if ($inscripcion->estado !== 'Pendiente') {
            return response()->json([
                'message' => 'La inscripción ya fue procesada.',
            ], 400);
        }

        try {
            $inscripcion->update([
                'estado' => 'Rechazada',
            ]);

            return response()->json([
                'message'     => 'Inscripción rechazada correctamente.',
                'inscripcion' => $inscripcion->load('torneo:id,nombre'),
            ]);
        } catch (\Throwable $e) {
            Log::error('Error en InscripcionController@rechazar', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Error al rechazar la inscripción.',
            ], 500);
        }
    }
}
