<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Deporte;
use App\Models\Torneo;
use Illuminate\Http\Request;

class DeporteController extends Controller
{
    /**
     * GET /api/deportes
     * Lista todos los deportes (ruta pública).
     */
    public function index()
    {
        $deportes = Deporte::orderBy('nombre', 'asc')->get();
        return response()->json($deportes);
    }

    /**
     * POST /api/deportes
     * Crear un nuevo deporte (solo admin y representante).
     * Esta ruta debe estar dentro del middleware 'admin' en api.php.
     */
    public function store(Request $request)
    {
        // Seguridad extra, además del middleware admin
        if ($request->user()->rol !== 'admin, representante') {
            return response()->json(['message' => 'Acceso denegado.'], 403);
        }

        $validated = $request->validate([
            'nombre'      => 'required|string|max:100|unique:deportes,nombre',
            'descripcion' => 'nullable|string',
        ]);

        $deporte = Deporte::create($validated);

        return response()->json([
            'message' => 'Deporte creado exitosamente.',
            'deporte' => $deporte,
        ], 201);
    }

    /**
     * GET /api/deportes/{id}
     * Mostrar un deporte específico (público).
     */
    public function show($id)
    {
        $deporte = Deporte::find($id);

        if (!$deporte) {
            return response()->json(['message' => 'Deporte no encontrado.'], 404);
        }

        return response()->json($deporte);
    }

    /**
     * PUT/PATCH /api/deportes/{id}
     * Actualizar un deporte (solo admin).
     */
    public function update(Request $request, $id)
    {
        if ($request->user()->rol !== 'admin') {
            return response()->json(['message' => 'Acceso denegado.'], 403);
        }

        $deporte = Deporte::find($id);
        if (!$deporte) {
            return response()->json(['message' => 'Deporte no encontrado.'], 404);
        }

        $validated = $request->validate([
            'nombre'      => 'required|string|max:100|unique:deportes,nombre,' . $id,
            'descripcion' => 'nullable|string',
        ]);

        $deporte->update($validated);

        return response()->json([
            'message' => 'Deporte actualizado exitosamente.',
            'deporte' => $deporte,
        ]);
    }

    /**
     * DELETE /api/deportes/{id}
     * Eliminar un deporte (solo admin).
     */
    public function destroy(Request $request, $id)
    {
        if ($request->user()->rol !== 'admin') {
            return response()->json(['message' => 'Acceso denegado.'], 403);
        }

        $deporte = Deporte::find($id);
        if (!$deporte) {
            return response()->json(['message' => 'Deporte no encontrado.'], 404);
        }

        // Verificar si hay torneos usando este deporte
        $torneosAsociados = Torneo::where('deporte_id', $id)->count();

        if ($torneosAsociados > 0) {
            return response()->json([
                'message'            => 'No se puede eliminar el deporte porque tiene torneos asociados.',
                'torneos_asociados'  => $torneosAsociados,
            ], 409);
        }

        $deporte->delete();

        return response()->json(['message' => 'Deporte eliminado exitosamente.']);
    }
}
