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
use Barryvdh\DomPDF\Facade\Pdf;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

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
            return response()->json([
                'message' => 'Error al obtener usuarios.',
                'error_msg' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        if ($request->user()->rol !== 'admin') {
            return response()->json(['message' => 'Solo un administrador puede crear usuarios.'], 403);
        }

        // Validamos la cédula pero NO forzamos a que exista previamente en `personas`
        $request->validate([
            'cedula'    => 'required|string|size:10|unique:usuarios,cedula',
            'email'     => 'required|string|email|max:100|unique:usuarios,email',
            'rol'       => ['required', 'string', Rule::in($this->rolesValidos)],
            'estado'    => 'required|boolean',
            'password'  => 'nullable|string|min:8',
            'nombres'   => 'nullable|string|max:100',
            'apellidos' => 'nullable|string|max:100',
        ]);

        try {
            // 🛑 QUITAMOS LA TRANSACCIÓN PARA VER EL ERROR REAL SI FALLA
            // DB::beginTransaction();

            $persona = Persona::where('cedula', (string)$request->cedula)->first();

            if (!$persona) {
                if (!$request->nombres || !$request->apellidos) {
                    return response()->json(['message' => 'Nombres y apellidos son requeridos para un nuevo registro.'], 422);
                }
                $persona = Persona::create([
                    'cedula'    => (string)$request->cedula,
                    'nombres'   => (string)$request->nombres,
                    'apellidos' => (string)$request->apellidos,
                    'email'     => (string)$request->email,
                ]);
            }

            $passwordPlano = $request->password ?: $request->cedula;

            // 🛡️ SOLUCIÓN HARD RAW PARA SUPABASE / POSTGRESQL
            // No usamos el query builder porque con DB_PREPARED_STATEMENTS=false 
            // Laravel intenta convertir booleano a entero (1/0) y Postgres lo rechaza.
            $estadoStr = $request->estado ? 'TRUE' : 'FALSE';
            $passwordHashed = Hash::make((string)$passwordPlano);
            $now = now();

            \Illuminate\Support\Facades\DB::statement("
                INSERT INTO usuarios 
                (cedula, email, nombres, apellidos, password, rol, estado, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, $estadoStr, ?, ?)
            ", [
                (string)$request->cedula,
                (string)$request->email,
                (string)$request->nombres,
                (string)$request->apellidos,
                $passwordHashed,
                (string)$request->rol,
                $now,
                $now
            ]);

            $usuario = User::where('cedula', (string)$request->cedula)->first();

            // 🛡️ ACCIONES SECUNDARIAS
            try {
                $this->logAudit(
                    $request->user() ? (string)$request->user()->cedula : 'SISTEMA',
                    'CREAR',
                    'Usuario',
                    (string)$usuario->cedula,
                    'Creación de nuevo usuario: ' . $usuario->email
                );
            } catch (\Exception $ae) {}

            // DB::commit();

            return response()->json([
                'message' => 'Usuario registrado exitosamente.',
                'usuario' => $usuario->load('persona')
            ], 201);

        } catch (\Exception $e) {
            // DB::rollBack();
            return response()->json([
                'message' => 'Error crítico en el servidor.',
                'error'   => $e->getMessage(),
                'line'    => $e->getLine()
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
                'email'     => $persona->email,
            ] : null,
            'message' => 'Estado de la cédula verificado.'
        ]);
    }

    // ==========================================
    // CARNET DE USUARIO / ADMINISTRADOR
    // ==========================================

    public function generarCarnet($cedula)
    {
        $usuario = User::with('persona')->where('cedula', $cedula)->first();

        if (!$usuario) {
            return response()->json([
                'message' => 'Usuario no encontrado.'
            ], 404);
        }

        $data = $this->buildCarnetData($usuario);

        return response()->json([
            'message' => 'Datos del carnet generados correctamente.',
            'data'    => $data, 
        ]);
    }

    public function carnetPdf($cedula)
    {
        \Log::info("Intentando generar carnet PDF de USUARIO para cédula: {$cedula}");
        try {
            $usuario = User::with('persona')->where('cedula', $cedula)->first();

            if (!$usuario) {
                abort(404, 'Usuario no encontrado.');
            }

            $data = $this->buildCarnetData($usuario);

            $pdf = Pdf::loadView('pdf.carnet_usuario', compact('usuario', 'data') + ['qrCode' => $data['qr_base64']])
                ->setPaper([0, 0, 242.65, 153.07], 'landscape');

            return $pdf->download('Carnet_Usuario_'.$usuario->cedula.'.pdf');
        } catch (\Exception $e) {
            \Log::error("Error al generar PDF de USUARIO para cédula {$cedula}: " . $e->getMessage());
            
            return response()->json([
                'message' => 'Error al generar el PDF del carnet de usuario.',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }

    private function buildCarnetData(User $usuario): array
    {
        $persona = $usuario->persona;

        // Asegurar que exista qr_token (lo usamos como clave única)
        if (!$usuario->qr_token) {
            // Nota: debes asegurar que exista 'qr_token' y 'qr_generated_at' en la tabla 'usuarios'
            // O simplemente generamos uno al vuelo si no existe la columna
            $usuario->qr_token = (string) \Illuminate\Support\Str::uuid();
            // $usuario->qr_generated_at = now(); 
            // $usuario->save();
            // Update the user gracefully if the column exists, otherwise ignore persistence or create a migration later.
            try {
                $usuario->save();
            } catch (\Exception $e) {}
        }

        $nombreCompleto = $persona
            ? trim(($persona->nombres ?? '') . ' ' . ($persona->apellidos ?? ''))
            : 'Sin nombre';

        // Forzamos la URL del frontend oficial para evitar que el escaneo de JSON por error de configuración en .env
        $frontendUrl = 'https://www.deportesueb.com';
        $qrText = $frontendUrl . "/carnet/" . $usuario->cedula;

        $qrSvgRaw = (string) QrCode::format('svg')
            ->size(300)
            ->errorCorrection('M')
            ->margin(1)
            ->generate($qrText);

        return [
            'cedula'           => $usuario->cedula,
            'nombre_completo'  => $nombreCompleto,
            'rol'              => $usuario->rol,
            'email'            => $usuario->email,
            'estado'           => $usuario->estado ? 'ACTIVO' : 'DENEGADO',
            'facultad'         => $persona?->facultad ?? 'Administración Central',
            'carrera'          => $persona?->carrera ?? 'Gestión Deportiva UEB',
            'qr_token'         => $usuario->qr_token,
            'qr_svg'           => $qrSvgRaw, 
            'qr_base64'        => base64_encode($qrSvgRaw), 
            'qr_text'          => $qrText,
            'url_validacion'   => $qrText,
            'foto'             => $persona?->foto_url ?? $persona?->foto,
            'institucion'      => 'Gestor UEB - Acceso y Control',
        ];
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
