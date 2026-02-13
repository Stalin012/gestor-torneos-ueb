<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Categoria;
use App\Models\Auditoria;
use App\Models\Torneo;
use Illuminate\Http\Request;

class CategoriaController extends Controller
{
    /**
     * GET /api/categorias
     * Lista todas las categorías (ruta pública).
     */
    public function index()
    {
        $categorias = Categoria::with('deporte')->orderBy('nombre', 'asc')->get();
        return response()->json($categorias);
    }

    /**
     * POST /api/categorias
     * Crear categoría (solo admin).
     */
    public function store(Request $request)
    {
        // Seguridad adicional (middleware admin ya lo controla)
        if ($request->user()->rol !== 'admin') {
            return response()->json(['message' => 'Acceso denegado.'], 403);
        }

        $validated = $request->validate([
            'nombre' => 'required|string|max:100|unique:categorias,nombre',
            'descripcion' => 'nullable|string',
            'deporte_id' => 'nullable|exists:deportes,id',
        ]);

        $categoria = Categoria::create($validated);

        $this->logAudit(
            $request->user()->cedula,
            'CREAR',
            'Categoria',
            $categoria->id,
            'Creación de nueva categoría: ' . $categoria->nombre
        );

        return response()->json([
            'message' => 'Categoría creada exitosamente.',
            'categoria' => $categoria,
        ], 201);
    }

    /**
     * GET /api/categorias/{id}
     * Mostrar categoría específica (pública).
     */
    public function show($id)
    {
        $categoria = Categoria::find($id);

        if (!$categoria) {
            return response()->json(['message' => 'Categoría no encontrada.'], 404);
        }

        return response()->json($categoria);
    }

    /**
     * PUT/PATCH /api/categorias/{id}
     * Actualizar categoría (solo admin).
     */
    public function update(Request $request, $id)
    {
        if ($request->user()->rol !== 'admin') {
            return response()->json(['message' => 'Acceso denegado.'], 403);
        }

        $categoria = Categoria::find($id);
        if (!$categoria) {
            return response()->json(['message' => 'Categoría no encontrada.'], 404);
        }

        $validated = $request->validate([
            'nombre' => 'required|string|max:100|unique:categorias,nombre,' . $id,
            'descripcion' => 'nullable|string',
            'deporte_id' => 'nullable|exists:deportes,id',
        ]);

        $categoria->update($validated);

        $this->logAudit(
            $request->user()->cedula,
            'ACTUALIZAR',
            'Categoria',
            $categoria->id,
            'Actualización de categoría: ' . $categoria->nombre
        );

        return response()->json([
            'message' => 'Categoría actualizada exitosamente.',
            'categoria' => $categoria,
        ]);
    }

    /**
     * DELETE /api/categorias/{id}
     * Eliminar categoría (solo admin).
     */
    public function destroy(Request $request, $id)
    {
        if ($request->user()->rol !== 'admin') {
            return response()->json(['message' => 'Acceso denegado.'], 403);
        }

        $categoria = Categoria::find($id);

        if (!$categoria) {
            return response()->json(['message' => 'Categoría no encontrada.'], 404);
        }

        // Evitar eliminar categorías usadas por torneos
        $torneosUsandoCategoria = Torneo::where('categoria_id', $id)->count();

        if ($torneosUsandoCategoria > 0) {
            return response()->json([
                'message' => 'No se puede eliminar la categoría porque tiene torneos asociados.',
                'torneos_asociados' => $torneosUsandoCategoria
            ], 409);
        }

        $categoria->delete();

        $this->logAudit(
            $request->user()->cedula,
            'ELIMINAR',
            'Categoria',
            $categoria->id,
            'Eliminación de categoría: ' . $categoria->nombre
        );

        return response()->json(['message' => 'Categoría eliminada exitosamente.']);
    }

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
