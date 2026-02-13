<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Configuracion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ConfiguracionController extends Controller
{
    // Defaults igual que tu mockConfig del frontend
    protected array $defaults = [
        'general' => [
            'nombreSistema'   => 'Gestor de Torneos UEB',
            'emailContacto'   => 'contacto@ueb.edu.ec',
            'logoUrl'         => '',
            'timezone'        => 'America/Guayaquil',
            'registroAbierto' => true,
        ],
        'operacional' => [
            'maxEquiposPorTorneo'        => 32,
            'defaultEstadoInscripcion'   => 'Pendiente',
            'diasMaximoParaProgramacion' => 15,
            'activarNotificacionesEmail' => true,
        ],
        'seguridad' => [
            'longitudMinimaContrasena' => 8,
            'rolUsuarioPorDefecto'     => 'Invitado',
            'forzar2FA'                => false,
        ],
    ];

    /**
     * GET /api/configuracion
     */
    public function index(Request $request)
    {
        // Ya estás protegido por auth:sanctum + admin en las rutas,
        // así que aquí no repetimos lo del rol.

        $general     = Configuracion::where('clave', 'general')->first();
        $operacional = Configuracion::where('clave', 'operacional')->first();
        $seguridad   = Configuracion::where('clave', 'seguridad')->first();

        return response()->json([
            'general' => array_merge(
                $this->defaults['general'],
                $general?->valor ?? []
            ),
            'operacional' => array_merge(
                $this->defaults['operacional'],
                $operacional?->valor ?? []
            ),
            'seguridad' => array_merge(
                $this->defaults['seguridad'],
                $seguridad?->valor ?? []
            ),
        ]);
    }

    /**
     * PUT /api/configuracion
     */
    public function update(Request $request)
    {
        $data = $request->validate([
            'general'     => 'nullable|array',
            'operacional' => 'nullable|array',
            'seguridad'   => 'nullable|array',
        ]);

        if (isset($data['general'])) {
            Configuracion::updateOrCreate(
                ['clave' => 'general'],
                ['valor' => $data['general']]
            );
        }

        if (isset($data['operacional'])) {
            Configuracion::updateOrCreate(
                ['clave' => 'operacional'],
                ['valor' => $data['operacional']]
            );
        }

        if (isset($data['seguridad'])) {
            Configuracion::updateOrCreate(
                ['clave' => 'seguridad'],
                ['valor' => $data['seguridad']]
            );
        }

        return response()->json([
            'message' => 'Configuración actualizada correctamente.',
        ]);
    }

    /**
     * POST /api/configuracion/logo
     */
    public function uploadLogo(Request $request)
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $file = $request->file('logo');
        $path = $file->store('logos', 'public');
        $url  = asset('storage/' . $path);

        $configGeneral = Configuracion::firstOrCreate(
            ['clave' => 'general'],
            ['valor' => []]
        );

        $valor = $configGeneral->valor ?? [];
        $valor['logoUrl'] = $url;
        $configGeneral->valor = $valor;
        $configGeneral->save();

        return response()->json([
            'message' => 'Logo subido y configuración actualizada correctamente.',
            'logoUrl' => $url,
            'general' => $valor,
        ], 201);
    }
}
