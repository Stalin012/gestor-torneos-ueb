<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Jugador;
use App\Models\Estadistica;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class JugadorController extends Controller
{
    // =============== CRUD BÁSICO (sin cambios) ==================

    public function index()
    {
        $jugadores = Jugador::with(['persona', 'equipo'])
            ->orderBy('cedula')
            ->paginate(15);

        return response()->json($jugadores);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'cedula'    => 'required|string|size:10|exists:personas,cedula|unique:jugadores,cedula',
            'equipo_id' => 'nullable|exists:equipos,id',
            'posicion'  => 'nullable|string|max:100',
            'numero'    => 'nullable|integer|min:0|max:99',
        ]);

        $jugador = Jugador::create($validated);
        $jugador->load(['persona', 'equipo']);

        return response()->json([
            'message' => 'Jugador creado correctamente.',
            'data'    => $jugador,
        ], 201);
    }

    public function show($cedula)
    {
        $jugador = Jugador::with(['persona', 'equipo'])->find($cedula);

        if (!$jugador) {
            return response()->json(['message' => 'Jugador no encontrado'], 404);
        }

        return response()->json($jugador);
    }

    public function update(Request $request, $cedula)
    {
        $jugador = Jugador::find($cedula);

        if (!$jugador) {
            return response()->json(['message' => 'Jugador no encontrado'], 404);
        }

        $validated = $request->validate([
            'equipo_id' => 'sometimes|nullable|exists:equipos,id',
            'posicion'  => 'sometimes|nullable|string|max:100',
            'numero'    => 'sometimes|nullable|integer|min:0|max:99',
            'victorias' => 'sometimes|integer|min:0',
            'derrotas'  => 'sometimes|integer|min:0',
            'empates'   => 'sometimes|integer|min:0',
        ]);

        $jugador->update($validated);
        $jugador->load(['persona', 'equipo']);

        return response()->json([
            'message' => 'Jugador actualizado correctamente.',
            'data'    => $jugador,
        ]);
    }

    public function destroy($cedula)
    {
        $jugador = Jugador::find($cedula);

        if (!$jugador) {
            return response()->json(['message' => 'Jugador no encontrado'], 404);
        }

        $jugador->delete();

        return response()->json([
            'message' => 'Jugador eliminado correctamente.',
        ]);
    }

    public function estadisticas($cedula)
    {
        $jugador = Jugador::with('persona')->find($cedula);

        if (!$jugador) {
            return response()->json(['message' => 'Jugador no encontrado'], 404);
        }

        $estadisticas = Estadistica::where('jugador_cedula', $cedula)->get();

        return response()->json([
            'jugador'       => $jugador,
            'estadisticas'  => $estadisticas,
        ]);
    }

    // =============== CARNET + QR (SVG, SIN IMAGICK) ==================

    /**
     * Arma todos los datos del carnet (para JSON y PDF), con QR en SVG.
     */
    private function buildCarnetData(Jugador $jugador): array
    {
        $persona = $jugador->persona;
        $equipo  = $jugador->equipo;

        $nombreCompleto = $persona
            ? trim(($persona->nombres ?? '') . ' ' . ($persona->apellidos ?? ''))
            : 'Sin nombre';

        $qrText = url("/api/jugadores/{$jugador->cedula}/carnet-pdf");

        $qrSvg = (string) QrCode::format('svg')
            ->size(60)
            ->margin(0)
            ->generate($qrText);

        return [
            'cedula'           => $jugador->cedula,
            'nombre_completo'  => $nombreCompleto,
            'edad'             => $persona?->edad_calculada ?? $persona?->edad ?? 'N/A',
            'fecha_nacimiento' => $persona?->fecha_nacimiento ? $persona->fecha_nacimiento->format('d/m/Y') : null,
            'foto'             => $persona?->foto_url ?? $persona?->foto,
            'carrera'          => $jugador->carrera ?? 'No especificada',
            'facultad'         => $jugador->facultad ?? 'No especificada',
            'nombre_equipo'    => $equipo?->nombre ?? 'Sin equipo',
            'posicion'         => $jugador->posicion ?? 'No asignada',
            'numero'           => $jugador->numero ?? 'S/N',
            'victorias'        => $jugador->victorias ?? 0,
            'derrotas'         => $jugador->derrotas ?? 0,
            'empates'          => $jugador->empates ?? 0,
            'fecha_generacion' => now()->format('d/m/Y'),
            'institucion'      => 'Gestor de Torneos Deportivos UEB',
            'qr_text'          => $qrText,
            'qr_svg'           => $qrSvg,
        ];
    }

    /**
     * POST /api/jugadores/{cedula}/generar-carnet
     * Devuelve datos para el modal, incluyendo el QR SVG como string.
     */
    public function generarCarnet($cedula)
    {
        $jugador = Jugador::with(['persona', 'equipo'])->find($cedula);

        if (!$jugador) {
            return response()->json([
                'message' => 'Jugador no encontrado con la cédula proporcionada.'
            ], 404);
        }

        $data = $this->buildCarnetData($jugador);

        return response()->json([
            'message' => 'Datos del carnet generados correctamente.',
            'data'    => $data, 
        ]);
    }

    /**
     * GET /api/jugadores/{cedula}/carnet-pdf
     * Genera el PDF con diseño de carnet y QR SVG.
     */
    public function carnetPdf($cedula)
    {
        $jugador = Jugador::with(['persona', 'equipo'])->find($cedula);

        if (!$jugador) {
            abort(404, 'Jugador no encontrado.');
        }

        $data = $this->buildCarnetData($jugador);

        $pdf = Pdf::loadView('pdf.carnet_jugador', compact('jugador') + ['qrCode' => $data['qr_svg']])
            ->setPaper([0, 0, 242.65, 153.07], 'landscape');

        return $pdf->download('Carnet_'.$jugador->cedula.'.pdf');
    }
}