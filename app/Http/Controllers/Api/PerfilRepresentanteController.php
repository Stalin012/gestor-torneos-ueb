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


class PerfilRepresentanteController extends Controller
{
    /**
     * Actualizar datos del perfil (usuarios + personas)
     */
    public function updatePerfil(Request $request)
    {
        /** @var Usuario $usuario */
        $usuario = $request->user();

        $validated = $request->validate([
            // Usuario
            'email'      => 'required|email|unique:usuarios,email,' . $usuario->cedula . ',cedula',

            // Persona
            'nombres'    => 'required|string|max:150',
            'apellidos'  => 'required|string|max:150',
            'telefono'   => 'nullable|string|max:20',
            'edad'       => 'nullable|integer|min:0|max:120',
            'estatura'   => 'nullable|numeric|min:0|max:3',
        ]);

        DB::transaction(function () use ($validated, $usuario) {

            // 1️⃣ Actualizar USUARIO
            $usuario->update([
                'email' => $validated['email'],
            ]);

            // 2️⃣ Actualizar o crear PERSONA
            Persona::updateOrCreate(
                ['cedula' => $usuario->cedula],
                [
                    'nombres'   => $validated['nombres'],
                    'apellidos' => $validated['apellidos'],
                    'telefono'  => $validated['telefono'] ?? null,
                    'edad'      => $validated['edad'] ?? null,
                    'estatura'  => $validated['estatura'] ?? null,
                    'email'     => $validated['email'],
                ]
            );
        });

        return response()->json([
            'message' => 'Perfil actualizado correctamente.',
        ]);
    }

    /**
     * Cambiar contraseña del representante
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

        return response()->json([
            'message' => 'Contraseña actualizada correctamente.',
        ]);
    }
    /**
 * Subir / actualizar foto de perfil del representante
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
    $path = $request->file('foto')->storeAs(
        'perfiles',
        $filename,
        'public'
    );

    // Guardar ruta en DB
    $persona->update([
        'foto' => $path,
    ]);

    return response()->json([
        'message' => 'Foto de perfil actualizada correctamente.',
        'foto_url' => asset('storage/' . $path),
    ]);
}

}
