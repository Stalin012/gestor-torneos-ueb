<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Persona;
use App\Models\Auditoria;

class EquipoInscritoController extends Controller
{
    private function logAudit(string $usuarioCedula, string $accion, string $entidad, string $entidadId, string $detalle): void
    {
        Auditoria::create([
            'timestamp'      => now(),
            'usuario_cedula' => $usuarioCedula,
            'accion'         => $accion,
            'entidad'        => $entidad,
            'entidad_id'     => $entidadId,
            'detalle'        => $detalle,
        ]);
    }
    public function index(Request $request)
    {
        $cedula = trim($request->user()->cedula);

        $persona = Persona::with([
            'jugador.equipo.inscripciones.torneo',
            'jugador.equipo.torneo'
        ])
        ->whereRaw('TRIM(cedula) = ?', [$cedula])
        ->first();

        if (!$persona || !$persona->jugador || !$persona->jugador->equipo) {
            return response()->json([]);
        }

        $equipo = $persona->jugador->equipo;
        $data = [];

        // Si el equipo tiene inscripciones en la tabla inscripciones, las recorremos
        if ($equipo->inscripciones && $equipo->inscripciones->count() > 0) {
            foreach ($equipo->inscripciones as $inscripcion) {
                $data[] = [
                    'equipo' => $equipo->nombre,
                    'torneo' => optional($inscripcion->torneo)->nombre ?? 'Por definir',
                    'estado' => $inscripcion->estado ?? 'Aprobada',
                    // Si fecha_inscripcion es null, usamos la fecha de creación del registro o la del equipo
                    'fecha'  => optional($inscripcion->fecha_inscripcion)->format('Y-m-d') 
                                ?? $inscripcion->created_at?->format('Y-m-d') 
                                ?? $equipo->created_at?->format('Y-m-d'),
                ];
            }
        } else {
            // Si no hay registros en la tabla "inscripciones", pero el equipo está asociado a un torneo
            // o simplemente para mostrar que el jugador pertenece a ese equipo
            $data[] = [
                'equipo' => $equipo->nombre,
                'torneo' => $equipo->torneo ? $equipo->torneo->nombre : 'Por definir',
                'estado' => 'ACTIVO',
                'fecha'  => $equipo->created_at ? $equipo->created_at->format('Y-m-d') : date('Y-m-d'),
            ];
        }

        return response()->json($data);
    }
}
