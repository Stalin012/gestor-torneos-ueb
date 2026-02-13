<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Galeria;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class GaleriaController extends Controller
{
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

        // Guardar archivo
        $path = $request->file('archivo')->store('galeria', 'public');
        $url = Storage::url($path);

        $item = Galeria::create([
            'titulo'      => $request->titulo,
            'descripcion' => $request->descripcion,
            'imagen'      => $url, // Guardamos URL pública
        ]);

        return response()->json([
            'message' => 'Elemento subido con éxito.',
            'item' => $item
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

        // Si envía archivo nuevo >> eliminar anterior
        if ($request->hasFile('archivo')) {
            if ($item->imagen) {
                $oldPath = str_replace('/storage/', '', $item->imagen);
                Storage::disk('public')->delete($oldPath);
            }

            $path = $request->file('archivo')->store('galeria', 'public');
            $item->imagen = Storage::url($path);
        }

        $item->titulo = $request->titulo;
        $item->descripcion = $request->descripcion;
        $item->save();

        return response()->json([
            'message' => 'Elemento actualizado con éxito.',
            'item'     => $item
        ]);
    }

    public function destroy($id)
    {
        $item = Galeria::find($id);
        if (!$item) return response()->json(['message' => 'Elemento no encontrado'], 404);

        if ($item->imagen) {
            $oldPath = str_replace('/storage/', '', $item->imagen);
            Storage::disk('public')->delete($oldPath);
        }

        $item->delete();

        return response()->json(['message' => 'Elemento eliminado correctamente.']);
    }
}
