<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Auditoria;
use Illuminate\Http\Request;

class AuditoriaController extends Controller
{
    /**
     * GET /api/auditoria
     * Listado paginado de auditoría (solo admin).
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Ajusta el rol según tus valores reales ('admin', 'SuperAdmin', etc.)
        // if (!$user || $user->rol !== 'admin') {
        //     return response()->json(['message' => 'Acceso denegado.'], 403);
        // }

        $query = Auditoria::with(['usuario.persona'])
            ->orderBy('timestamp', 'desc');

        // Filtro por búsqueda opcional ?q=...
        // if ($search = $request->get('q')) {
        //     $search = mb_strtolower($search);

        //     $query->where(function ($q) use ($search) {
        //         $q->whereRaw('LOWER(accion) LIKE ?', ["%{$search}%"])
        //           ->orWhereRaw('LOWER(entidad) LIKE ?', ["%{$search}%"])
        //           ->orWhereRaw('LOWER(entidad_id) LIKE ?', ["%{$search}%"])
        //           ->orWhereRaw('LOWER(detalle) LIKE ?', ["%{$search}%"])
        //           ->orWhereRaw('LOWER(usuario_cedula) LIKE ?', ["%{$search}%"]);
        //     });
        // }

        // Filtro por acción
        // if ($filterAction = $request->get('filterAction')) {
        //     $query->where('accion', $filterAction);
        // }

        // Filtro por entidad
        // if ($filterEntity = $request->get('filterEntity')) {
        //     $query->where('entidad', $filterEntity);
        // }

        // Filtro por rango de fechas
        // if ($startDate = $request->get('startDate')) {
        //     $query->where('timestamp', '>=', $startDate);
        // }
        // if ($endDate = $request->get('endDate')) {
        //     $query->where('timestamp', '<=', $endDate . ' 23:59:59'); // Incluye todo el día final
        // }

        $auditoria = $query->get();

        return response()->json($auditoria);
    }
}
