<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Torneo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use App\Models\Auditoria;

class TorneoController extends Controller 
{
    /**
     * GET /api/torneos
     * Listado general de torneos (admin).
     */
    public function index()
    {
        // Cargamos relaciones para que el frontend obtenga deporte y categoría
        $torneos = Torneo::with(['deporte', 'categoria'])->get();

        return response()->json($torneos);
    }

    /**
     * GET /api/torneos/publicos
     * Torneos públicos para combos, fixtures, etc.
     */
    public function publicos()
    {
        try {
            // Usamos solo columnas seguras que sabemos que existen
            $torneos = Torneo::select('id', 'nombre', 'estado')
                // Si quieres solo activos, descomenta:
                // ->where('estado', 'Activo')
                ->orderBy('nombre')
                ->get();

            return response()->json($torneos);
        } catch (\Throwable $e) {
            Log::error('Error en TorneoController@publicos', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Error al cargar torneos públicos',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * POST /api/torneos
     * Crear torneo.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'nombre'       => 'required|string|max:255',
            'deporte_id'   => 'required|exists:deportes,id',
            'categoria_id' => 'required|exists:categorias,id',
            'fecha_inicio' => 'nullable|date', 
            'fecha_fin'    => 'nullable|date|after_or_equal:fecha_inicio',
            'ubicacion'    => 'nullable|string|max:255',
            'descripcion'  => 'nullable|string',
            'estado'       => ['required', 'string', Rule::in(['Activo', 'Finalizado'])],
        ]);
        
        // Si usas creado_por y auth, aquí lo pones.
        // if (auth()->check()) {
        //     $validatedData['creado_por'] = auth()->user()->cedula;
        // }

        try {
            DB::beginTransaction();

            $torneo = Torneo::create($validatedData);
            
            DB::commit();
            $this->logAudit(
                $request->user() ? $request->user()->cedula : 'SISTEMA',
                'CREAR',
                'Torneo',
                (string)$torneo->id,
                "Torneo '{$torneo->nombre}' (ID: {$torneo->id}) creado."
            );

            return response()->json(
                $torneo->load(['deporte', 'categoria']),
                201
            );
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Error al crear el torneo',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * GET /api/torneos/{torneo}
     */
    public function show(Torneo $torneo)
    {
        return response()->json(
            $torneo->load(['deporte', 'categoria'])
        );
    }

    /**
     * PUT/PATCH /api/torneos/{torneo}
     * Actualizar torneo.
     */
    public function update(Request $request, Torneo $torneo)
    {
        $validatedData = $request->validate([
            'nombre'       => 'sometimes|required|string|max:255',
            'deporte_id'   => 'sometimes|required|exists:deportes,id',
            'categoria_id' => 'sometimes|required|exists:categorias,id',
            'fecha_inicio' => 'nullable|date',
            'fecha_fin'    => 'nullable|date|after_or_equal:fecha_inicio',
            'ubicacion'    => 'nullable|string|max:255',
            'descripcion'  => 'nullable|string',
            'estado'       => ['sometimes', 'required', 'string', Rule::in(['Activo', 'Finalizado'])],
        ]);

        try {
            DB::beginTransaction();

            $torneo->update($validatedData);

            DB::commit();
            $this->logAudit(
                $request->user() ? $request->user()->cedula : 'SISTEMA',
                'ACTUALIZAR',
                'Torneo',
                (string)$torneo->id,
                "Torneo '{$torneo->nombre}' (ID: {$torneo->id}) actualizado."
            );

            return response()->json(
                $torneo->load(['deporte', 'categoria']),
                200
            );
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Error al actualizar el torneo',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * DELETE /api/torneos/{torneo}
     */
    public function destroy(Request $request, Torneo $torneo)
    {
        try {
            $torneo->delete();
            $this->logAudit(
                $request->user() ? $request->user()->cedula : 'SISTEMA',
                'ELIMINAR',
                'Torneo',
                (string)$torneo->id,
                "Torneo '{$torneo->nombre}' (ID: {$torneo->id}) eliminado."
            );

            return response()->json([
                'message' => 'Torneo eliminado exitosamente.',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al eliminar el torneo',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * POST /api/torneos/{id}/iniciar
     */
    public function iniciar(Request $request, $id)
    {
        $torneo = Torneo::findOrFail($id);
        $torneo->update(['estado' => 'Activo']);
        $this->logAudit(
            $request->user() ? $request->user()->cedula : 'SISTEMA',
            'INICIAR',
            'Torneo',
            (string)$torneo->id,
            "Torneo '{$torneo->nombre}' (ID: {$torneo->id}) iniciado."
        );
        return response()->json([
            'message' => 'El torneo ha sido iniciado.',
            'torneo' => $torneo->load(['deporte', 'categoria'])
        ]);
    }

    /**
     * POST /api/torneos/{id}/finalizar
     */
    public function finalizar(Request $request, $id)
    {
        $torneo = Torneo::findOrFail($id);
        $torneo->update(['estado' => 'Finalizado']);
        $this->logAudit(
            $request->user() ? $request->user()->cedula : 'SISTEMA',
            'FINALIZAR',
            'Torneo',
            (string)$torneo->id,
            "Torneo '{$torneo->nombre}' (ID: {$torneo->id}) finalizado."
        );
        return response()->json([
            'message' => 'El torneo ha finalizado.',
            'torneo' => $torneo->load(['deporte', 'categoria'])
        ]);
    }

    /**
     * Obtener equipos inscritos en un torneo
     */
    public function equipos($id)
    {
        $torneo = Torneo::findOrFail($id);

        // Usar el modelo Inscripcion para obtener equipos inscritos
        $equipos = \App\Models\Inscripcion::with(['equipo:id,nombre,logo'])
            ->where('torneo_id', $id)
            ->where('estado', 'Aprobada') // Solo equipos aprobados
            ->get()
            ->pluck('equipo')
            ->filter()
            ->unique('id')
            ->values();

        return response()->json($equipos);
    }

    /**
     * Registra una acción de auditoría.
     */
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
}
