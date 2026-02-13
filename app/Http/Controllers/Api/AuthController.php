<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Usuario;
use App\Models\Persona;
use App\Models\Torneo;
use App\Models\Equipo;
use App\Models\Partido;
use App\Models\Estadistica;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
  public function register(Request $request)
{
    $validated = $request->validate([
        'cedula'    => ['required','string','size:10','regex:/^\d{10}$/'],
        'nombres'   => ['required','string','max:100'],
        'apellidos' => ['required','string','max:100'],
        'email'     => ['required','email','max:100','unique:usuarios,email'],
        'password'  => ['required','string','min:8','confirmed'],
        // opcional: si quieres permitir registrar representante desde el formulario
        'rol'       => ['nullable','string','in:usuario,representante'],
    ]);

    try {
        DB::beginTransaction();

        // 1) Persona: si ya existe, actualiza nombres/apellidos
        $persona = Persona::updateOrCreate(
            ['cedula' => $validated['cedula']],
            [
                'nombres'   => $validated['nombres'],
                'apellidos' => $validated['apellidos'],
            ]
        );

        // 2) Usuario: evita duplicado por cédula
        $existingUser = Usuario::where('cedula', $validated['cedula'])->first();
        if ($existingUser) {
            DB::rollBack();
            return response()->json([
                'message' => 'Ya existe un usuario registrado con esta cédula.',
                'errors'  => ['cedula' => ['Ya existe un usuario con esta cédula.']]
            ], 422);
        }

        // 3) Crear usuario
        $user = Usuario::create([
            'cedula'   => $validated['cedula'],
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']),
            'rol'      => $validated['rol'] ?? 'usuario',
            'estado'   => true,
        ]);

        DB::commit();

        // 4) Token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registrado correctamente.',
            'user'    => $user->load('persona'),
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

        $user = Usuario::where($campo, $identificador)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Credenciales incorrectas'], 401);
        }

        if (!$user->estado) {
            return response()->json(['message' => 'Usuario inactivo'], 403);
        }

        // Reemplazar token anterior
        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

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
                'usuarios_totales'   => Usuario::count(),
                'usuarios_activos'   => Usuario::where('estado', true)->count(),
                'usuarios_inactivos' => Usuario::where('estado', false)->count(),
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
