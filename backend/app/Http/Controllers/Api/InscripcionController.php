<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inscripcion;
use Illuminate\Support\Facades\Log;
use App\Models\Notificacion;
use App\Models\Auditoria;

class InscripcionController extends Controller
{
    // Eliminado el método privado logAudit ya que usaremos el helper del modelo


    /**
     * GET /api/inscripciones
     * Lista todas las inscripciones
     */
    public function index()
    {
        try {
            $inscripciones = Inscripcion::with([
                'torneo:id,nombre',
                'equipo:id,nombre,representante_cedula',
                'equipo.representante:cedula,nombres,apellidos'
            ])->get();

            return response()->json($inscripciones);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Error al obtener inscripciones.',
                'error'   => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine()
            ], 500);
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
            $validated = $request->validate([
                'equipo_id' => 'required|exists:equipos,id',
                'torneo_id' => 'required|exists:torneos,id',
                'estado'    => 'nullable|string|in:Pendiente,Aprobada,Rechazada',
            ]);

            $inscripcion = Inscripcion::create($validated);
            
            Auditoria::log('CREAR', 'Inscripcion', (string)$inscripcion->id, "Se registró una nueva inscripción para el equipo '{$inscripcion->equipo?->nombre}' en el torneo '{$inscripcion->torneo?->nombre}'.");

            return response()->json($inscripcion->load(['torneo', 'equipo']), 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => 'Error de validación', 'errors' => $e->errors()], 422);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Error al crear inscripción.', 'error' => $e->getMessage()], 500);
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
            
            $validated = $request->validate([
                'equipo_id' => 'sometimes|required|exists:equipos,id',
                'torneo_id' => 'sometimes|required|exists:torneos,id',
                'estado'    => 'sometimes|required|string|in:Pendiente,Aprobada,Rechazada',
            ]);

            $inscripcion->update($validated);

            Auditoria::log(
                'ACTUALIZAR',
                'Inscripcion',
                (string)$inscripcion->id,
                'Inscripción actualizada. Estado: ' . $inscripcion->estado
            );

            return response()->json($inscripcion->load(['torneo', 'equipo']));
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => 'Error de validación', 'errors' => $e->errors()], 422);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Error al actualizar inscripción.', 'error' => $e->getMessage()], 500);
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

            Auditoria::log(
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
                'error'   => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine()
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

            $equipoNombre = $inscripcion->equipo->nombre ?? 'N/A';
            $torneoNombre = $inscripcion->torneo->nombre ?? 'N/A';

            Auditoria::log('APROBAR', 'Inscripcion', (string)$inscripcion->id, "Inscripción aprobada para equipo '{$equipoNombre}' en '{$torneoNombre}'.");
            
            if ($inscripcion->equipo?->representante_cedula) {
                Notificacion::send(
                    $inscripcion->equipo->representante_cedula,
                    "Inscripción Aprobada",
                    "¡Buenas noticias! Tu solicitud para el equipo '{$equipoNombre}' en el torneo '{$torneoNombre}' ha sido aprobada.",
                    'success'
                );
            }

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

            $equipoNombre = $inscripcion->equipo->nombre ?? 'N/A';
            $torneoNombre = $inscripcion->torneo->nombre ?? 'N/A';

            Auditoria::log('RECHAZAR', 'Inscripcion', (string)$inscripcion->id, "Inscripción rechazada para equipo '{$equipoNombre}' en '{$torneoNombre}'.");

            if ($inscripcion->equipo?->representante_cedula) {
                Notificacion::send(
                    $inscripcion->equipo->representante_cedula,
                    "Inscripción Rechazada",
                    "Lo sentimos, la solicitud para el equipo '{$equipoNombre}' en el torneo '{$torneoNombre}' ha sido rechazada.",
                    'error'
                );
            }

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
