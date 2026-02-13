<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Persona;

class UserProfileController extends Controller
{
    public function show(Request $request)
    {
        $cedula = trim($request->user()->cedula);

        // 🔑 TRIM REAL EN POSTGRESQL
        $persona = Persona::with('jugador.equipo.deporte')
            ->whereRaw('TRIM(cedula) = ?', [$cedula])
            ->first();

        if (!$persona) {
            return response()->json([
                'error' => 'Persona no encontrada',
                'cedula_auth' => $cedula
            ], 403);
        }

        if (!$persona->jugador) {
            return response()->json([
                'error' => 'Usuario autenticado, pero no es jugador',
                'cedula_auth' => $cedula,
                'rol' => $request->user()->rol
            ], 403);
        }

        return response()->json([
            'cedula'     => $persona->cedula,
            'nombre'     => $persona->nombres.' '.$persona->apellidos,
            'email'      => $persona->email,
            'disciplina' => optional($persona->jugador->equipo?->deporte)->nombre,
            'equipo'     => optional($persona->jugador->equipo)->nombre,
            'estado'     => 'ACTIVO'
        ]);
    }
}
