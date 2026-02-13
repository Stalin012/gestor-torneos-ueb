<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Jugador;
use App\Models\Estadistica;
use App\Models\Auditoria;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class JugadorController extends Controller
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
    // =============== CRUD BÁSICO (sin cambios) ==================

    public function index(Request $request)
    {
        $query = Jugador::with(['persona', 'equipo']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('cedula', 'like', "%{$search}%")
                  ->orWhereHas('persona', function ($q) use ($search) {
                      $q->where('nombres', 'like', "%{$search}%")
                        ->orWhere('apellidos', 'like', "%{$search}%");
                  });
        }

        $jugadores = $query->orderBy('cedula')->get();

        return response()->json($jugadores);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'cedula'    => 'required|string|size:10|exists:personas,cedula|unique:jugadores,cedula',
            'equipo_id' => 'nullable|exists:equipos,id',
            'carrera'   => 'nullable|string|max:150',
            'facultad'  => 'nullable|string|max:150',
            'posicion'  => 'nullable|string|max:100',
            'numero'    => 'nullable|integer|min:0|max:99',
        ]);

        $jugador = Jugador::create($validated);
        $jugador->load(['persona', 'equipo']);

        $this->logAudit(
            $request->user() ? $request->user()->cedula : 'SISTEMA',
            'CREAR',
            'Jugador',
            $jugador->cedula,
            'Jugador creado: ' . $jugador->persona->nombre_completo
        );

        return response()->json([
            'message' => 'Jugador creado correctamente.',
            'data'    => $jugador,
        ], 201);
    }

    public function show($cedula)
    {
        \Log::info("Intentando buscar jugador con cédula: {$cedula}");
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
            'carrera'   => 'nullable|string|max:150',
            'facultad'  => 'nullable|string|max:150',
            'equipo_id' => 'sometimes|nullable|exists:equipos,id',
            'posicion'  => 'sometimes|nullable|string|max:100',
            'numero'    => 'sometimes|nullable|integer|min:0|max:99',
            'victorias' => 'sometimes|integer|min:0',
            'derrotas'  => 'sometimes|integer|min:0',
            'empates'   => 'sometimes|integer|min:0',
        ]);

        $jugador->update($validated);
        $jugador->load(['persona', 'equipo']);

        $this->logAudit(
            $request->user() ? $request->user()->cedula : 'SISTEMA',
            'ACTUALIZAR',
            'Jugador',
            $jugador->cedula,
            'Jugador actualizado: ' . $jugador->persona->nombre_completo
        );

        return response()->json([
            'message' => 'Jugador actualizado correctamente.',
            'data'    => $jugador,
        ]);
    }

    public function destroy(Request $request, $cedula)
    {
        $jugador = Jugador::find($cedula);

        if (!$jugador) {
            return response()->json(['message' => 'Jugador no encontrado'], 404);
        }

        $jugador->delete();

        $this->logAudit(
            $request->user() ? $request->user()->cedula : 'SISTEMA',
            'ELIMINAR',
            'Jugador',
            $cedula,
            'Jugador eliminado: ' . $jugador->persona->nombre_completo
        );

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
        // Cargar relaciones necesarias si no están cargadas
        $jugador->loadMissing(['persona', 'equipo.categoria']);
        
        $persona = $jugador->persona;
        $equipo  = $jugador->equipo;

        // Asegurar que el jugador tenga un token de validación
        if (!$jugador->qr_token) {
            $jugador->qr_token = (string) \Illuminate\Support\Str::uuid();
            $jugador->qr_generated_at = now();
            $jugador->save();
        }

        $nombreCompleto = $persona
            ? trim(($persona->nombres ?? '') . ' ' . ($persona->apellidos ?? ''))
            : 'Sin nombre';

        // URL oficial de validación (debe coincidir con la ruta pública del frontend)
        $frontendUrl = config('app.frontend_url', 'http://localhost:5173');
        $qrText = rtrim($frontendUrl, '/') . "/carnet/{$jugador->cedula}";

        $qrSvgRaw = (string) QrCode::format('svg')
            ->size(200)
            ->margin(0)
            ->generate($qrText);

        return [
            'cedula'           => $jugador->cedula,
            'nombre_completo'  => $nombreCompleto,
            'nombre_equipo'    => $equipo?->nombre ?? 'Sin equipo',
            'categoria'        => $equipo?->categoria?->nombre ?? 'General',
            'facultad'         => $jugador->facultad,
            'carrera'          => $jugador->carrera,
            'posicion'         => $jugador->posicion ?? 'No asignada',
            'numero'           => $jugador->numero ?? 'S/N',
            'qr_token'         => $jugador->qr_token,
            'qr_svg'           => $qrSvgRaw, // Raw para React
            'qr_base64'        => base64_encode($qrSvgRaw), // Para PDF
            'qr_text'          => $qrText,
            'foto'             => $persona?->foto_url ?? $persona?->foto,
            'edad'             => $persona?->edad_calculada ?? 'N/A',
            'institucion'      => 'Gestor UEB - Deporte oficial',
        ];
    }

    /**
     * POST /api/jugadores/{cedula}/generar-carnet
     * Devuelve datos para el modal, incluyendo el QR SVG como string.
     */
    public function generarCarnet($cedula)
    {
        $jugador = Jugador::with(['persona', 'equipo.categoria'])->find($cedula);

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
        \Log::info("Intentando generar carnet PDF para cédula: {$cedula}");
        try {
            $jugador = Jugador::with(['persona', 'equipo'])->find($cedula);

            if (!$jugador) {
                abort(404, 'Jugador no encontrado.');
            }

            $data = $this->buildCarnetData($jugador);

            $pdf = Pdf::loadView('pdf.carnet_jugador', compact('jugador') + ['qrCode' => $data['qr_base64']])
                ->setPaper([0, 0, 242.65, 153.07], 'landscape');

            return $pdf->download('Carnet_'.$jugador->cedula.'.pdf');
        } catch (\Exception $e) {
            \Log::error("Error al generar PDF para cédula {$cedula}: " . $e->getMessage());
            
            return response()->json([
                'message' => 'Error al generar el PDF del carnet.',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }
}