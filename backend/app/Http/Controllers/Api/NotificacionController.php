<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NotificacionController extends Controller
{
    public function index(Request $request)
    {
        $usuario = $request->user();
        
        $notificaciones = DB::table('notificaciones')
            ->where(function($query) use ($usuario) {
                $query->where('usuario_cedula', $usuario->cedula)
                      ->orWhereNull('usuario_cedula'); // Notificaciones globales
            })
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();
            
        return response()->json($notificaciones);
    }
    
    public function store(Request $request)
    {
        try {
            $request->validate([
                'titulo' => 'required|string|max:255',
                'mensaje' => 'required|string',
                'tipo' => 'required|in:success,error,warning,info',
                'usuario_cedula' => 'nullable|string|exists:usuarios,cedula'
            ]);
            
            $notificacion = DB::table('notificaciones')->insertGetId([
                'titulo' => $request->titulo,
                'mensaje' => $request->mensaje,
                'tipo' => $request->tipo,
                'usuario_cedula' => $request->usuario_cedula,
                'created_at' => now(),
                'updated_at' => now()
            ]);
            
            return response()->json(['id' => $notificacion, 'message' => 'Notificación creada']);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Error de validación al crear notificación:', ['errors' => $e->errors(), 'request_data' => $request->all()]);
            return response()->json(['message' => 'Error de validación', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            \Log::error('Error inesperado al crear notificación:', ['error' => $e->getMessage(), 'request_data' => $request->all()]);
            return response()->json(['message' => 'Error interno del servidor'], 500);
        }
    }
    
    public function markAsRead(Request $request, $id)
    {
        DB::table('notificaciones')
            ->where('id', $id)
            ->where(function($query) use ($request) {
                $query->where('usuario_cedula', $request->user()->cedula)
                      ->orWhereNull('usuario_cedula');
            })
            ->update(['leida' => true, 'updated_at' => now()]);
            
        return response()->json(['message' => 'Notificación marcada como leída']);
    }
    
    public function markAllAsRead(Request $request)
    {
        $usuario = $request->user();
        
        DB::table('notificaciones')
            ->where(function($query) use ($usuario) {
                $query->where('usuario_cedula', $usuario->cedula)
                      ->orWhereNull('usuario_cedula');
            })
            ->update(['leida' => true, 'updated_at' => now()]);
            
        return response()->json(['message' => 'Todas las notificaciones marcadas como leídas']);
    }
}
