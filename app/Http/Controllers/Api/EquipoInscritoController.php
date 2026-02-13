<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Persona;

class EquipoInscritoController extends Controller
{
    public function index(Request $request)
    {
        $cedula = trim($request->user()->cedula);

        $persona = Persona::with([
            'jugador.equipo.inscripciones.torneo'
        ])
        ->whereRaw('TRIM(cedula) = ?', [$cedula])
        ->first();

        if (!$persona || !$persona->jugador || !$persona->jugador->equipo) {
            return response()->json([]);
        }

        $equipo = $persona->jugador->equipo;

        $data = [];

        foreach ($equipo->inscripciones as $inscripcion) {
            $data[] = [
                'equipo' => $equipo->nombre,
                'torneo' => optional($inscripcion->torneo)->nombre,
                'estado' => $inscripcion->estado,
                'fecha'  => optional($inscripcion->fecha_inscripcion)?->format('Y-m-d'),
            ];
        }

        return response()->json($data);
    }
}
