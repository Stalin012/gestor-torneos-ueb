<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\Notificacion;

class NotificacionController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) return response()->json([]);
            
            $cedula = trim($user->cedula);
            
            $notificaciones = DB::table('notificaciones')
                ->where(function($query) use ($cedula) {
                    $query->whereRaw("TRIM(usuario_cedula) = ?", [$cedula])
                          ->orWhereNull('usuario_cedula');
                })
                ->orderBy('created_at', 'desc')
                ->limit(50)
                ->get();

            // Aseguramos que 'leida' sea booleano real para React, especialmente en PostgreSQL
            return response()->json($notificaciones->map(function($n) {
                $n->leida = filter_var($n->leida, FILTER_VALIDATE_BOOLEAN);
                return $n;
            }));
        } catch (\Exception $e) {
            Log::error("Error en index notificaciones: " . $e->getMessage());
            return response()->json(['error' => 'Error de servidor: ' . $e->getMessage()], 500);
        }
    }

    public function markAsRead(Request $request, $id)
    {
        try {
            $user = $request->user();
            $cedula = trim($user->cedula);

            // Actualización directa usando Query Builder
            DB::table('notificaciones')
                ->where('id', (int)$id)
                ->where(function($query) use ($cedula) {
                    $query->whereRaw("TRIM(usuario_cedula) = ?", [$cedula])
                          ->orWhereNull('usuario_cedula');
                })
                ->update([
                    'leida' => DB::raw('true'),
                    'updated_at' => now()
                ]);

            return response()->json(['status' => 'success', 'message' => 'Notificación leída']);
        } catch (\Exception $e) {
            Log::error("Error en markAsRead: " . $e->getMessage());
            // Devolvemos el error real para verlo en la consola del navegador
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function markAllAsRead(Request $request)
    {
        try {
            $user = $request->user();
            $cedula = trim($user->cedula);

            DB::table('notificaciones')
                ->where(function($query) use ($cedula) {
                    $query->whereRaw("TRIM(usuario_cedula) = ?", [$cedula])
                          ->orWhereNull('usuario_cedula');
                })
                ->update([
                    'leida' => DB::raw('true'),
                    'updated_at' => now()
                ]);

            return response()->json(['status' => 'success', 'message' => 'Todas marcadas como leídas']);
        } catch (\Exception $e) {
            Log::error("Error en markAllAsRead: " . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $id = DB::table('notificaciones')->insertGetId([
                'titulo' => $request->titulo,
                'mensaje' => $request->mensaje,
                'tipo' => $request->tipo,
                'usuario_cedula' => $request->usuario_cedula,
                'leida' => DB::raw('false'),
                'created_at' => now(),
                'updated_at' => now()
            ]);
            return response()->json(['id' => $id], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
