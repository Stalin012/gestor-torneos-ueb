<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Galeria;
use App\Models\Auditoria;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class GaleriaController extends Controller
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

    public function index()
    {
        $galeria = Galeria::orderBy('created_at', 'desc')->get();
        return response()->json($galeria);
    }

    public function store(Request $request)
    {
        $request->validate([
            'titulo'      => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'archivo'     => 'required|file|max:50000|mimes:jpg,jpeg,png,webp,gif,mp4,mov,mkv,avi,pdf,docx'
        ]);

        // Guardar archivo — ruta relativa: "galeria/nombre.jpg"
        // El frontend la sirve a través de /api/files/ (sin symlink)
        $path = $request->file('archivo')->store('galeria', 'public');

        $item = Galeria::create([
            'titulo'      => $request->titulo,
            'descripcion' => $request->descripcion,
            'imagen'      => $path, // Ruta relativa limpia
        ]);

        $this->logAudit(
            $request->user() ? $request->user()->cedula : 'SISTEMA',
            'CREAR',
            'Galeria',
            (string)$item->id,
            'Elemento de galería subido: ' . $item->titulo
        );

        return response()->json([
            'message' => 'Elemento subido con éxito.',
            'item'    => $item
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $item = Galeria::find($id);
        if (!$item) return response()->json(['message' => 'Elemento no encontrado'], 404);

        $request->validate([
            'titulo'      => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            'archivo'     => 'nullable|file|max:50000|mimes:jpg,jpeg,png,webp,gif,mp4,mov,mkv,avi,pdf,docx'
        ]);

        if ($request->hasFile('archivo')) {
            // Eliminar archivo anterior solo si la ruta NO tiene http (es ruta relativa)
            if ($item->imagen && !str_starts_with($item->imagen, 'http')) {
                Storage::disk('public')->delete($item->imagen);
            }

            // Guardar nuevo archivo con ruta relativa
            $item->imagen = $request->file('archivo')->store('galeria', 'public');
        }

        $item->titulo      = $request->titulo;
        $item->descripcion = $request->descripcion;
        $item->save();

        $this->logAudit(
            $request->user() ? $request->user()->cedula : 'SISTEMA',
            'ACTUALIZAR',
            'Galeria',
            (string)$item->id,
            'Elemento de galería actualizado: ' . $item->titulo
        );

        return response()->json([
            'message' => 'Elemento actualizado con éxito.',
            'item'    => $item
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $item = Galeria::find($id);
        if (!$item) return response()->json(['message' => 'Elemento no encontrado'], 404);

        // Eliminar archivo del disco solo si es ruta relativa
        if ($item->imagen && !str_starts_with($item->imagen, 'http')) {
            Storage::disk('public')->delete($item->imagen);
        }

        $item->delete();

        $this->logAudit(
            $request->user() ? $request->user()->cedula : 'SISTEMA',
            'ELIMINAR',
            'Galeria',
            (string)$id,
            'Elemento de galería eliminado: ' . $item->titulo
        );

        return response()->json(['message' => 'Elemento eliminado correctamente.']);
    }
}
