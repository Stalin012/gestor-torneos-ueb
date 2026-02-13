<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Equipo;
use App\Models\Partido;
use App\Models\Jugador;
use Illuminate\Support\Facades\DB;

class EstadisticasRepresentanteController extends Controller
{
    public function show(Request $request, $equipo_id)
    {
        $user = $request->user();
        
        // Verificar que el equipo pertenece al representante
        $equipo = Equipo::where('id', $equipo_id)
            ->where('representante_cedula', $user->persona->cedula)
            ->firstOrFail();

        // 1. Balance de Partidos
        $partidos = Partido::where(function($q) use ($equipo_id) {
                $q->where('equipo_local_id', $equipo_id)
                  ->orWhere('equipo_visitante_id', $equipo_id);
            })
            ->where('estado', 'Finalizado')
            ->get();

        $ganados = 0;
        $empatados = 0;
        $perdidos = 0;
        $golesFavor = 0;
        $golesContra = 0;

        foreach ($partidos as $p) {
            $esLocal = $p->equipo_local_id == $equipo_id;
            $misfoles = $esLocal ? $p->marcador_local : $p->marcador_visitante;
            $susgoles = $esLocal ? $p->marcador_visitante : $p->marcador_local;

            $golesFavor += $misfoles;
            $golesContra += $susgoles;

            if ($misfoles > $susgoles) $ganados++;
            elseif ($misfoles < $susgoles) $perdidos++;
            else $empatados++;
        }

        // 2. Top Goleadores (usando tabla intermedia/modelo si existiera, o simulando desde Jugador)
        // Asumiendo que Jugador tiene una columna 'goles_torneo' o se calcula desde actas de partido
        // Por ahora tomaremos jugadores del equipo ordenados por goles (si existiera columna) o mock
        // Para hacerlo real, necesitaríamos una tabla de 'hechos_partido' o 'goles_jugador'.
        // Si no existe, devolveremos la lista de jugadores con 0 goles o mockeados.
        
        // REVISAR SI EXISTE MODELO DE GOLES. Si no, usaremos una columna en jugadores si existe.
        // Si no, devolvemos 0.
        
        $topGoleadores = Jugador::where('equipo_id', $equipo_id)
            ->with('persona')
            ->take(5)
            ->get()
            ->map(function($j) {
                return [
                    'nombre' => $j->persona->nombres . ' ' . $j->persona->apellidos,
                    'goles' => 0, // Placeholder si no hay tabla de goles detallada aun
                    'partidos' => 0
                ];
            });


        return response()->json([
            'ganados' => $ganados,
            'empatados' => $empatados,
            'perdidos' => $perdidos,
            'golesFavor' => $golesFavor,
            'golesContra' => $golesContra,
            'posicion' => 0, // Calcular según tabla de posiciones del torneo
            'promedioGoles' => $partidos->count() > 0 ? round($golesFavor / $partidos->count(), 2) : 0,
            'topGoleadores' => $topGoleadores
        ]);
    }
}
