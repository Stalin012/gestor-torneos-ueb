<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Exception;
// ⬇️ CORRECCIONES CLAVE: Importar los modelos utilizados
use App\Models\Torneo;
use App\Models\Partido;
use App\Models\Auditoria;
use App\Models\Inscripcion;
use Illuminate\Support\Facades\DB;
// ⬆️ FIN DE CORRECCIONES

class FixtureController extends Controller
{
    // El método logAudit ya no es necesario aquí puesto que usaremos Auditoria::log()

    // Asegúrate de usar un middleware de autenticación/autorización aquí
    // Por ejemplo:
    // public function __construct()
    // {
    //     $this->middleware('admin'); 
    // }

    /**
     * Genera automáticamente los partidos (fixture) para un torneo.
     * GET /api/fixtures/generar/{torneoId}
     */
    public function generar(int $torneoId)
    {
        try {
            DB::beginTransaction();
            $torneo = Torneo::findOrFail($torneoId);

            // 1. Obtener los equipos cuya inscripción esté APROBADA en este torneo
            // Esto es más robusto que usar solo la relación equipos() del modelo Torneo
            $equipoIds = Inscripcion::where('torneo_id', $torneoId)
                ->where('estado', 'Aprobada')
                ->pluck('equipo_id')
                ->unique()
                ->toArray();
            
            // Si no hay inscripciones aprobadas, intentamos con la relación directa por si acaso
            if (empty($equipoIds)) {
                $equipoIds = $torneo->equipos()->pluck('id')->toArray();
            }

            if (count($equipoIds) < 2) {
                return response()->json([
                    'message' => 'Se necesitan al menos dos equipos aprobados para generar el fixture.'
                ], 400);
            }

            // 2. Ejecutar la lógica de generación del Round-Robin
            $partidosGenerados = $this->generarRoundRobin($equipoIds, $torneoId);

            Auditoria::log(
                'GENERAR_FIXTURE',
                'Torneo',
                (string)$torneoId,
                'Generación automática de fixture para el torneo: ' . $torneo->nombre . '. Total de encuentros creados: ' . count($partidosGenerados)
            );

            DB::commit();

            return response()->json([
                'message' => count($partidosGenerados) . ' partidos generados exitosamente para el torneo: ' . $torneo->nombre,
                'total_partidos' => count($partidosGenerados)
            ]);

        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al generar el fixture: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lógica simplificada de generación de Round-Robin (solo ida).
     * @param array $equipoIds IDs de los equipos.
     * @param int $torneoId ID del torneo.
     * @return array Partidos creados.
     */
    protected function generarRoundRobin(array $equipoIds, int $torneoId): array
    {
        $partidos = [];
        $n = count($equipoIds);
        $torneo = Torneo::find($torneoId);
        $fechaBase = $torneo && $torneo->fecha_inicio ? $torneo->fecha_inicio : now();
        
        // Algoritmo Round-Robin simplificado (solo una vuelta, A vs B)
        for ($i = 0; $i < $n; $i++) {
            for ($j = $i + 1; $j < $n; $j++) {
                $localId = $equipoIds[$i];
                $visitanteId = $equipoIds[$j];

                // Evitar duplicados: Verificar si ya existe el encuentro en este torneo
                $existe = Partido::where('torneo_id', $torneoId)
                    ->where(function($q) use ($localId, $visitanteId) {
                        $q->where(function($sq) use ($localId, $visitanteId) {
                            $sq->where('equipo_local_id', $localId)
                               ->where('equipo_visitante_id', $visitanteId);
                        })->orWhere(function($sq) use ($localId, $visitanteId) {
                            $sq->where('equipo_local_id', $visitanteId)
                               ->where('equipo_visitante_id', $localId);
                        });
                    })->exists();

                if (!$existe) {
                    $partidos[] = Partido::create([
                        'torneo_id' => $torneoId,
                        'equipo_local_id' => $localId,
                        'equipo_visitante_id' => $visitanteId,
                        'estado' => 'Programado',
                        'fecha' => (clone $fechaBase)->addDays(rand(1, 30)), 
                    ]);
                }
            }
        }
        return $partidos;
    }
}