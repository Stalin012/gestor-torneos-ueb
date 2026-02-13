<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Torneo;
use App\Models\Partido;
use Illuminate\Http\Request;

class TablaPosicionesController extends Controller
{
    /**
     * GET /api/torneos/{torneoId}/tabla-posiciones
     */
    public function show($torneoId)
    {
        // 1. Validar torneo
        $torneo = Torneo::with(['equipos'])->find($torneoId);

        if (!$torneo) {
            return response()->json(['message' => 'Torneo no encontrado.'], 404);
        }

        // 2. Partidos finalizados (cuando marcador no es null)
        $partidos = Partido::where('torneo_id', $torneoId)
            ->whereNotNull('marcador_local')
            ->whereNotNull('marcador_visitante')
            ->get();

        if ($partidos->isEmpty()) {
            return response()->json([
                'message' => 'No hay partidos finalizados para este torneo.',
                'torneo'  => $torneo->only('id', 'nombre', 'deporte_id', 'categoria_id'),
                'tabla'   => []
            ]);
        }

        // 3. Inicializar tabla de posiciones
        $tabla = [];

        foreach ($torneo->equipos as $equipo) {
            $tabla[$equipo->id] = [
                'equipo_id'        => $equipo->id,
                'nombre'           => $equipo->nombre,
                'jugados'          => 0,
                'ganados'          => 0,
                'empatados'        => 0,
                'perdidos'         => 0,
                'goles_favor'      => 0,
                'goles_contra'     => 0,
                'diferencia_goles' => 0,
                'puntos'           => 0,
            ];
        }

        // 4. Procesar cada partido
        foreach ($partidos as $p) {
            $local = $p->equipo_local_id;
            $visitante = $p->equipo_visitante_id;

            // Sanity check por si el torneo tiene datos inconsistentes
            if (!isset($tabla[$local]) || !isset($tabla[$visitante])) {
                continue;
            }

            $ml = $p->marcador_local;
            $mv = $p->marcador_visitante;

            // Jugados
            $tabla[$local]['jugados']++;
            $tabla[$visitante]['jugados']++;

            // Goles
            $tabla[$local]['goles_favor'] += $ml;
            $tabla[$local]['goles_contra'] += $mv;

            $tabla[$visitante]['goles_favor'] += $mv;
            $tabla[$visitante]['goles_contra'] += $ml;

            // Resultados
            if ($ml > $mv) {
                // Gana local
                $tabla[$local]['ganados']++;
                $tabla[$local]['puntos'] += 3;
                $tabla[$visitante]['perdidos']++;
            } elseif ($ml < $mv) {
                // Gana visitante
                $tabla[$visitante]['ganados']++;
                $tabla[$visitante]['puntos'] += 3;
                $tabla[$local]['perdidos']++;
            } else {
                // Empate
                $tabla[$local]['empatados']++;
                $tabla[$visitante]['empatados']++;
                $tabla[$local]['puntos']++;
                $tabla[$visitante]['puntos']++;
            }
        }

        // 5. Calcular diferencia de goles
        foreach ($tabla as &$item) {
            $item['diferencia_goles'] = $item['goles_favor'] - $item['goles_contra'];
        }
        unset($item);

        // 6. Ordenar la tabla
        $tabla = array_values($tabla);

        usort($tabla, function ($a, $b) {
            return
                $b['puntos'] <=> $a['puntos'] ?:              // 1. Puntos
                $b['diferencia_goles'] <=> $a['diferencia_goles'] ?: // 2. DG
                $b['goles_favor'] <=> $a['goles_favor'];      // 3. GF
        });

        // 7. Respuesta final
        return response()->json([
            'torneo' => [
                'id'          => $torneo->id,
                'nombre'      => $torneo->nombre,
                'deporte_id'  => $torneo->deporte_id,
                'categoria_id'=> $torneo->categoria_id,
            ],
            'tabla' => $tabla
        ]);
    }
}
