<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Partido;
use App\Models\Equipo;

class PartidosRepresentanteController extends Controller
{
    /**
     * Listar partidos del representante autenticado
     */
    public function index(Request $request)
    {
        $usuario = $request->user();

        // 1️⃣ Obtener IDs de equipos del representante
        $equiposIds = Equipo::where('representante_cedula', $usuario->cedula)
            ->pluck('id');

        if ($equiposIds->isEmpty()) {
            return response()->json([]);
        }

        // 2️⃣ Partidos donde participa alguno de sus equipos
        $partidos = Partido::with([
                'equipoLocal:id,nombre',
                'equipoVisitante:id,nombre',
                'torneo:id,nombre'
            ])
            ->whereIn('equipo_local_id', $equiposIds)
            ->orWhereIn('equipo_visitante_id', $equiposIds)
            ->orderBy('fecha')
            ->orderBy('hora')
            ->get();

        return response()->json($partidos);
    }
}
