<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Partido;
use Illuminate\Http\Request;
use App\Services\ClasificacionService;
use Illuminate\Support\Facades\Gate;
use App\Traits\TransformsRelations;

class PartidoController extends Controller
{
    use TransformsRelations;
    protected array $relations = [
        'torneo',
        'arbitro',
        'equipo_local',
        'equipo_visitante'
    ]; 

    protected $clasificacionService;

    public function __construct(\App\Services\ClasificacionService $clasificacionService)
    {
        $this->clasificacionService = $clasificacionService;
    }

    protected array $rules = [
        'torneo_id'             => 'required|exists:torneos,id',
        'equipo_local_id'       => 'required|exists:equipos,id|different:equipo_visitante_id',
        'equipo_visitante_id'   => 'required|exists:equipos,id',
        'arbitro_cedula'        => 'nullable|exists:arbitros,cedula',
        'fecha'                 => 'nullable|date',
        'hora'                  => 'nullable|string|max:10',
        'campo'                 => 'nullable|string|max:100',
        'estado'                => 'nullable|in:Programado,En Juego,Finalizado',
        'marcador_local'        => 'nullable|integer|min:0',
        'marcador_visitante'    => 'nullable|integer|min:0',
    ];

    public function index()
    {
        $partidos = Partido::with([
            'torneo',
            'arbitro',
            'equipo_local' => function($query) {
                $query->withCount('jugadores');
            },
            'equipo_visitante' => function($query) {
                $query->withCount('jugadores');
            }
        ])
            ->orderBy('fecha', 'desc')
            ->orderBy('hora')
            ->get()
            ->map(function($partido) {
                $data = $partido->toArray();
                $data['equipoLocal'] = $data['equipo_local'] ?? null;
                $data['equipoVisitante'] = $data['equipo_visitante'] ?? null;
                unset($data['equipo_local'], $data['equipo_visitante']);
                return $data;
            });

        return response()->json($partidos);
    }

    public function store(Request $request)
    {
        $data = $this->mapFrontendToDb($request->all());
        $validated = \Validator::make($data, $this->rules)->validate();

        $validated['estado']             = $validated['estado'] ?? 'Programado';
        $validated['estado']             = str_replace('_', ' ', $validated['estado']);
        $validated['marcador_local']     = $validated['marcador_local'] ?? 0;
        $validated['marcador_visitante'] = $validated['marcador_visitante'] ?? 0;

        $partido = Partido::create($validated);
        $partido->load($this->relations);

        return response()->json([
            'message' => 'Partido creado correctamente.',
            'data'    => $this->transformToCamelCase($partido),
        ], 201);
    }

    public function show($id)
    {
        $partido = Partido::with($this->relations)->findOrFail($id);
        return response()->json($this->transformToCamelCase($partido));
    }

    public function update(Request $request, $id)
    {
        $partido = Partido::findOrFail($id);
        $data = $this->mapFrontendToDb($request->all());

        $validated = \Validator::make($data, [
            'fecha'                 => 'sometimes|nullable|date',
            'hora'                  => 'sometimes|nullable|string|max:10',
            'campo'                 => 'sometimes|nullable|string|max:100',
            'estado'                => 'sometimes|nullable|in:Programado,En Juego,Finalizado',
            'marcador_local'        => 'sometimes|nullable|integer|min:0',
            'marcador_visitante'    => 'sometimes|nullable|integer|min:0',
            'arbitro_cedula'        => 'sometimes|nullable|exists:arbitros,cedula',
        ])->validate();

        $partido->update($validated);
        $partido->load($this->relations);

        return response()->json([
            'message' => 'Partido actualizado correctamente.',
            'data'    => $this->transformToCamelCase($partido),
        ]);
    }

    public function destroy($id)
    {
        $partido = Partido::findOrFail($id);
        $partido->delete();

        return response()->json([
            'message' => 'Partido eliminado correctamente.',
        ], 200);
    }

    /**
     * Iniciar un partido (Cambia estado a 'En juego')
     */
    public function iniciar($id)
    {
        $partido = Partido::findOrFail($id);
        $partido->update(['estado' => 'En Juego']);

        return response()->json([
            'message' => 'Partido iniciado.',
            'data' => $this->transformToCamelCase($partido->load($this->relations))
        ]);
    }

    /**
     * Finalizar un partido (Cambia estado a 'Finalizado' y recalcula tabla)
     */
    public function finalizar($id)
    {
        $partido = Partido::findOrFail($id);
        $partido->update(['estado' => 'Finalizado']);

        if ($partido->torneo) {
            $this->clasificacionService->recalcularClasificacion($partido->torneo);
        }

        return response()->json([
            'message' => 'Partido finalizado y tabla actualizada.',
            'data' => $this->transformToCamelCase($partido->load($this->relations))
        ]);
    }

    /**
     * Actualizar marcador en tiempo real
     */
    public function actualizarMarcador(Request $request, $id)
    {
        $partido = Partido::findOrFail($id);
        $validated = $request->validate([
            'marcador_local' => 'required|integer|min:0',
            'marcador_visitante' => 'required|integer|min:0',
        ]);

        $partido->update($validated);

        return response()->json([
            'message' => 'Marcador actualizado.',
            'data' => $this->transformToCamelCase($partido->load($this->relations))
        ]);
    }

    protected function mapFrontendToDb(array $data): array
    {
        $map = [
            'equipo_a_id' => 'equipo_local_id',
            'equipo_b_id' => 'equipo_visitante_id',
            'puntosA'     => 'marcador_local',
            'puntosB'     => 'marcador_visitante',
        ];

        foreach ($map as $frontendKey => $dbKey) {
            if (array_key_exists($frontendKey, $data)) {
                $data[$dbKey] = $data[$frontendKey];
            }
        }

        return $data;
    }
}
