<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use App\Models\Auditoria;

class LoginController extends Controller
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

    public function login(Request $request)
    {
        try {
            $identificador = $request->input('login') ?: $request->input('email');
            $campo = filter_var($identificador, FILTER_VALIDATE_EMAIL) ? 'email' : 'cedula';

            $user = User::where($campo, $identificador)->first();

            if (!$user || !Hash::check($request->password, $user->password)) {
                return response()->json(['message' => 'Credenciales incorrectas'], 401);
            }

            if (!$user->estado) {
                return response()->json(['message' => 'Usuario inactivo'], 403);
            }

            // Crear token
            $token = $user->createToken('auth_token')->plainTextToken;

            // Intentar auditoría (si falla, que no detenga el login)
            try {
                $this->logAudit(
                    $user->cedula,
                    'LOGIN',
                    'Usuario',
                    $user->cedula,
                    'Inicio de sesión de usuario: ' . $user->email
                );
            } catch (\Exception $e) {
                // Silenciamos el error de auditoría para permitir el login
            }

            return response()->json([
                'success' => true,
                'message' => 'Sesión iniciada correctamente',
                'user'    => $user->load('persona'),
                'token'   => $token,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error en Login Web: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Lo sentimos, ha ocurrido un error al intentar iniciar sesión. Por favor, intente de nuevo más tarde.',
            ], 500);
        }
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
}