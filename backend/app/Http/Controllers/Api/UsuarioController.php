<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Persona;
use App\Models\User;
use App\Models\Auditoria;
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
        try {
            $usuarios = User::with('persona')
                ->when($request->search, function ($query, $search) {
                    return $query->where('email', 'like', "%{$search}%")
                                ->orWhereHas('persona', function ($q) use ($search) {
                                    $q->where('nombres', 'like', "%{$search}%")
                                      ->orWhere('apellidos', 'like', "%{$search}%");
                                });
                })
                ->when($request->sort_by, function ($query, $sortBy) use ($request) {
                    $allowedColumns = ['cedula', 'email', 'rol', 'estado', 'created_at'];
                    if (!in_array($sortBy, $allowedColumns)) {
                        $sortBy = 'cedula';
                    }
                    $direction = $request->sort_direction === 'desc' ? 'desc' : 'asc';
                    return $query->orderBy($sortBy, $direction);
                })
                ->paginate($request->per_page ?? 20);

            return response()->json($usuarios);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al obtener usuarios.'], 500);
        }
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

            $usuario = User::create([
                'cedula'   => $request->cedula,
                'email'    => $request->email,
                'password' => Hash::make($passwordPlano),
                'rol'      => $request->rol,
                'estado'   => $request->estado,
            ]);

            $this->logAudit(
                $request->user() ? $request->user()->cedula : 'SISTEMA',
                'CREAR',
                'Usuario',
                (string)$usuario->cedula,
                'Creación de nuevo usuario: ' . $usuario->email . ' con rol ' . $usuario->rol
            );

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
        $usuario = User::where('cedula', $cedula)
            ->with('persona')
            ->first();

        if (!$usuario) {
            return response()->json(['message' => 'Usuario no encontrado.'], 404);
        }

        return response()->json($usuario);
    }

    public function update(Request $request, $cedula)
    {
        $usuario = User::where('cedula', $cedula)->first();

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
            $usuario->nombres = $request->input('nombres', $usuario->nombres);
            $usuario->apellidos = $request->input('apellidos', $usuario->apellidos);

            $usuario->telefono = $request->input('telefono', $usuario->telefono);
            $usuario->foto = $request->input('foto', $usuario->foto);
            if ($request->filled('password')) {
                $usuario->password = Hash::make($request->password);
            }
            $usuario->save();

            $this->logAudit(
                $request->user() ? $request->user()->cedula : 'SISTEMA',
                'ACTUALIZAR',
                'Usuario',
                (string)$usuario->cedula,
                'Actualización de usuario: ' . $usuario->email . ' (Rol: ' . $usuario->rol . ', Estado: ' . ($usuario->estado ? 'Activo' : 'Inactivo') . ')'
            );

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
            \Illuminate\Support\Facades\Log::error('Error actualizando usuario ' . $cedula . ': ' . $e->getMessage());
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

        $usuario = User::where('cedula', $cedula)->first();
        if (!$usuario) {
            return response()->json(['message' => 'Usuario no encontrado.'], 404);
        }

        try {
            DB::beginTransaction();

            $this->logAudit(
                $request->user() ? $request->user()->cedula : 'SISTEMA',
                'ELIMINAR',
                'Usuario',
                (string)$usuario->cedula,
                'Eliminación de usuario: ' . $usuario->email
            );

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
        $usuario = User::where('cedula', $cedula)->first();

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
}
