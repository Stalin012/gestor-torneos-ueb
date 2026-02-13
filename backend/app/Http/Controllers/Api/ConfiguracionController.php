<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Configuracion;
use App\Models\Auditoria;
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

    public function index(Request $request)
    {
        try {
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
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al cargar configuración',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * GET /api/configuracion/publica
     */
    public function publicIndex()
    {
        $general = Configuracion::where('clave', 'general')->first();
        return response()->json([
            'general' => array_merge(
                $this->defaults['general'],
                $general?->valor ?? []
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
            $this->logAudit(
                $request->user()->cedula,
                'ACTUALIZAR',
                'Configuracion',
                'general',
                'Actualización de configuración general.'
            );
        }

        if (isset($data['operacional'])) {
            Configuracion::updateOrCreate(
                ['clave' => 'operacional'],
                ['valor' => $data['operacional']]
            );
            $this->logAudit(
                $request->user()->cedula,
                'ACTUALIZAR',
                'Configuracion',
                'operacional',
                'Actualización de configuración operacional.'
            );
        }

        if (isset($data['seguridad'])) {
            Configuracion::updateOrCreate(
                ['clave' => 'seguridad'],
                ['valor' => $data['seguridad']]
            );
            $this->logAudit(
                $request->user()->cedula,
                'ACTUALIZAR',
                'Configuracion',
                'seguridad',
                'Actualización de configuración de seguridad.'
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

        $this->logAudit(
            $request->user()->cedula,
            'ACTUALIZAR',
            'Configuracion',
            'logo',
            'Actualización del logo del sistema.'
        );

        return response()->json([
            'message' => 'Logo subido y configuración actualizada correctamente.',
            'logoUrl' => $url,
            'general' => $valor,
        ], 201);
    }

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
}
