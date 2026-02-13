<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Models\Usuario;
use App\Models\Persona;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Models\Auditoria;

class PerfilArbitroController extends Controller
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

    /**
     * Actualizar datos del perfil (usuarios + personas)
     */
    public function updatePerfil(Request $request)
    {
        /** @var Usuario $usuario */
        $usuario = $request->user();

        $validated = $request->validate([
            // Usuario
            'email'      => 'required|email|unique:personas,email,' . $usuario->cedula . ',cedula',
            
            // Persona
            'nombres'    => 'required|string|max:150',
            'apellidos'  => 'required|string|max:150',
            'telefono'   => 'nullable|string|max:20',
        ]);

        DB::transaction(function () use ($validated, $usuario) {

            // 1️⃣ Actualizar USUARIO
            $usuario->update([
                'email'     => $validated['email'],
                'nombres'   => $validated['nombres'] ?? $usuario->nombres,
                'apellidos' => $validated['apellidos'] ?? $usuario->apellidos,
                'telefono'  => $validated['telefono'] ?? $usuario->telefono,
            ]);

            // 2️⃣ Actualizar o crear PERSONA
            Persona::updateOrCreate(
                ['cedula' => $usuario->cedula],
                [
                    'nombres'   => $validated['nombres'],
                    'apellidos' => $validated['apellidos'],
                    'telefono'  => $validated['telefono'] ?? null,
                    'email'     => $validated['email'],
                ]
            );
        });

        $this->logAudit(
            $usuario ? $usuario->cedula : 'SISTEMA',
            'ACTUALIZAR_PERFIL',
            'Usuario',
            (string)$usuario->cedula,
            'Perfil de árbitro actualizado: ' . ($usuario->persona->nombre_completo ?? 'N/A')
        );

        return response()->json([
            'message' => 'Perfil actualizado correctamente.',
        ]);
    }

    /**
     * Cambiar contraseña
     */
    public function updatePassword(Request $request)
    {
        /** @var Usuario $usuario */
        $usuario = $request->user();

        $request->validate([
            'password_actual'       => 'required|string',
            'password_nueva'        => 'required|string|min:8',
            'password_confirmacion' => 'required|same:password_nueva',
        ]);

        if (!Hash::check($request->password_actual, $usuario->password)) {
            throw ValidationException::withMessages([
                'password_actual' => ['La contraseña actual es incorrecta.'],
            ]);
        }

        $usuario->update([
            'password' => Hash::make($request->password_nueva),
        ]);

        $this->logAudit(
            $usuario ? $usuario->cedula : 'SISTEMA',
            'CAMBIAR_CONTRASENA',
            'Usuario',
            (string)$usuario->cedula,
            'Contraseña de árbitro actualizada'
        );

        return response()->json([
            'message' => 'Contraseña actualizada correctamente.',
        ]);
    }

    /**
     * Subir / actualizar foto de perfil
     */
    public function updateFoto(Request $request)
    {
        $usuario = $request->user();

        $request->validate([
            'foto' => 'required|image|mimes:jpg,jpeg,png,webp|max:2048', // máx 2MB
        ]);

        // Obtener persona asociada
        $persona = Persona::firstOrCreate(
            ['cedula' => $usuario->cedula],
            ['email' => $usuario->email]
        );

        // Eliminar foto anterior si existe
        if ($persona->foto && Storage::disk('public')->exists($persona->foto)) {
            Storage::disk('public')->delete($persona->foto);
        }

        // Nombre único del archivo
        $extension = $request->file('foto')->getClientOriginalExtension();
        $filename  = 'perfil_' . $usuario->cedula . '_' . Str::uuid() . '.' . $extension;

        // Guardar en storage/app/public/perfiles
        try {
            $path = $request->file('foto')->storeAs(
                'perfiles',
                $filename,
                'public'
            );
        } catch (\Exception $e) {
            \Log::error('Error al guardar la foto de perfil: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error interno al guardar la foto. Por favor, inténtalo de nuevo más tarde.',
                'error' => $e->getMessage()
            ], 500);
        }

        // Guardar ruta en DB
        $persona->update([
            'foto' => $path,
        ]);

        $this->logAudit(
            $usuario ? $usuario->cedula : 'SISTEMA',
            'ACTUALIZAR_FOTO_PERFIL',
            'Persona',
            (string)$persona->cedula,
            'Foto de perfil de árbitro actualizada'
        );

        return response()->json([
            'message' => 'Foto de perfil actualizada correctamente.',
            'foto_url' => 'storage/' . $path,
        ]);
    }
}
