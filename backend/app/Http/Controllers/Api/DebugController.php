<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DebugController extends Controller
{
    public function inspectTables()
    {
        try {
            $tables = ['usuarios', 'personas', 'auditoria'];
            $results = [];

            foreach ($tables as $table) {
                $columns = DB::select("
                    SELECT column_name, data_type, is_nullable, column_default
                    FROM information_schema.columns 
                    WHERE table_name = ?
                    ORDER BY ordinal_position
                ", [$table]);
                
                $results[$table] = $columns;
            }

            return response()->json($results);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function inspectAndFixStorage()
    {
        try {
            $paths = ['perfiles', 'fotos', 'carnets'];
            $results = [];

            foreach ($paths as $path) {
                $fullPath = storage_path('app/public/' . $path);
                
                if (!file_exists($fullPath)) {
                    mkdir($fullPath, 0777, true);
                    $results[$path] = "Creada";
                } else {
                    chmod($fullPath, 0777);
                    $results[$path] = "Permisos corregidos (0777)";
                }
            }

            return response()->json([
                'status' => 'success',
                'results' => $results,
                'storage_writable' => is_writable(storage_path('app/public'))
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function fixSequences()
    {
        try {
            $tables = ['categorias', 'deportes', 'torneos', 'equipos', 'jugadores', 'inscripciones', 'partidos', 'notificaciones', 'noticias', 'galeria', 'auditoria'];
            $results = [];

            foreach ($tables as $table) {
                try {
                    // Postgres specific sequence fix
                    $maxId = DB::table($table)->max('id') ?: 0;
                    $seqName = "{$table}_id_seq";
                    
                    DB::statement("SELECT setval(?, ?, true)", [$seqName, $maxId]);
                    
                    $results[$table] = "Sequence reset to $maxId";
                } catch (\Exception $ex) {
                    $results[$table] = "Error: " . $ex->getMessage();
                }
            }

            return response()->json([
                'status' => 'success',
                'results' => $results
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
