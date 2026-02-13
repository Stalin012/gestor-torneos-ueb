<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Persona;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UsuarioController extends Controller
{
    // lista de roles permitidos en TODO el controlador
    private array $rolesValidos = [
        'admin',
        'entrenador',
        'jugador',
        'arbitro',
        'usuario',
        'representante', // 👈 AÑADIDO
    ];

    public function index(Request $request)
    {
        // si ya usas middleware('admin') esto es redundante, pero no estorba
        if ($request->user()->rol !== 'admin') {
            return response()->json(['message' => 'Acceso denegado.'], 403);
        }

        $usuarios = Usuario::with('persona')->paginate(20);

        return response()->json($usuarios);
    }

    public function store(Request $request)
    {
        if ($request->user()->rol !== 'admin') {
            return response()->json(['message' => 'Solo un administrador puede crear usuarios.'], 403);
        }

        // ✅ PERSONA YA EXISTE
        $request->validate([
            'cedula'   => 'required|string|size:10|exists:personas,cedula|unique:usuarios,cedula',
            'email'    => 'required|string|email|max:100|unique:usuarios,email',
            'rol'      => ['required', 'string', Rule::in($this->rolesValidos)], // 👈 AQUÍ
            'estado'   => 'required|boolean',
            'password' => 'nullable|string|min:8',
        ]);

        try {
            DB::beginTransaction();

            $persona = Persona::where('cedula', $request->cedula)->first();

            $passwordPlano = $request->password ?: $request->cedula;

            $usuario = Usuario::create([
                'cedula'   => $request->cedula,
                'email'    => $request->email,
                'password' => Hash::make($passwordPlano),
                'rol'      => $request->rol,
                'estado'   => $request->estado,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Usuario registrado exitosamente.',
                'usuario' => $usuario->load('persona')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al registrar el usuario.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function show($cedula)
    {
        $usuario = Usuario::where('cedula', $cedula)
            ->with('persona')
            ->first();

        if (!$usuario) {
            return response()->json(['message' => 'Usuario no encontrado.'], 404);
        }

        return response()->json($usuario);
    }

    public function update(Request $request, $cedula)
    {
        $usuario = Usuario::where('cedula', $cedula)->first();

        if (!$usuario) {
            return response()->json(['message' => 'Usuario no encontrado.'], 404);
        }

        $request->validate([
            'email'    => 'required|string|email|max:100|unique:usuarios,email,' . $cedula . ',cedula',
            'rol'      => ['required', 'string', Rule::in($this->rolesValidos)], // 👈 AQUÍ TAMBIÉN
            'estado'   => 'required|boolean',
            'password' => 'nullable|string|min:8',

            'nombres'   => 'sometimes|string|max:100',
            'apellidos' => 'sometimes|string|max:100',
            'edad'      => 'sometimes|nullable|integer|min:0',
            'estatura'  => 'sometimes|nullable|numeric|min:0',
            'telefono'  => 'sometimes|nullable|string|max:20',
            'foto'      => 'sometimes|nullable|string|max:255',
        ]);

        try {
            DB::beginTransaction();

            // Usuario
            $usuario->email  = $request->email;
            $usuario->rol    = $request->rol;
            $usuario->estado = $request->estado;
            if ($request->filled('password')) {
                $usuario->password = Hash::make($request->password);
            }
            $usuario->save();

            // Persona (solo si se enviaron campos)
            $persona = Persona::where('cedula', $cedula)->first();
            if ($persona) {
                $persona->update($request->only(
                    'nombres',
                    'apellidos',
                    'edad',
                    'estatura',
                    'telefono',
                    'foto'
                ));
            }

            DB::commit();

            return response()->json([
                'message' => 'Usuario actualizado exitosamente.',
                'usuario' => $usuario->load('persona')
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al actualizar el usuario.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Request $request, $cedula)
    {
        if ($request->user()->rol !== 'admin') {
            return response()->json(['message' => 'Acceso denegado.'], 403);
        }

        $usuario = Usuario::where('cedula', $cedula)->first();
        if (!$usuario) {
            return response()->json(['message' => 'Usuario no encontrado.'], 404);
        }

        try {
            DB::beginTransaction();

            $usuario->delete();

            DB::commit();

            return response()->json(['message' => 'Acceso de usuario eliminado.']);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al eliminar el usuario.',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function verificarPersona($cedula)
    {
        if (strlen($cedula) !== 10) {
            return response()->json([
                'existe_persona' => false,
                'es_usuario'     => false,
                'message'        => 'La cédula debe tener 10 dígitos.'
            ], 400);
        }

        $persona = Persona::where('cedula', $cedula)->first();
        $usuario = Usuario::where('cedula', $cedula)->first();

        return response()->json([
            'existe_persona' => (bool) $persona,
            'es_usuario'     => (bool) $usuario,
            'persona_data'   => $persona ? [
                'nombres'   => $persona->nombres,
                'apellidos' => $persona->apellidos,
            ] : null,
            'message' => 'Estado de la cédula verificado.'
        ]);
    }
}
