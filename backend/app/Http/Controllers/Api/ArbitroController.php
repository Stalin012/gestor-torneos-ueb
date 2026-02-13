<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Arbitro;
use App\Models\Auditoria;
use App\Models\Persona;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ArbitroController extends Controller
{
    /**
     * GET /api/arbitros
     * Lista todos los árbitros con sus datos personales (solo admin).
     */
    public function index(Request $request)
    {
        try {
            $arbitros = Arbitro::with('persona')
                ->when($request->search, function ($query, $search) {
                    return $query->whereHas('persona', function ($q) use ($search) {
                        $q->where('nombres', 'like', "%{$search}%")
                          ->orWhere('apellidos', 'like', "%{$search}%");
                    });
                })
                ->paginate($request->per_page ?? 20);
            return response()->json($arbitros);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al obtener árbitros.'], 500);
        }
    }

    /**
     * POST /api/arbitros
     * Registrar una persona como árbitro (solo admin).
     */
    public function store(Request $request)
    {
        if ($request->user()->rol !== 'admin') {
            return response()->json(['message' => 'Solo un administrador puede registrar árbitros.'], 403);
        }

        $request->validate([
            'cedula'     => 'required|string|size:10|unique:arbitros,cedula',
            'nombres'    => 'required|string|max:100',
            'apellidos'  => 'required|string|max:100',
            'experiencia'=> 'required|integer|min:0',
        ]);

        try {
            DB::beginTransaction();

            $persona = Persona::firstWhere('cedula', $request->cedula);

            if (!$persona) {
                $persona = Persona::create($request->only('cedula', 'nombres', 'apellidos'));
            } else {
                $persona->update($request->only('nombres', 'apellidos'));
            }

            $arbitro = Arbitro::create([
                'cedula'      => $request->cedula,
                'experiencia' => $request->experiencia,
            ]);

            $this->logAudit(
                $request->user() ? $request->user()->cedula : 'SISTEMA',
                'CREAR',
                'Arbitro',
                (string)$arbitro->cedula,
                'Creación de nuevo árbitro con cédula: ' . $arbitro->cedula
            );

            DB::commit();

            return response()->json([
                'message' => 'Árbitro registrado exitosamente.',
                'arbitro' => $arbitro->load('persona'),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al registrar el árbitro.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * GET /api/arbitros/{cedula}
     * Mostrar un árbitro específico.
     */
    public function show($cedula)
    {
        $arbitro = Arbitro::with('persona')->where('cedula', $cedula)->first();

        if (!$arbitro) {
             return response()->json(['message' => 'Árbitro no encontrado.'], 404);
         }
 
         return response()->json($arbitro);
    }

    /**
     * PUT/PATCH /api/arbitros/{cedula}
     * Actualiza datos del árbitro (solo admin).
     */
    public function update(Request $request, $cedula)
    {
        if ($request->user()->rol !== 'admin') {
            return response()->json(['message' => 'Acceso denegado.'], 403);
        }

        $arbitro = Arbitro::where('cedula', $cedula)->first();
        if (!$arbitro) {
            return response()->json(['message' => 'Árbitro no encontrado.'], 404);
        }

        $request->validate([
            'nombres'     => 'required|string|max:100',
            'apellidos'   => 'required|string|max:100',
            'experiencia' => 'required|integer|min:0',
        ]);

        try {
            DB::beginTransaction();

            $persona = Persona::firstWhere('cedula', $cedula);
            if ($persona) {
                $persona->update($request->only('nombres', 'apellidos'));
            }

            $arbitro->update($request->only('experiencia'));

            $this->logAudit(
                $request->user() ? $request->user()->cedula : 'SISTEMA',
                'ACTUALIZAR',
                'Arbitro',
                (string)$arbitro->cedula,
                'Actualización de árbitro con cédula: ' . $arbitro->cedula
            );

            DB::commit();

            return response()->json([
                'message' => 'Árbitro actualizado exitosamente.',
                'arbitro' => $arbitro->load('persona'),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al actualizar el árbitro.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * DELETE /api/arbitros/{cedula}
     * Elimina el rol de árbitro pero conserva a la persona.
     */
    public function destroy(Request $request, $cedula)
    {
        if ($request->user()->rol !== 'admin') {
            return response()->json(['message' => 'Acceso denegado.'], 403);
        }

        $arbitro = Arbitro::where('cedula', $cedula)->first();

        if (!$arbitro) {
            return response()->json(['message' => 'Árbitro no encontrado.'], 404);
        }

        // Comprobar si tiene partidos asignados (si la relación existe en el modelo Arbitro)
        if (method_exists($arbitro, 'partidos') && $arbitro->partidos()->count() > 0) {
            return response()->json([
                'message' => 'No se puede eliminar el árbitro porque tiene partidos asociados.',
            ], 409);
        }

        $this->logAudit(
            $request->user() ? $request->user()->cedula : 'SISTEMA',
            'ELIMINAR',
            'Arbitro',
            (string)$arbitro->cedula,
            'Eliminación de rol de árbitro con cédula: ' . $arbitro->cedula
        );

        $arbitro->delete();

        return response()->json([
            'message' => 'Rol de árbitro eliminado exitosamente.',
        ]);
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
