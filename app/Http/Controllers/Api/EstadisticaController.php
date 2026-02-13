<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Estadistica;
use App\Models\Partido;
use Illuminate\Http\Request;

class EstadisticaController extends Controller
{
    /**
     * GET /api/estadisticas
     * Lista general (si la llegas a usar para auditoría/reportes).
     */
    public function index()
    {
        $estadisticas = Estadistica::with(['jugador.persona', 'partido'])
            ->orderBy('id', 'desc')
            ->paginate(20);

        return response()->json($estadisticas);
    }

    /**
     * POST /api/estadisticas
     * Registrar una nueva estadística para un jugador en un partido.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'partido_id'        => 'required|exists:partidos,id',
            'jugador_cedula'    => 'required|exists:jugadores,cedula',
            'goles'             => 'nullable|integer|min:0',
            'asistencias'       => 'nullable|integer|min:0',
            'tarjetas_amarillas'=> 'nullable|integer|min:0',
            'tarjetas_rojas'    => 'nullable|integer|min:0',
            'rebotes'           => 'nullable|integer|min:0',
            'bloqueos'          => 'nullable|integer|min:0',
        ]);

        // Como en la BD son NOT NULL con default 0, aseguramos 0 si no vienen
        $validated['goles']              = $validated['goles'] ?? 0;
        $validated['asistencias']        = $validated['asistencias'] ?? 0;
        $validated['tarjetas_amarillas'] = $validated['tarjetas_amarillas'] ?? 0;
        $validated['tarjetas_rojas']     = $validated['tarjetas_rojas'] ?? 0;
        $validated['rebotes']            = $validated['rebotes'] ?? 0;
        $validated['bloqueos']           = $validated['bloqueos'] ?? 0;

        // Ya no validamos estado del partido, porque en tu BD no hay campo "estado"
        $estadistica = Estadistica::create($validated);

        return response()->json([
            'message'     => 'Estadística registrada exitosamente',
            'estadistica' => $estadistica
        ], 201);
    }

    /**
     * GET /api/estadisticas/{id}
     */
    public function show($id)
    {
        $estadistica = Estadistica::with(['jugador.persona', 'partido'])
            ->find($id);

        if (!$estadistica) {
            return response()->json(['message' => 'Estadística no encontrada'], 404);
        }

        return response()->json($estadistica);
    }

    /**
     * PUT/PATCH /api/estadisticas/{id}
     * Actualizar una estadística (corrigir datos).
     */
    public function update(Request $request, $id)
    {
        $estadistica = Estadistica::find($id);

        if (!$estadistica) {
            return response()->json(['message' => 'Estadística no encontrada'], 404);
        }

        $validated = $request->validate([
            'partido_id'        => 'sometimes|exists:partidos,id',
            'jugador_cedula'    => 'sometimes|exists:jugadores,cedula',
            'goles'             => 'sometimes|integer|min:0',
            'asistencias'       => 'sometimes|integer|min:0',
            'tarjetas_amarillas'=> 'sometimes|integer|min:0',
            'tarjetas_rojas'    => 'sometimes|integer|min:0',
            'rebotes'           => 'sometimes|integer|min:0',
            'bloqueos'          => 'sometimes|integer|min:0',
        ]);

        $estadistica->update($validated);

        return response()->json([
            'message'     => 'Estadística actualizada exitosamente',
            'estadistica' => $estadistica
        ]);
    }

    /**
     * DELETE /api/estadisticas/{id}
     */
    public function destroy($id)
    {
        $estadistica = Estadistica::find($id);

        if (!$estadistica) {
            return response()->json(['message' => 'Estadística no encontrada'], 404);
        }

        $estadistica->delete();

        return response()->json([
            'message' => 'Estadística eliminada exitosamente'
        ]);
    }

    /**
     * GET /api/estadisticas/partido/{partidoId}
     * Ruta configurada en api.php como 'porPartido'
     */
    public function porPartido($partidoId)
    {
        $estadisticas = Estadistica::with(['jugador.persona'])
            ->where('partido_id', $partidoId)
            ->get();

        if ($estadisticas->isEmpty()) {
            return response()->json(['message' => 'No se encontraron estadísticas para este partido.', 'resumen' => []], 200);
        }

        // Resumen por jugador (agrupado por cédula)
        $resumenPorJugador = $estadisticas
            ->groupBy('jugador_cedula')
            ->map(function ($items) {
                $first   = $items->first();
                $jugador = $first->jugador;
                $persona = $jugador?->persona;

                return [
                    'jugador_cedula'     => $first->jugador_cedula,
                    'nombre_jugador'     => $persona ? ($persona->nombres . ' ' . $persona->apellidos) : 'Desconocido',
                    'goles'              => $items->sum('goles'),
                    'asistencias'        => $items->sum('asistencias'),
                    'tarjetas_amarillas' => $items->sum('tarjetas_amarillas'),
                    'tarjetas_rojas'     => $items->sum('tarjetas_rojas'),
                    'rebotes'            => $items->sum('rebotes'),
                    'bloqueos'           => $items->sum('bloqueos'),
                ];
            })
            ->values()
            ->sortByDesc('goles')
            ->values();

        return response()->json([
            'message' => 'Estadísticas agregadas por jugador para el partido.',
            'resumen' => $resumenPorJugador,
        ]);
    }

    /**
     * GET /api/estadisticas/torneo/{torneoId}
     * Estadísticas agregadas por jugador para todo el torneo (Goleadores).
     */
    public function porTorneo($torneoId)
    {
        $estadisticas = Estadistica::with(['jugador.persona', 'jugador.equipo'])
            ->whereHas('partido', function ($query) use ($torneoId) {
                $query->where('torneo_id', $torneoId);
            })
            ->get();

        if ($estadisticas->isEmpty()) {
            return response()->json([
                'message' => 'No hay estadísticas registradas para este torneo.',
                'resumen' => []
            ], 200);
        }

        $resumen = $estadisticas
            ->groupBy('jugador_cedula')
            ->map(function ($items) {
                $first   = $items->first();
                $jugador = $first->jugador;
                $persona = $jugador?->persona;
                $equipo  = $jugador?->equipo;

                return [
                    'jugador_cedula'     => $first->jugador_cedula,
                    'nombre_jugador'     => $persona ? ($persona->nombres . ' ' . $persona->apellidos) : 'Desconocido',
                    'equipo_nombre'      => $equipo ? $equipo->nombre : 'Sin equipo',
                    'equipo_logo'        => $equipo ? $equipo->logo : null,
                    'goles'              => $items->sum('goles'),
                    'asistencias'        => $items->sum('asistencias'),
                    'tarjetas_amarillas' => $items->sum('tarjetas_amarillas'),
                    'tarjetas_rojas'     => $items->sum('tarjetas_rojas'),
                    'rebotes'            => $items->sum('rebotes'),
                    'bloqueos'           => $items->sum('bloqueos'),
                    'pj'                 => $items->unique('partido_id')->count(), 
                ];
            })
            ->values()
            ->sortByDesc('goles')
            ->values();

        return response()->json([
            'resumen' => $resumen
        ]);
    }
}
