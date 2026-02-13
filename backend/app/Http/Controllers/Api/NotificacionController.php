<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NotificacionController extends Controller
{
    public function index(Request $request)
    {
        $notificaciones = DB::table('notificaciones')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();
            
        return response()->json($notificaciones);
    }
}