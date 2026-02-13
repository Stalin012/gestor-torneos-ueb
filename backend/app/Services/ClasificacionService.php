<?php

namespace App\Services;

use App\Models\Torneo;
use App\Models\Partido;
use App\Models\Equipo;
use Illuminate\Support\Facades\DB;

/**
 * Servicio encargado de calcular y actualizar la clasificación (tabla de posiciones)
 * de todos los equipos dentro de un Torneo específico, basándose en los resultados de los partidos.
 */
class ClasificacionService
{
    /**
     * Puntos por defecto para el cálculo (se puede hacer configurable).
     */
    protected const PUNTOS_VICTORIA = 3;
    protected const PUNTOS_EMPATE = 1;
    protected const PUNTOS_DERROTA = 0;

    /**
     * Recalcula y actualiza las estadísticas de los equipos en un torneo.
     * * @param Torneo $torneo El torneo cuyas clasificaciones deben recalcularse.
     * @return array La tabla de posiciones calculada.
     */
    public function recalcularClasificacion(Torneo $torneo): array
    {
        // Paso 1: Inicializar las estadísticas de todos los equipos del torneo.
        $equipos = $torneo->equipos->mapWithKeys(function ($equipo) {
            return [$equipo->id => [
                'id' => $equipo->id,
                'nombre' => $equipo->nombre,
                'pj' => 0, // Partidos Jugados
                'pg' => 0, // Partidos Ganados
                'pe' => 0, // Partidos Empatados
                'pp' => 0, // Partidos Perdidos
                'gf' => 0, // Goles a Favor
                'gc' => 0, // Goles en Contra
                'dg' => 0, // Diferencia de Goles
                'pts' => 0, // Puntos
            ]];
        })->toArray();
        
        // Paso 2: Procesar todos los partidos JUGADOS del torneo.
        $partidosJugados = $torneo->partidos()
                                  ->where('estado', 'Finalizado')
                                  ->get();

        foreach ($partidosJugados as $partido) {
            $localId = $partido->equipo_local_id;
            $visitanteId = $partido->equipo_visitante_id;
            $golesLocal = $partido->marcador_local;
            $golesVisitante = $partido->marcador_visitante;

            // Saltar si faltan datos de resultado (aunque la validación debería prevenir esto)
            if (is_null($golesLocal) || is_null($golesVisitante)) {
                continue;
            }

            // --- Actualización de Partidos Jugados (PJ) ---
            $equipos[$localId]['pj']++;
            $equipos[$visitanteId]['pj']++;

            // --- Actualización de Goles ---
            $equipos[$localId]['gf'] += $golesLocal;
            $equipos[$localId]['gc'] += $golesVisitante;
            $equipos[$visitanteId]['gf'] += $golesVisitante;
            $equipos[$visitanteId]['gc'] += $golesLocal;

            // --- Lógica de Puntos (PG, PE, PP, PTS) ---
            if ($golesLocal > $golesVisitante) {
                // Victoria Local
                $equipos[$localId]['pg']++;
                $equipos[$localId]['pts'] += self::PUNTOS_VICTORIA;
                $equipos[$visitanteId]['pp']++;
                $equipos[$visitanteId]['pts'] += self::PUNTOS_DERROTA;
            } elseif ($golesLocal < $golesVisitante) {
                // Victoria Visitante
                $equipos[$localId]['pp']++;
                $equipos[$localId]['pts'] += self::PUNTOS_DERROTA;
                $equipos[$visitanteId]['pg']++;
                $equipos[$visitanteId]['pts'] += self::PUNTOS_VICTORIA;
            } else {
                // Empate
                $equipos[$localId]['pe']++;
                $equipos[$localId]['pts'] += self::PUNTOS_EMPATE;
                $equipos[$visitanteId]['pe']++;
                $equipos[$visitanteId]['pts'] += self::PUNTOS_EMPATE;
            }
        }

        // Paso 3: Calcular la Diferencia de Goles (DG) y ordenar.
        $clasificacionFinal = collect($equipos)->map(function ($equipo) {
            $equipo['dg'] = $equipo['gf'] - $equipo['gc'];
            return $equipo;
        })
        ->sortByDesc('pts') // 1. Ordenar por Puntos
        ->sortByDesc('dg')  // 2. Ordenar por Diferencia de Goles
        ->values()
        ->toArray();

        // Paso 4 (Opcional pero recomendable): Almacenar la clasificación
        // Aquí asumiríamos que el modelo Torneo tiene una columna JSON o una tabla
        // separada para guardar la clasificación actual. 
        // Por simplicidad, solo la devolvemos. Si quisieras persistirla, 
        // podrías añadir un campo JSON 'clasificacion_actual' a la tabla 'torneos'.
        
        return $clasificacionFinal;
    }
}