<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Curso; // Asume que el modelo se llama Curso
use App\Models\Auditoria;
use Illuminate\Http\Request;

class CursoController extends Controller
{
    /**
     * Muestra una lista de todos los cursos.
     * Accesible por cualquier usuario autenticado que necesite ver los cursos disponibles.
     */
    public function index()
    {
        $cursos = Curso::orderBy('nombre', 'asc')->get();
        return response()->json($cursos);
    }

    /**
     * Crea un nuevo curso.
     * Restringido a roles de Administrador o Entrenador.
     */
    public function store(Request $request)
    {
        $userRol = $request->user()->rol;
        
        // Autorización: Solo Admin o Entrenador pueden crear cursos
        if ($userRol !== 'admin' && $userRol !== 'entrenador') {
            return response()->json([
                'message' => 'Acceso denegado. Solo administradores y entrenadores pueden crear cursos.'
            ], 403);
        }

        $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
            'costo' => 'required|numeric|min:0',
        ]);

        $curso = Curso::create($request->all());

        $this->logAudit(
            $request->user()->cedula,
            'CREAR',
            'Curso',
            $curso->id,
            'Creación de nuevo curso: ' . $curso->nombre
        );

        return response()->json([
            'message' => 'Curso creado exitosamente.',
            'curso' => $curso
        ], 201);
    }

    /**
     * Muestra un curso específico.
     */
    public function show($id)
    {
        $curso = Curso::find($id);

        if (!$curso) {
            return response()->json(['message' => 'Curso no encontrado.'], 404);
        }

        return response()->json($curso);
    }

    /**
     * Actualiza un curso existente.
     * Restringido a roles de Administrador o Entrenador.
     */
    public function update(Request $request, $id)
    {
        $userRol = $request->user()->rol;
        
        // Autorización: Solo Admin o Entrenador pueden actualizar cursos
        if ($userRol !== 'admin' && $userRol !== 'entrenador') {
            return response()->json([
                'message' => 'Acceso denegado. Solo administradores y entrenadores pueden actualizar cursos.'
            ], 403);
        }

        $curso = Curso::find($id);
        if (!$curso) {
            return response()->json(['message' => 'Curso no encontrado.'], 404);
        }
        
        $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
            'costo' => 'required|numeric|min:0',
        ]);

        $curso->update($request->all());

        $this->logAudit(
            $request->user()->cedula,
            'ACTUALIZAR',
            'Curso',
            $curso->id,
            'Actualización de curso: ' . $curso->nombre
        );

        return response()->json([
            'message' => 'Curso actualizado exitosamente.',
            'curso' => $curso
        ]);
    }

    /**
     * Elimina un curso.
     * Restringido solo a Administradores.
     */
    public function destroy(Request $request, $id)
    {
        if ($request->user()->rol !== 'admin') {
            return response()->json(['message' => 'Acceso denegado. Solo administradores pueden eliminar cursos.'], 403);
        }
        
        $curso = Curso::find($id);

        if (!$curso) {
            return response()->json(['message' => 'Curso no encontrado.'], 404);
        }

        $curso->delete();

        $this->logAudit(
            $request->user()->cedula,
            'ELIMINAR',
            'Curso',
            $curso->id,
            'Eliminación de curso: ' . $curso->nombre
        );
        
        return response()->json(['message' => 'Curso eliminado exitosamente.']);
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