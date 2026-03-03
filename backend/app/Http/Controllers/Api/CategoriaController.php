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
    public function index(Request $request)
    {
        try {
            $query = Categoria::with('deporte')->orderBy('nombre', 'asc');

            if ($request->has('deporte_id')) {
                $query->where('deporte_id', $request->deporte_id);
            }

            $categorias = $query->get();
            return response()->json($categorias);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Error al cargar categorías (API Index)',
                'error'   => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
            ], 500);
        }
    }

    /**
     * POST /api/categorias
     * Crear categoría (solo admin).
     */
    public function store(Request $request)
    {
        // Seguridad adicional
        if (!$request->user() || !in_array($request->user()->rol, ['admin', 'representante'])) {
            return response()->json(['message' => 'Acceso denegado.'], 403);
        }

        try {
            $validated = $request->validate([
                'nombre' => 'required|string|max:100',
                'descripcion' => 'nullable|string',
                'deporte_id' => 'nullable|exists:deportes,id',
            ]);

            $categoria = Categoria::updateOrCreate(
                ['nombre' => $validated['nombre']],
                [
                    'descripcion' => $validated['descripcion'] ?? null,
                    'deporte_id'  => $validated['deporte_id'] ?? null
                ]
            );

            $this->logAudit(
                $request->user() ? $request->user()->cedula : 'SISTEMA',
                'CREAR',
                'Categoria',
                (string)$categoria->id,
                'Creación de nueva categoría: ' . $categoria->nombre
            );

            return response()->json([
                'message' => 'Categoría creada exitosamente.',
                'categoria' => $categoria->load('deporte'),
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => 'Error de validación', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al crear categoría', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * GET /api/categorias/{id}
     * Mostrar categoría específica (pública).
     */
    public function show($id)
    {
        $categoria = Categoria::with('deporte')->find($id);

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
        if (!$request->user() || !in_array($request->user()->rol, ['admin', 'representante'])) {
            return response()->json(['message' => 'Acceso denegado.'], 403);
        }

        $categoria = Categoria::find($id);
        if (!$categoria) {
            return response()->json(['message' => 'Categoría no encontrada.'], 404);
        }

        try {
            $validated = $request->validate([
                'nombre' => 'sometimes|required|string|max:100',
                'descripcion' => 'nullable|string',
                'deporte_id' => 'nullable|exists:deportes,id',
            ]);

            $categoria->update($validated);

            $this->logAudit(
                $request->user() ? $request->user()->cedula : 'SISTEMA',
                'ACTUALIZAR',
                'Categoria',
                (string)$categoria->id,
                'Actualización de categoría: ' . $categoria->nombre
            );

            return response()->json([
                'message' => 'Categoría actualizada exitosamente.',
                'categoria' => $categoria->load('deporte'),
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => 'Error de validación', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al actualizar categoría', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * DELETE /api/categorias/{id}
     * Eliminar categoría (solo admin).
     */
    public function destroy(Request $request, $id)
    {
        if (!$request->user() || !in_array($request->user()->rol, ['admin', 'representante'])) {
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
            $request->user() ? $request->user()->cedula : 'SISTEMA',
            'ELIMINAR',
            'Categoria',
            (string)$categoria->id,
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
