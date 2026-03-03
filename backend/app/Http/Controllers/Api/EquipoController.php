<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Equipo;
use App\Models\Auditoria;
use App\Models\Jugador;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class EquipoController extends Controller
{
    /**
     * Listar equipos (con torneo relacionado)
     */
    public function index()
    {
        try {
            $equipos = Equipo::with(['torneo', 'categoria', 'deporte'])
                ->orderBy('id', 'desc')
                ->paginate(15);

            return response()->json($equipos);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Error al cargar equipos (API Index)',
                'error'   => $e->getMessage(),
                'file'    => $e->getFile(),
                'line'    => $e->getLine(),
            ], 500);
        }
    }

    /**
     * Crear equipo
     */
    /**
     * Crear equipo
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'nombre'     => 'required|string|max:255|unique:equipos,nombre',
                'logo'       => 'nullable|string|max:255', 
                'torneo_id'  => 'required|exists:torneos,id',
                'deporte_id' => 'required|exists:deportes,id',
                'categoria_id' => 'required|exists:categorias,id',
                'representante_cedula' => 'nullable|exists:personas,cedula',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => 'Error de validación', 'errors' => $e->errors()], 422);
        }

        try {
            DB::beginTransaction();
            $equipo = Equipo::create($validated);
            DB::commit();

            $this->logAudit(
                $request->user() ? $request->user()->cedula : 'SISTEMA',
                'CREAR',
                'Equipo',
                (string)$equipo->id,
                'Creación de nuevo equipo: ' . $equipo->nombre
            );

            return response()->json([
                'message' => 'Equipo creado exitosamente.',
                'data'    => $equipo->load(['torneo', 'categoria', 'deporte'])
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al crear equipo', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Mostrar un equipo con jugadores
     */
    public function show($id)
    {
        $equipo = Equipo::with(['torneo', 'jugadores.persona', 'categoria', 'deporte'])
            ->find($id);

        if (!$equipo) {
            return response()->json(['message' => 'Equipo no encontrado'], 404);
        }

        return response()->json($equipo);
    }

    /**
     * Actualizar equipo
     */
    public function update(Request $request, $id)
    {
        $equipo = Equipo::find($id);

        if (!$equipo) {
            return response()->json(['message' => 'Equipo no encontrado'], 404);
        }

        try {
            $validated = $request->validate([
                'nombre' => [
                    'sometimes', 'required', 'string', 'max:255',
                    Rule::unique('equipos', 'nombre')->ignore($equipo->id)
                ],
                'logo' => 'nullable|string|max:255',
                'torneo_id' => 'sometimes|required|exists:torneos,id',
                'deporte_id' => 'sometimes|required|exists:deportes,id',
                'categoria_id' => 'sometimes|required|exists:categorias,id',
                'representante_cedula' => 'nullable|exists:personas,cedula',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => 'Error de validación', 'errors' => $e->errors()], 422);
        }

        try {
            DB::beginTransaction();
            $equipo->update($validated);
            DB::commit();

            $this->logAudit(
                $request->user() ? $request->user()->cedula : 'SISTEMA',
                'ACTUALIZAR',
                'Equipo',
                (string)$equipo->id,
                'Actualización de equipo: ' . $equipo->nombre
            );

            return response()->json([
                'message' => 'Equipo actualizado exitosamente.',
                'data'    => $equipo->load(['torneo', 'categoria', 'deporte'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al actualizar equipo', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Eliminar equipo
     */
    public function destroy($id)
    {
        $equipo = Equipo::find($id);

        if (!$equipo) {
            return response()->json(['message' => 'Equipo no encontrado'], 404);
        }

        // Desvincular jugadores de este equipo
        Jugador::where('equipo_id', $id)->update(['equipo_id' => null]);

        $equipo->delete();

        $this->logAudit(
            request()->user() ? request()->user()->cedula : 'SISTEMA',
            'ELIMINAR',
            'Equipo',
            (string)$equipo->id,
            'Eliminación de equipo: ' . $equipo->nombre
        );

        return response()->json(['message' => 'Equipo eliminado.']);
    }

    // ----------------------------------------------------------------------
    // GESTIÓN DE JUGADORES
    // ----------------------------------------------------------------------

    /**
     * Obtener jugadores del equipo
     */
    public function jugadores(Request $request, $id)
    {
        $equipo = Equipo::find($id);

        if (!$equipo) {
            return response()->json(['message' => 'Equipo no encontrado'], 404);
        }

        $perPage = $request->get('per_page', 10); // Default to 10 items per page
        $jugadores = $equipo->jugadores()->with('persona')->paginate($perPage);

        return response()->json([
            'equipo'    => $equipo->nombre,
            'jugadores' => $jugadores,
        ]);
    }

    /**
     * Agregar jugador al equipo
     */
    public function agregarJugador(Request $request, $equipoId)
    {
        try {
            $validated = $request->validate([
                'cedula' => 'required|exists:jugadores,cedula',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'El deportista no está registrado en el sistema o la identificación es incorrecta.',
                'errors'  => $e->errors()
            ], 422);
        }

        try {
            $equipo = Equipo::find($equipoId);
            if (!$equipo) {
                return response()->json(['message' => 'Equipo no encontrado'], 404);
            }

            $jugador = Jugador::find($validated['cedula']);
            
            // Verificar si ya pertenece al equipo
            if ($jugador->equipo_id == $equipoId) {
                return response()->json(['message' => 'El deportista ya forma parte de este colectivo.'], 422);
            }

            $jugador->equipo_id = $equipoId;
            $jugador->save();

            $this->logAudit(
                $request->user() ? $request->user()->cedula : 'SISTEMA',
                'ACTUALIZAR',
                'Equipo',
                (string)$equipoId,
                'Jugador ' . $jugador->cedula . ' agregado al equipo ' . $equipo->nombre
            );

            return response()->json([
                'message' => 'Deportista vinculado exitosamente.',
                'jugador' => $jugador->cedula,
                'equipo'  => $equipo->nombre
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al vincular el deportista.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Quitar jugador del equipo
     */
    public function removerJugador($equipoId, $jugadorCedula)
    {
        try {
            $equipo = Equipo::find($equipoId);
            if (!$equipo) {
                return response()->json(['message' => 'Equipo no encontrado'], 404);
            }

            $jugador = Jugador::find($jugadorCedula);
            if (!$jugador) {
                return response()->json(['message' => 'Deportista no encontrado'], 404);
            }

            if ($jugador->equipo_id != $equipoId) {
                return response()->json(['message' => 'El deportista no pertenece a este colectivo'], 400);
            }

            $jugador->equipo_id = null;
            $jugador->save();

            $this->logAudit(
                request()->user() ? request()->user()->cedula : 'SISTEMA',
                'ACTUALIZAR',
                'Equipo',
                (string)$equipoId,
                'Jugador ' . $jugador->cedula . ' removido del equipo ' . $equipo->nombre
            );

            return response()->json(['message' => 'Vínculo comercial finalizado correctamente.']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al desvincular al deportista.', 'error' => $e->getMessage()], 500);
        }
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
