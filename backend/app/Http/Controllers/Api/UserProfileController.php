<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Persona;
use App\Models\Auditoria;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class UserProfileController extends Controller
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
            'nombres'    => $persona->nombres,
            'apellidos'  => $persona->apellidos,
            'nombre'     => $persona->nombres.' '.$persona->apellidos,
            'email'      => $persona->email,
            'foto_url'   => $persona->foto_url,
            'disciplina' => optional($persona->jugador->equipo?->deporte)->nombre,
            'equipo'     => optional($persona->jugador->equipo)->nombre,
            'estado'     => 'ACTIVO'
        ]);
    }

    public function updateFoto(Request $request)
    {
        $usuario = $request->user();

        $request->validate([
            'foto' => 'required|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $persona = Persona::whereRaw('TRIM(cedula) = ?', [trim($usuario->cedula)])->first();

        if (!$persona) {
            return response()->json(['message' => 'Persona no encontrada.'], 404);
        }

        // Eliminar foto anterior si existe
        if ($persona->foto && Storage::disk('public')->exists($persona->foto)) {
            Storage::disk('public')->delete($persona->foto);
        }

        $extension = $request->file('foto')->getClientOriginalExtension();
        $filename  = 'perfil_jugador_' . trim($usuario->cedula) . '_' . Str::uuid() . '.' . $extension;

        try {
            $path = $request->file('foto')->storeAs(
                'perfiles',
                $filename,
                'public'
            );
        } catch (\Exception $e) {
            Log::error('Error al guardar la foto de perfil del jugador: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error interno al guardar la foto.',
                'error' => $e->getMessage()
            ], 500);
        }

        $persona->update([
            'foto' => $path,
        ]);

        $this->logAudit(
            $usuario ? $usuario->cedula : 'SISTEMA',
            'ACTUALIZAR_FOTO_PERFIL',
            'Persona',
            (string)$persona->cedula,
            'Foto de perfil de jugador actualizada'
        );

        return response()->json([
            'message' => 'Foto de perfil actualizada correctamente.',
            'foto_url' => 'storage/' . $path,
        ]);
    }
}
