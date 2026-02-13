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
  public function register(Request $request)
{
    $validated = $request->validate([
        'cedula'    => ['required','string','size:10','regex:/^\d{10}$/'],
        'nombres'   => ['required','string','max:100'],
        'apellidos' => ['required','string','max:100'],
        'email'     => ['required','email','max:100','unique:personas,email'],
        'password'  => ['required','string','min:8','confirmed'],
        // opcional: si quieres permitir registrar representante desde el formulario
        'rol'       => ['nullable','string','in:usuario,representante'],
    ]);

    try {
        DB::beginTransaction();

        // Crear usuario directamente (User ya es la tabla personas)
        $user = User::updateOrCreate(
            ['cedula' => $validated['cedula']],
            [
                'nombres'   => $validated['nombres'],
                'apellidos' => $validated['apellidos'],
                'email'    => $validated['email'],
                'password' => Hash::make($validated['password']),
                'rol'      => $validated['rol'] ?? 'usuario',
                'estado'   => true,
            ]
        );

        DB::commit();

        $this->logAudit(
            $user->cedula,
            'CREAR',
            'Usuario',
            $user->cedula,
            'Registro de nuevo usuario: ' . $user->email
        );

        // 4) Token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registrado correctamente.',
            'user'    => $user,
            'token'   => $token,
        ], 201);

    } catch (\Throwable $e) {
        DB::rollBack();
        Log::error('Error en register', ['error' => $e->getMessage()]);

        return response()->json([
            'message' => 'Error al registrar.',
            'error'   => $e->getMessage(),
        ], 500);
    }
}


    /**
     * Login (cedula o email)
     */
    public function login(Request $request)
    {
        $identificador = $request->input('login') ?: $request->input('email');
        $campo = filter_var($identificador, FILTER_VALIDATE_EMAIL) ? 'email' : 'cedula';

        $user = User::where($campo, $identificador)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Credenciales incorrectas'], 401);
        }

        if (!$user->estado) {
            return response()->json(['message' => 'Usuario inactivo'], 403);
        }

        // Reemplazar token anterior
            // $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        $this->logAudit(
            $user->cedula,
            'LOGIN',
            'Usuario',
            $user->cedula,
            'Inicio de sesión de usuario: ' . $user->email
        );

        return response()->json([
            'message' => 'Login exitoso',
            'user'    => $user->load('persona'),
            'token'   => $token,
        ]);
    }

    public function user(Request $request)
    {
        return response()->json(
            $request->user()->load('persona')
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
