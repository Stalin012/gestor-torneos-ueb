<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Noticia;
use App\Models\Auditoria;
use Illuminate\Http\Request;

class NoticiaController extends Controller
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
    /**
     * Display a listing of the resource.
     * Muestra una lista de todas las noticias.
     */
    public function index()
    {
        $noticias = Noticia::orderBy('created_at', 'desc')->get();
        return response()->json($noticias);
    }

    /**
     * Store a newly created resource in storage.
     * Crea una nueva noticia. (Solo para Admin)
     */
    public function store(Request $request)
    {
        // Asumiendo que solo administradores pueden publicar noticias
        if ($request->user()->rol !== 'admin') {
            return response()->json(['message' => 'Acceso denegado. Solo Administradores pueden publicar.'], 403);
        }

        $request->validate([
            'titulo' => 'required|string|max:255',
            'contenido' => 'required|string',
            'imagen' => 'nullable|string|url', // Asume que se guarda la URL de la imagen
        ]);

        $noticia = Noticia::create($request->all());

        $this->logAudit(
            $request->user() ? $request->user()->cedula : 'SISTEMA',
            'CREAR',
            'Noticia',
            (string)$noticia->id,
            'Noticia creada: ' . $noticia->titulo
        );

        return response()->json([
            'message' => 'Noticia publicada exitosamente.',
            'noticia' => $noticia
        ], 201);
    }

    /**
     * Display the specified resource.
     * Muestra una noticia específica.
     */
    public function show($id)
    {
        $noticia = Noticia::find($id);

        if (!$noticia) {
            return response()->json(['message' => 'Noticia no encontrada.'], 404);
        }

        return response()->json($noticia);
    }

    /**
     * Update the specified resource in storage.
     * Actualiza una noticia existente. (Solo para Admin)
     */
    public function update(Request $request, $id)
    {
        if ($request->user()->rol !== 'admin') {
            return response()->json(['message' => 'Acceso denegado.'], 403);
        }

        $noticia = Noticia::find($id);
        if (!$noticia) {
            return response()->json(['message' => 'Noticia no encontrada.'], 404);
        }
        
        $request->validate([
            'titulo' => 'required|string|max:255',
            'contenido' => 'required|string',
            'imagen' => 'nullable|string|url',
        ]);

        $noticia->update($request->all());

        $this->logAudit(
            $request->user() ? $request->user()->cedula : 'SISTEMA',
            'ACTUALIZAR',
            'Noticia',
            (string)$noticia->id,
            'Noticia actualizada: ' . $noticia->titulo
        );

        return response()->json([
            'message' => 'Noticia actualizada exitosamente.',
            'noticia' => $noticia
        ]);
    }

    /**
     * Remove the specified resource from storage.
     * Elimina una noticia. (Solo para Admin)
     */
    public function destroy(Request $request, $id)
    {
        if ($request->user()->rol !== 'admin') {
            return response()->json(['message' => 'Acceso denegado.'], 403);
        }
        
        $noticia = Noticia::find($id);

        if (!$noticia) {
            return response()->json(['message' => 'Noticia no encontrada.'], 404);
        }

        $noticia->delete();
        
        $this->logAudit(
            $request->user() ? $request->user()->cedula : 'SISTEMA',
            'ELIMINAR',
            'Noticia',
            (string)$id,
            'Noticia eliminada: ' . $noticia->titulo
        );
        
        return response()->json(['message' => 'Noticia eliminada exitosamente.']);
    }
}