<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Equipo;
use App\Models\Jugador;
use Illuminate\Validation\Rule;

class EquipoController extends Controller
{
    /**
     * Listar equipos (con torneo relacionado)
     */
    public function index()
    {
        $equipos = Equipo::with(['torneo', 'categoria', 'deporte'])
            ->orderBy('id', 'desc')
            ->paginate(15);

        return response()->json($equipos);
    }

    /**
     * Crear equipo
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre'     => 'required|string|max:255|unique:equipos,nombre',
            'logo'       => 'nullable|string|max:255', // CAMPO REAL DE BD
            'torneo_id'  => 'required|exists:torneos,id',
            'deporte_id' => 'required|exists:deportes,id',
            'categoria_id' => 'required|exists:categorias,id',
        ]);

        $equipo = Equipo::create($validated);

        return response()->json([
            'message' => 'Equipo creado exitosamente.',
            'data'    => $equipo
        ], 201);
    }

    /**
     * Mostrar un equipo con jugadores
     */
    public function show($id)
    {
        $equipo = Equipo::with(['torneo', 'jugadores.persona'])
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

        $validated = $request->validate([
            'nombre' => [
                'sometimes', 'string', 'max:255',
                Rule::unique('equipos', 'nombre')->ignore($equipo->id)
            ],
            'logo' => 'nullable|string|max:255',
            'torneo_id' => 'sometimes|exists:torneos,id',
            'deporte_id' => 'sometimes|exists:deportes,id',
            'categoria_id' => 'sometimes|exists:categorias,id',
        ]);

        $equipo->update($validated);

        return response()->json([
            'message' => 'Equipo actualizado exitosamente.',
            'data'    => $equipo
        ]);
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

        return response()->json(['message' => 'Equipo eliminado.']);
    }

    // ----------------------------------------------------------------------
    // GESTIÓN DE JUGADORES
    // ----------------------------------------------------------------------

    /**
     * Obtener jugadores del equipo
     */
    public function jugadores($id)
    {
        $equipo = Equipo::with('jugadores.persona')->find($id);

        if (!$equipo) {
            return response()->json(['message' => 'Equipo no encontrado'], 404);
        }

        return response()->json([
            'equipo'    => $equipo->nombre,
            'jugadores' => $equipo->jugadores,
        ]);
    }

    /**
     * Agregar jugador al equipo
     */
    public function agregarJugador(Request $request, $equipoId)
    {
        $request->validate([
            'cedula' => 'required|exists:jugadores,cedula', // PK real del jugador
        ]);

        $equipo = Equipo::find($equipoId);
        if (!$equipo) {
            return response()->json(['message' => 'Equipo no encontrado'], 404);
        }

        $jugador = Jugador::find($request->cedula);
        $jugador->equipo_id = $equipoId;
        $jugador->save();

        return response()->json([
            'message' => 'Jugador añadido al equipo.',
            'jugador' => $jugador->cedula,
            'equipo'  => $equipo->nombre
        ]);
    }

    /**
     * Quitar jugador del equipo
     */
    public function removerJugador($equipoId, $jugadorCedula)
    {
        $equipo = Equipo::find($equipoId);
        if (!$equipo) {
            return response()->json(['message' => 'Equipo no encontrado'], 404);
        }

        $jugador = Jugador::find($jugadorCedula);
        if (!$jugador) {
            return response()->json(['message' => 'Jugador no encontrado'], 404);
        }

        if ($jugador->equipo_id != $equipoId) {
            return response()->json(['message' => 'Este jugador no pertenece al equipo'], 400);
        }

        $jugador->equipo_id = null;
        $jugador->save();

        return response()->json(['message' => 'Jugador removido del equipo.']);
    }
}
