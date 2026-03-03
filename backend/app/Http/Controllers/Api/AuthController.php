<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Persona;
use App\Models\Torneo;
use App\Models\Equipo;
use App\Models\Partido;
use App\Models\Estadistica;
use App\Models\Auditoria;
use App\Models\Jugador;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
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
    private function validarCedulaEcuatoriana(string $cedula): bool
    {
        if (!preg_match('/^\d{10}$/', $cedula)) {
            return false;
        }

        $provincia = (int) substr($cedula, 0, 2);
        if ($provincia < 1 || ($provincia > 24 && $provincia != 30)) {
            return false;
        }

        $tercerDigito = (int) substr($cedula, 2, 1);
        // Sólo se validan cédulas de personas naturales (0-5)
        if ($tercerDigito >= 6) {
            return false;
        }

        $coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
        $suma = 0;

        for ($i = 0; $i < 9; $i++) {
            $valor = (int) $cedula[$i] * $coeficientes[$i];
            if ($valor >= 10) {
                $valor -= 9;
            }
            $suma += $valor;
        }

        $digitoVerificadorCalculado = 10 - ($suma % 10);
        if ($digitoVerificadorCalculado == 10) {
            $digitoVerificadorCalculado = 0;
        }

        $digitoVerificadorReal = (int) $cedula[9];

        return $digitoVerificadorCalculado === $digitoVerificadorReal;
    }

    public function register(Request $request)
{
    $validated = $request->validate([
        'cedula'    => ['required','string','size:10','regex:/^\d{10}$/'],
        'nombres'   => ['required','string','max:100'],
        'apellidos' => ['required','string','max:100'],
        'email'     => [
            'required',
            'email',
            'max:100',
            // El email debe ser único en personas, pero ignoramos si ya le pertenece a esta cédula
            Rule::unique('personas', 'email')->ignore($request->cedula, 'cedula')
        ],
        'password'  => ['required','string','min:8','confirmed'],
        'rol'       => ['nullable','string','in:jugador,representante'],
    ], [
        'cedula.required' => 'El campo cédula es obligatorio.',
        'cedula.size' => 'La cédula debe tener exactamente 10 caracteres.',
        'cedula.regex' => 'El formato de la cédula es inválido.',
        'nombres.required' => 'El campo nombres es obligatorio.',
        'apellidos.required' => 'El campo apellidos es obligatorio.',
        'email.required' => 'El campo correo es obligatorio.',
        'email.email' => 'El formato del correo es inválido.',
        'email.unique' => 'El correo ya existe en nuestros registros.',
        'password.required' => 'El campo contraseña es obligatorio.',
        'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
        'password.confirmed' => 'La confirmación de la contraseña no coincide.',
    ]);

    if (!$this->validarCedulaEcuatoriana($validated['cedula'])) {
        return response()->json([
            'message' => 'La cédula ingresada no es válida para Ecuador.',
            'errors'  => ['cedula' => ['La cédula ingresada no es matemáticamente válida.']],
        ], 422);
    }

    try {
        // 1. Verificar si el usuario ya existe en la tabla de acceso
        if (User::where('cedula', $validated['cedula'])->exists()) {
            return response()->json([
                'message' => 'La cédula ya se encuentra registrada como usuario.',
                'errors'  => ['cedula' => ['La cédula ya se encuentra registrada.']],
            ], 409);
        }

        DB::beginTransaction();

        // 2. Garantizar que exista el registro en la tabla 'personas' (Requisito de FK)
        $persona = Persona::where('cedula', $validated['cedula'])->first();
        if (!$persona) {
            $persona = Persona::create([
                'cedula'    => $validated['cedula'],
                'nombres'   => $validated['nombres'],
                'apellidos' => $validated['apellidos'],
                'email'     => $validated['email']
            ]);
        }

        // 3. Crear el usuario (Eloquent)
        // Para evitar el bug de conversión booleana de PDO en Supabase (donde manda '1' en vez de 'TRUE')
        // inyectamos el valor nativo TRUE usando DB::raw.
        $user = User::create([
            'cedula'    => $validated['cedula'],
            'nombres'   => $validated['nombres'],
            'apellidos' => $validated['apellidos'],
            'email'     => $validated['email'],
            'password'  => Hash::make($validated['password']),
            'rol'       => $validated['rol'] ?? 'jugador',
            'estado'    => \Illuminate\Support\Facades\DB::raw('TRUE'), // 👈 Corrección final para Hostinger/Supabase
        ]);

        DB::commit();


        // Auditoría
        try {
            $rolAudit = $validated['rol'] ?? 'jugador';
            $this->logAudit(
                $user->cedula,
                'REGISTRO_SISTEMA',
                'Usuario',
                $user->cedula,
                "Auto-registro de nuevo {$rolAudit}: " . $user->email
            );
        } catch (\Exception $ae) {}

        // Token de sesión inmediata
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Cuenta creada exitosamente.',
            'user'    => $user->load('persona'),
            'token'   => $token,
        ], 201);

    } catch (\Throwable $e) {
        DB::rollBack();
        Log::error('Error crítico en register: ' . $e->getMessage(), [
            'cedula' => $request->cedula,
            'trace' => $e->getTraceAsString()
        ]);

        return response()->json([
            'message' => 'No se pudo completar el registro.',
            'error'   => $e->getMessage(),
        ], 500);
    }
}


    /**
     * Login (cedula o email)
     */
    public function login(Request $request)
    {
        try {
            $identificador = trim($request->input('login') ?: $request->input('email'));
            $campo = filter_var($identificador, FILTER_VALIDATE_EMAIL) ? 'email' : 'cedula';

            // 🔑 TRIM REAL EN POSTGRESQL PARA EVITAR ESPACIOS EN BLANCO
            $user = User::whereRaw("TRIM({$campo}) = ?", [trim($identificador)])->first();

            if (!$user || !Hash::check($request->password, $user->password)) {
                return response()->json(['message' => 'Credenciales incorrectas'], 401);
            }

            if (!$user->estado) {
                return response()->json(['message' => 'Usuario inactivo'], 403);
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Sesión iniciada correctamente',
                'user'    => $user->load('persona'),
                'token'   => $token,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error en Login API: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function user(Request $request)
    {
        return response()->json(
            $request->user()->load(['persona', 'jugador'])
        );
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        $this->logAudit(
            $request->user()->cedula,
            'LOGOUT',
            'Usuario',
            $request->user()->cedula,
            'Cierre de sesión de usuario: ' . $request->user()->email
        );

        return response()->json(['message' => 'Sesión cerrada']);
    }

    /**
     * Dashboard admin
     */
    public function adminDashboard(Request $request)
    {
        if ($request->user()->rol !== 'admin') {
            return response()->json(['message' => 'Acceso denegado'], 403);
        }

        try {
            $data = [
                'usuarios_totales'   => User::count(),
                'usuarios_activos'   => User::where('estado', true)->count(),
                'usuarios_inactivos' => User::where('estado', false)->count(),
                'total_torneos'      => Torneo::count(),
                'total_equipos'      => Equipo::count(),
                'total_partidos'     => Partido::count(),
                'partidos_finalizados' => Partido::whereNotNull('marcador_local')
                    ->whereNotNull('marcador_visitante')->count(),
                'goles_totales' => Estadistica::sum('goles'),
            ];

            return response()->json([
                'message' => 'Dashboard cargado.',
                'data'    => $data,
            ]);

        } catch (\Throwable $e) {
            Log::error('Error en adminDashboard', ['error' => $e->getMessage()]);

            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function reportes(Request $request)
    {
        if ($request->user()->rol !== 'admin') {
            return response()->json(['message' => 'Acceso denegado'], 403);
        }

        try {
            $torneosPorDeporte = DB::table('torneos')
                ->join('deportes', 'torneos.deporte_id', '=', 'deportes.id')
                ->select('deportes.nombre as deporte', DB::raw('COUNT(torneos.id) as total'))
                ->groupBy('deportes.nombre')
                ->get();

            $goleadores = Estadistica::select(
                'jugador_cedula',
                DB::raw('SUM(goles) as total_goles')
            )
                ->groupBy('jugador_cedula')
                ->orderByDesc('total_goles')
                ->limit(10)
                ->get()
                ->map(function ($g) {
                    $p = Persona::find($g->jugador_cedula);

                    return [
                        'cedula' => $g->jugador_cedula,
                        'nombre' => $p ? $p->nombres . ' ' . $p->apellidos : 'Desconocido',
                        'goles'  => $g->total_goles,
                    ];
                });

            return response()->json([
                'message' => 'Reportes generados',
                'data'    => [
                    'torneos_por_deporte' => $torneosPorDeporte,
                    'top_goleadores'      => $goleadores,
                ],
            ]);

        } catch (\Throwable $e) {
            Log::error('Error en reportes', ['error' => $e->getMessage()]);

            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
