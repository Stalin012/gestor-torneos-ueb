<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Jugador;
use Illuminate\Support\Str;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class CarnetController extends Controller
{
    /**
     * INFO DEL CARNET (PARA JUGADOR Y ADMIN)
     */
    public function info(string $cedula)
    {
        $jugador = Jugador::with(['persona', 'equipo'])
            ->where('cedula', $cedula)
            ->firstOrFail();

        if (!$jugador->qr_token) {
            $jugador->qr_token = (string) Str::uuid();
            $jugador->qr_generated_at = now();
            $jugador->save();
        }

        $urlValidacion = url("/validar-carnet/{$jugador->qr_token}");

        // 🔥 QR EN SVG (IGUAL QUE ADMIN)
        $qrSvg = QrCode::format('svg')
            ->size(160)
            ->generate($urlValidacion);

        return response()->json([
            'data' => [
                'cedula' => $jugador->cedula,
                'nombre_completo' => trim(
                    ($jugador->persona->nombres ?? '') . ' ' .
                    ($jugador->persona->apellidos ?? '')
                ),
                'nombre_equipo' => $jugador->equipo->nombre ?? null,
                'posicion' => $jugador->posicion,
                'numero' => $jugador->numero,
                'fecha_generacion' => now()->format('d/m/Y'),
                'institucion' => 'Universidad Estatal de Bolívar',
                'foto' => $jugador->persona->foto ?? null,
                'url_validacion' => $urlValidacion,

                // 🔥 CLAVE
                'qr_svg' => $qrSvg,
            ]
        ]);
    }

    /**
     * VALIDAR CARNET MEDIANTE QR TOKEN
     */
    public function validar(string $token)
    {
        $jugador = Jugador::with(['persona', 'equipo'])
            ->where('qr_token', $token)
            ->firstOrFail();

        return view('carnet.valido', [
            'jugador' => $jugador,
            'persona' => $jugador->persona,
            'equipo' => $jugador->equipo,
            'fecha' => $jugador->qr_generated_at?->format('d/m/Y') ?? now()->format('d/m/Y'),
        ]);
    }
}
