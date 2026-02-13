<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inscripcion;
use App\Models\Auditoria;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class InscripcionController extends Controller
{
    private function logAudit(string $usuarioCedula, string $accion, string $entidad, string $entidadId, string $detalle): void
    {
        Auditoria::create([
            'timestamp'      => now(),
            'usuario_cedula' => $usuarioCedula,
            'accion'         => $accion,
            'entidad'        => $entidad,
            'entidad_id'     => $entidadId,
            'detalle'        => $detalle,
        ]);
    }

    /**
     * GET /api/inscripciones
     * Lista todas las inscripciones
     */
    public function index()
    {
        try {
            $inscripciones = Inscripcion::with([
                'torneo:id,nombre',
                'equipo:id,nombre,representante_cedula'
            ])->get();

            return response()->json($inscripciones);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Error al obtener inscripciones.'], 500);
        }
    }

    /**
     * GET /api/inscripciones/{id}
     * Muestra una inscripción específica
     */
    public function show($id)
    {
        try {
            $inscripcion = Inscripcion::with([
                'torneo:id,nombre',
                'equipo:id,nombre,representante_cedula'
            ])->findOrFail($id);

            return response()->json($inscripcion);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Inscripción no encontrada.'], 404);
        }
    }

    /**
     * POST /api/inscripciones
     * Crea una nueva inscripción
     */
    public function store(Request $request)
    {
        try {
            $inscripcion = Inscripcion::create($request->all());
            
            $this->logAudit(
                $request->user() ? $request->user()->cedula : 'SISTEMA',
                'CREAR',
                'Inscripcion',
                (string)$inscripcion->id,
                'Nueva inscripción creada para el equipo ID: ' . $inscripcion->equipo_id
            );

            return response()->json($inscripcion->load(['torneo', 'equipo']), 201);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Error al crear inscripción.'], 500);
        }
    }

    /**
     * PUT /api/inscripciones/{id}
     * Actualiza una inscripción
     */
    public function update(Request $request, $id)
    {
        try {
            $inscripcion = Inscripcion::findOrFail($id);
            $inscripcion->update($request->all());

            $this->logAudit(
                $request->user() ? $request->user()->cedula : 'SISTEMA',
                'ACTUALIZAR',
                'Inscripcion',
                (string)$inscripcion->id,
                'Inscripción actualizada. Estado anterior: ' . $inscripcion->getOriginal('estado')
            );

            return response()->json($inscripcion->load(['torneo', 'equipo']));
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Error al actualizar inscripción.'], 500);
        }
    }

    /**
     * DELETE /api/inscripciones/{id}
     * Elimina una inscripción
     */
    public function destroy(Request $request, $id)
    {
        try {
            $inscripcion = Inscripcion::findOrFail($id);
            $inscripcion->delete();

            $this->logAudit(
                $request->user() ? $request->user()->cedula : 'SISTEMA',
                'ELIMINAR',
                'Inscripcion',
                (string)$id,
                'Inscripción eliminada para el equipo: ' . ($inscripcion->equipo->nombre ?? 'N/A')
            );

            return response()->json(['message' => 'Inscripción eliminada correctamente.']);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Error al eliminar inscripción.'], 500);
        }
    }

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
                          ->with(['representante' => function($sq) {
                              $sq->select('cedula', 'nombres', 'apellidos');
                          }])
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
    public function aprobar(Request $request, Inscripcion $inscripcion)
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

            $this->logAudit(
                $request->user() ? $request->user()->cedula : 'SISTEMA',
                'APROBAR',
                'Inscripcion',
                (string)$inscripcion->id,
                'Inscripción aprobada para el equipo: ' . ($inscripcion->equipo->nombre ?? 'N/A') . ' en el torneo: ' . ($inscripcion->torneo->nombre ?? 'N/A')
            );

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
    public function rechazar(Request $request, Inscripcion $inscripcion)
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

            $this->logAudit(
                $request->user() ? $request->user()->cedula : 'SISTEMA',
                'RECHAZAR',
                'Inscripcion',
                (string)$inscripcion->id,
                'Inscripción rechazada para el equipo: ' . ($inscripcion->equipo->nombre ?? 'N/A') . ' en el torneo: ' . ($inscripcion->torneo->nombre ?? 'N/A')
            );

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
