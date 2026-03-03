<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Persona;
use App\Models\Auditoria;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

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

        // Permitimos el acceso aunque no tenga ficha de 'jugador' registrada
        // porque un jugador recién registrado entra como 'Agente Libre' y puede
        // actualizar su foto y datos antes de que un equipo lo federe.

        return response()->json([
            'cedula'     => $persona->cedula,
            'nombres'    => $persona->nombres,
            'apellidos'  => $persona->apellidos,
            'nombre'     => $persona->nombres.' '.$persona->apellidos,
            'email'      => $persona->email,
            'foto_url'   => $persona->foto_url,
            'telefono'   => $persona->telefono,
            'disciplina' => $persona->jugador && $persona->jugador->equipo && $persona->jugador->equipo->deporte ? $persona->jugador->equipo->deporte->nombre : 'Sin Disciplina',
            'equipo'     => $persona->jugador && $persona->jugador->equipo ? $persona->jugador->equipo->nombre : 'Jugador Libre',
            'estado'     => 'ACTIVO'
        ]);
    }

    public function update(Request $request)
    {
        /** @var \App\Models\Usuario $usuario */
        $usuario = $request->user();

        $validated = $request->validate([
            'email'      => 'required|email|unique:personas,email,' . $usuario->cedula . ',cedula',
            'nombres'    => 'required|string|max:150',
            'apellidos'  => 'required|string|max:150',
            'telefono'   => 'nullable|string|max:20',
        ]);

        DB::transaction(function () use ($validated, $usuario) {
            // 1. Actualizar USUARIO
            $usuario->update([
                'email'     => $validated['email'],
                'nombres'   => $validated['nombres'],
                'apellidos' => $validated['apellidos'],
            ]);

            // 2. Actualizar PERSONA
            $persona = Persona::whereRaw('TRIM(cedula) = ?', [trim($usuario->cedula)])->first();
            if ($persona) {
                $persona->update([
                    'nombres'   => $validated['nombres'],
                    'apellidos' => $validated['apellidos'],
                    'telefono'  => $validated['telefono'] ?? null,
                    'email'     => $validated['email'],
                ]);
            }
        });

        $this->logAudit(
            $usuario->cedula,
            'ACTUALIZAR_PERFIL_JUGADOR',
            'Usuario',
            (string)$usuario->cedula,
            'Perfil de jugador actualizado'
        );

        return response()->json([
            'message' => 'Perfil actualizado correctamente.',
        ]);
    }

    public function updatePassword(Request $request)
    {
        /** @var \App\Models\Usuario $usuario */
        $usuario = $request->user();

        $request->validate([
            'password_actual'       => 'required|string',
            'password_nueva'        => 'required|string|min:8',
            'password_confirmacion' => 'required|same:password_nueva',
        ]);

        if (!Hash::check($request->password_actual, $usuario->password)) {
            return response()->json([
                'message' => 'La contraseña actual es incorrecta.',
                'errors' => ['password_actual' => ['La contraseña actual es incorrecta.']]
            ], 422);
        }

        $usuario->update([
            'password' => Hash::make($request->password_nueva),
        ]);

        $this->logAudit(
            $usuario->cedula,
            'CAMBIAR_CONTRASENA_JUGADOR',
            'Usuario',
            (string)$usuario->cedula,
            'Contraseña de jugador actualizada'
        );

        return response()->json([
            'message' => 'Contraseña actualizada correctamente.',
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
        $filename  = 'perfil_' . trim($usuario->cedula) . '_' . time() . '.' . $extension;

        try {
            // Guardar en la carpeta perfiles (dentro de storage/app/public)
            $path = $request->file('foto')->storeAs('perfiles', $filename, 'public');
        } catch (\Exception $e) {
            Log::error('Error al guardar la foto de perfil: ' . $e->getMessage());
            return response()->json(['message' => 'Error al guardar la imagen.'], 500);
        }

        $persona->update(['foto' => $path]);

        $this->logAudit(
            $usuario->cedula,
            'ACTUALIZAR_FOTO_PERFIL',
            'Persona',
            (string)$persona->cedula,
            'Foto de perfil actualizada'
        );

        return response()->json([
            'message' => 'Foto de perfil actualizada correctamente.',
            'foto_url' => $persona->foto_url,
        ]);
    }
}
