<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Exception;
// ⬇️ CORRECCIONES CLAVE: Importar los modelos utilizados
use App\Models\Torneo;
use App\Models\Partido;
// ⬆️ FIN DE CORRECCIONES

class FixtureController extends Controller
{
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
        // 🛡️ Nota: Sería buena práctica envolver toda la lógica de creación en una 
        // transacción de base de datos para revertir si algo falla.

        try {
            $torneo = Torneo::findOrFail($torneoId);

            // 1. Obtener los equipos inscritos en el torneo
            // Asumiendo que Torneo.php tiene la relación 'equipos()'
            $equipos = $torneo->equipos()->pluck('id')->toArray();
            
            if (count($equipos) < 2) {
                return response()->json([
                    'message' => 'Se necesitan al menos dos equipos para generar el fixture.'
                ], 400);
            }

            // 2. Ejecutar la lógica de generación del Round-Robin
            $partidosGenerados = $this->generarRoundRobin($equipos, $torneoId);

            return response()->json([
                'message' => count($partidosGenerados) . ' partidos generados exitosamente para el torneo: ' . $torneo->nombre,
                'total_partidos' => count($partidosGenerados)
            ]);

        } catch (Exception $e) {
            // Un error 500 puede ocurrir aquí si la relación 'equipos' no existe en Torneo.php
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
        
        // Algoritmo Round-Robin simplificado (solo una vuelta, A vs B)
        for ($i = 0; $i < $n; $i++) {
            for ($j = $i + 1; $j < $n; $j++) {
                // Generar partido A vs B
                $partidos[] = Partido::create([
                    'torneo_id' => $torneoId,
                    'equipo_local_id' => $equipoIds[$i],
                    'equipo_visitante_id' => $equipoIds[$j],
                    'estado' => 'Programado',
                    'fecha' => now()->addDays(rand(1, 30)), // Fechas ficticias
                ]);
            }
        }
        return $partidos;
    }
}