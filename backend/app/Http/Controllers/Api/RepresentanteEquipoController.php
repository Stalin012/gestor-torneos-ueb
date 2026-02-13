<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use App\Models\Equipo;
use App\Models\Inscripcion;
use App\Models\Auditoria;
use App\Models\Jugador;
use App\Models\Persona;

class RepresentanteEquipoController extends Controller
{
    /**
     * Obtener cédula del representante autenticado (modelo Usuario).
     */
    private function representanteCedula(Request $request): string
    {
        $user = $request->user();

        if (!$user) {
            abort(401, 'Sesión inválida o token no asociado a un usuario.');
        }

        if (!empty($user->cedula)) {
            return (string) $user->cedula;
        }

        if (method_exists($user, 'persona') && $user->persona && !empty($user->persona->cedula)) {
            return (string) $user->persona->cedula;
        }

        if (!empty($user->username)) {
            return (string) $user->username;
        }

        abort(403, 'No se pudo determinar la cédula del representante autenticado. Verifica que el usuario tenga una cédula asignada.');
    }

    /**
     * Registra una acción de auditoría.
     */
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

    private function equipoDelRepresentanteOrFail(string $cedulaRep, int $equipoId): Equipo
    {
        return Equipo::where('representante_cedula', $cedulaRep)
            ->where('id', $equipoId)
            ->firstOrFail();
    }

    // =========================================================
    // EQUIPOS
    // =========================================================

    public function index(Request $request)
    {
        $cedula = $this->representanteCedula($request);

        $equipos = Equipo::with(['torneo:id,nombre', 'deporte:id,nombre', 'categoria:id,nombre'])
            ->withCount('jugadores')
            ->where('representante_cedula', $cedula)
            ->orderByDesc('id')
            ->get();

        return response()->json($equipos);
    }

    public function store(Request $request)
    {
        $cedula = $this->representanteCedula($request);

        $validated = $request->validate([
            'nombre'       => 'required|string|max:120',
            'torneo_id'    => 'required|exists:torneos,id',
            'deporte_id'   => 'required|exists:deportes,id',
            'categoria_id' => 'required|exists:categorias,id',
            'logo'         => 'nullable|string|max:255',
        ]);

        $equipo = DB::transaction(function () use ($validated, $cedula) {

            $equipo = Equipo::create([
                'nombre'               => $validated['nombre'],
                'torneo_id'            => $validated['torneo_id'],
                'deporte_id'           => $validated['deporte_id'],
                'categoria_id'         => $validated['categoria_id'],
                'logo'                 => $validated['logo'] ?? null,
                'representante_cedula' => $cedula,
            ]);

            // Inscripción simple según tu tabla real
            Inscripcion::updateOrCreate(
                [
                    'equipo_id' => $equipo->id,
                    'torneo_id' => $equipo->torneo_id,
                ],
                [
                    'estado' => 'Pendiente',
                ]
            );

            return $equipo;
        });

        $this->logAudit(
            $request->user() ? $request->user()->cedula : 'SISTEMA',
            'CREAR',
            'Equipo',
            (string)$equipo->id,
            "Equipo '{$equipo->nombre}' (ID: {$equipo->id}) creado por el representante."
        );

        $equipo->load(['torneo:id,nombre', 'deporte:id,nombre', 'categoria:id,nombre']);

        return response()->json($equipo, 201);
    }

    public function show(Request $request, $id)
    {
        $cedula = $this->representanteCedula($request);

        $equipo = Equipo::with(['torneo:id,nombre', 'deporte:id,nombre', 'categoria:id,nombre'])
            ->where('representante_cedula', $cedula)
            ->where('id', $id)
            ->firstOrFail();

        return response()->json($equipo);
    }

    public function update(Request $request, $id)
    {
        $cedula = $this->representanteCedula($request);

        $equipo = Equipo::where('representante_cedula', $cedula)
            ->where('id', $id)
            ->firstOrFail();

        $validated = $request->validate([
            'nombre'       => 'sometimes|required|string|max:120',
            'torneo_id'    => 'sometimes|required|exists:torneos,id',
            'deporte_id'   => 'sometimes|required|exists:deportes,id',
            'categoria_id' => 'sometimes|required|exists:categorias,id',
            'logo'         => 'nullable|string|max:255',
        ]);

        $equipo->update($validated);
        $this->logAudit(
            $request->user() ? $request->user()->cedula : 'SISTEMA',
            'ACTUALIZAR',
            'Equipo',
            (string)$equipo->id,
            "Equipo '{$equipo->nombre}' (ID: {$equipo->id}) actualizado por el representante."
        );
        $equipo->load(['torneo:id,nombre', 'deporte:id,nombre', 'categoria:id,nombre']);

        return response()->json($equipo);
    }

    public function destroy(Request $request, $id)
    {
        $cedula = $this->representanteCedula($request);

        $equipo = Equipo::where('representante_cedula', $cedula)
            ->where('id', $id)
            ->firstOrFail();

        Inscripcion::where('equipo_id', $equipo->id)->delete();

        // Si tu FK jugadores.equipo_id NO permite null, entonces en vez de null toca borrar/trasladar.
        // Aquí asumo que sí permite null.
        Jugador::where('equipo_id', $equipo->id)->update([
            'equipo_id' => null,
            'numero' => null,
            'posicion' => null,
        ]);

        $equipo->delete();
        $this->logAudit(
            $request->user() ? $request->user()->cedula : 'SISTEMA',
            'ELIMINAR',
            'Equipo',
            (string)$equipo->id,
            "Equipo '{$equipo->nombre}' (ID: {$equipo->id}) eliminado por el representante."
        );

        return response()->json(['message' => 'Equipo eliminado correctamente.']);
    }

    // =========================================================
    // NÓMINA (LISTADO)
    // =========================================================

    /**
     * GET /api/representante/equipo/jugadores/nomina?equipo_id=#
     */
    public function nominaJugadores(Request $request)
    {
        $cedula = $this->representanteCedula($request);
        $equipoId = $request->query('equipo_id');

        $equiposQuery = Equipo::query()
            ->where('representante_cedula', $cedula);

        if (!empty($equipoId)) {
            $equiposQuery->where('id', (int) $equipoId);
        }

        $equipos = $equiposQuery
            ->with([
                'deporte:id,nombre',
                'categoria:id,nombre',
                'torneo:id,nombre',
                'jugadores' => function ($q) {
                    $q->select('cedula', 'equipo_id', 'posicion', 'numero')
                        ->with(['persona:cedula,nombres,apellidos,telefono,foto'])
                        ->orderByRaw('numero IS NULL, numero ASC')
                        ->orderBy('cedula');
                }
            ])
            ->orderBy('nombre')
            ->get(['id', 'nombre', 'torneo_id', 'deporte_id', 'categoria_id', 'representante_cedula']);

        $totalEquipos = $equipos->count();
        $totalJugadores = $equipos->sum(fn ($e) => $e->jugadores->count());

        return response()->json([
            'total_equipos' => $totalEquipos,
            'total_jugadores' => $totalJugadores,
            'equipos' => $equipos,
        ]);
    }

    /**
     * GET /api/representante/equipo/jugadores?equipo_id=#
     */
    public function listarJugadores(Request $request)
    {
        $cedula = $this->representanteCedula($request);
        $equipoId = $request->query('equipo_id');

        $equiposIds = Equipo::where('representante_cedula', $cedula)->pluck('id')->toArray();
        if (empty($equiposIds)) return response()->json([]);

        $q = Jugador::with(['persona:cedula,nombres,apellidos,telefono,foto', 'equipo:id,nombre'])
            ->whereIn('equipo_id', $equiposIds);

        if (!empty($equipoId)) $q->where('equipo_id', (int) $equipoId);

        return response()->json(
            $q->orderByRaw('numero IS NULL, numero ASC')->orderBy('cedula')->get()
        );
    }

    // =========================================================
    // NÓMINA (CRUD)
    // =========================================================

    /**
     * POST /api/representante/equipo/jugadores
     * Body:
     * - equipo_id, cedula, numero?, posicion?
     * Opcional si quieres crear Persona cuando no exista:
     * - create_persona=true y persona[nombres], persona[apellidos], etc.
     */
    public function agregarJugador(Request $request)
    {
        $cedulaRep = $this->representanteCedula($request);

        $validated = $request->validate([
            'equipo_id' => 'required|integer',
            'cedula'    => 'required|string|size:10',
            'numero'    => 'nullable|integer|min:0|max:99',
            'posicion'  => 'nullable|string|max:100',

            // opcional creación persona
            'create_persona'     => 'nullable|boolean',
            'persona.nombres'    => 'nullable|string|max:120',
            'persona.apellidos'  => 'nullable|string|max:120',
            'persona.email'      => 'nullable|email|max:160',
            'persona.telefono'   => 'nullable|string|max:30',
        ]);

        $equipo = $this->equipoDelRepresentanteOrFail($cedulaRep, (int) $validated['equipo_id']);

        $cedulaJugador = trim((string) $validated['cedula']);

        $persona = Persona::where('cedula', $cedulaJugador)->first();

        // Si quieres permitir crear persona desde aquí
        $createPersona = (bool)($validated['create_persona'] ?? false);
        if (!$persona && $createPersona) {
            $p = $validated['persona'] ?? [];
            if (empty($p['nombres']) || empty($p['apellidos'])) {
                abort(422, 'Para crear la persona se requiere nombres y apellidos.');
            }

            $persona = Persona::create([
                'cedula'    => $cedulaJugador,
                'nombres'   => $p['nombres'],
                'apellidos' => $p['apellidos'],
                'email'     => $p['email'] ?? null,
                'telefono'  => $p['telefono'] ?? null,
            ]);
        }

        if (!$persona) {
            abort(422, 'La cédula no existe en personas. Registra la persona primero o activa create_persona.');
        }

        $jugadorExistia = Jugador::where('cedula', $cedulaJugador)->exists();

        $jugador = Jugador::updateOrCreate(
            ['cedula' => $cedulaJugador],
            [
                'equipo_id' => $equipo->id,
                'numero'    => $validated['numero'] ?? null,
                'posicion'  => $validated['posicion'] ?? null,
            ]
        );

        $jugador->load(['persona:cedula,nombres,apellidos,telefono,foto', 'equipo:id,nombre']);

        $action = $jugadorExistia ? 'ACTUALIZAR' : 'CREAR';
        $description = $jugadorExistia ?
            "Jugador '{$persona->nombres} {$persona->apellidos}' actualizado en la nómina del equipo '{$equipo->nombre}'." :
            "Jugador '{$persona->nombres} {$persona->apellidos}' agregado a la nómina del equipo '{$equipo->nombre}'.";
        
        $this->logAudit(
            $request->user() ? $request->user()->cedula : 'SISTEMA',
            $action,
            'JugadorNomina',
            (string)$cedulaJugador,
            $description
        );

        return response()->json([
            'message' => $jugadorExistia ? 'Jugador actualizado correctamente.' : 'Jugador agregado correctamente.',
            'jugador' => $jugador,
        ], 201);
    }

    /**
     * DELETE /api/representante/equipo/jugadores/{cedula}
     */
    public function removerJugador(Request $request, $cedula)
    {
        $cedulaRep = $this->representanteCedula($request);

        $jugador = Jugador::where('cedula', $cedula)->firstOrFail();

        $equipo = Equipo::where('id', $jugador->equipo_id)
            ->where('representante_cedula', $cedulaRep)
            ->first();

        if (!$equipo) abort(403, 'No tienes permiso para modificar este jugador.');

        $jugador->update([
            'equipo_id' => null,
            'numero'    => null,
            'posicion'  => null,
        ]);
        $this->logAudit(
            $request->user() ? $request->user()->cedula : 'SISTEMA',
            'REMOVER',
            'JugadorNomina',
            $cedula,
            "Jugador removido de la nómina del equipo '{$equipo->nombre}' (ID: {$equipo->id})."
        );

        return response()->json(['message' => 'Jugador removido de la nómina.']);
    }

    // =========================================================
    // IMPORTAR CSV / EXCEL
    // =========================================================

    /**
     * POST /api/representante/equipo/jugadores/import
     * multipart/form-data: equipo_id, file(.csv/.xlsx/.xls)
     *
     * Columnas mínimas:
     * - cedula
     * Opcionales:
     * - numero, posicion
     * Opcionales para crear persona si no existe:
     * - nombres, apellidos, email, telefono
     */
    public function importarNomina(Request $request)
    {
        $cedulaRep = $this->representanteCedula($request);

        $request->validate([
            'equipo_id' => 'required|integer',
            'file'      => 'required|file|max:5120',
        ]);

        $equipo = $this->equipoDelRepresentanteOrFail($cedulaRep, (int) $request->equipo_id);

        $file = $request->file('file');
        $ext = strtolower($file->getClientOriginalExtension());

        $rows = [];

        // ---------- CSV ----------
        if ($ext === 'csv') {
            $handle = fopen($file->getRealPath(), 'r');
            if (!$handle) abort(400, 'No se pudo leer el CSV.');

            $header = null;
            while (($data = fgetcsv($handle, 0, ',')) !== false) {
                if (!$header) {
                    $header = array_map(fn($h) => strtolower(trim((string)$h)), $data);
                    continue;
                }

                $row = [];
                foreach ($header as $i => $key) {
                    $row[$key] = isset($data[$i]) ? trim((string)$data[$i]) : null;
                }
                // ignora fila vacía
                if (implode('', array_map(fn($v) => (string)$v, $row)) === '') continue;

                $rows[] = $row;
            }
            fclose($handle);
        }

        // ---------- EXCEL ----------
        else if (in_array($ext, ['xlsx', 'xls'])) {
            if (!class_exists(\PhpOffice\PhpSpreadsheet\IOFactory::class)) {
                abort(500, 'Falta PhpSpreadsheet. Instala: composer require phpoffice/phpspreadsheet');
            }

            $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($file->getRealPath());
            $sheet = $spreadsheet->getActiveSheet();
            $raw = $sheet->toArray(null, true, true, true);

            if (count($raw) < 2) {
                return response()->json(['message' => 'El archivo no tiene filas para importar.'], 422);
            }

            $headerRow = array_shift($raw);
            $headers = [];
            foreach ($headerRow as $col => $val) {
                $headers[$col] = strtolower(trim((string)$val));
            }

            foreach ($raw as $r) {
                $row = [];
                foreach ($headers as $col => $key) {
                    $row[$key] = isset($r[$col]) ? trim((string)$r[$col]) : null;
                }
                if (implode('', array_map(fn($v) => (string)$v, $row)) === '') continue;
                $rows[] = $row;
            }
        } else {
            abort(422, 'Formato no soportado. Sube CSV, XLSX o XLS.');
        }

        $inserted = 0;
        $updated  = 0;
        $errors   = [];

        DB::beginTransaction();
        try {
            foreach ($rows as $i => $r) {
                $line = $i + 2; // por cabecera

                $cedulaJugador = isset($r['cedula']) ? preg_replace('/\s+/', '', (string)$r['cedula']) : '';
                $numeroRaw = $r['numero'] ?? null;
                $posicionRaw = $r['posicion'] ?? null;

                // opcional persona
                $nombres = $r['nombres'] ?? null;
                $apellidos = $r['apellidos'] ?? null;
                $email = $r['email'] ?? null;
                $telefono = $r['telefono'] ?? null;

                if (!$cedulaJugador || strlen($cedulaJugador) !== 10) {
                    $errors[] = ['linea' => $line, 'cedula' => $cedulaJugador, 'error' => 'Cédula inválida (10 dígitos).'];
                    continue;
                }

                $persona = Persona::where('cedula', $cedulaJugador)->first();

                // Si no existe persona, la crea SOLO si vienen nombres+apellidos
                if (!$persona && !empty($nombres) && !empty($apellidos)) {
                    $persona = Persona::create([
                        'cedula'    => $cedulaJugador,
                        'nombres'   => (string)$nombres,
                        'apellidos' => (string)$apellidos,
                        'email'     => $email ? (string)$email : null,
                        'telefono'  => $telefono ? (string)$telefono : null,
                    ]);
                }

                if (!$persona) {
                    $errors[] = ['linea' => $line, 'cedula' => $cedulaJugador, 'error' => 'No existe en personas (y no hay nombres/apellidos para crear).'];
                    continue;
                }

                $num = null;
                if ($numeroRaw !== null && $numeroRaw !== '') {
                    if (!is_numeric($numeroRaw) || (int)$numeroRaw < 0 || (int)$numeroRaw > 99) {
                        $errors[] = ['linea' => $line, 'cedula' => $cedulaJugador, 'error' => 'Dorsal inválido (0-99).'];
                        continue;
                    }
                    $num = (int)$numeroRaw;
                }

                $pos = null;
                if ($posicionRaw !== null && trim((string)$posicionRaw) !== '') {
                    $pos = trim((string)$posicionRaw);
                    if (mb_strlen($pos) > 100) $pos = mb_substr($pos, 0, 100);
                }

                $exists = Jugador::where('cedula', $cedulaJugador)->exists();

                Jugador::updateOrCreate(
                    ['cedula' => $cedulaJugador],
                    [
                        'equipo_id' => $equipo->id,
                        'numero'    => $num,
                        'posicion'  => $pos,
                    ]
                );

                $exists ? $updated++ : $inserted++;
            }

            DB::commit();
            $this->logAudit(
                $request->user() ? $request->user()->cedula : 'SISTEMA',
                'IMPORTAR',
                'Nomina',
                (string)$equipo->id,
                "Importación de nómina para el equipo '{$equipo->nombre}'. Insertados: {$inserted}, Actualizados: {$updated}, Errores: " . count($errors) . "."
            );
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }

        return response()->json([
            'message'  => 'Importación finalizada.',
            'equipo'   => ['id' => $equipo->id, 'nombre' => $equipo->nombre],
            'inserted' => $inserted,
            'updated'  => $updated,
            'errors'   => $errors,
        ]);
    }
    /**
 * GET /api/representante/equipo/inscripciones?equipo_id=#
 * Lista las inscripciones de los equipos del representante
 */
public function inscripciones(Request $request)
{
    $cedula = $this->representanteCedula($request);
    $equipoId = $request->query('equipo_id');

    // Equipos del representante
    $equipos = Equipo::where('representante_cedula', $cedula)->pluck('id');

    if ($equipos->isEmpty()) {
        return response()->json([]);
    }

    $query = Inscripcion::with([
        'equipo:id,nombre',
        'torneo:id,nombre',
    ])->whereIn('equipo_id', $equipos);

    if (!empty($equipoId)) {
        $query->where('equipo_id', (int) $equipoId);
    }

    return response()->json(
        $query->orderByDesc('created_at')->get()
    );
}

/**
 * GET /api/representante/equipos/{id}/jugadores
 * Lista jugadores de un equipo específico del representante
 */
public function jugadoresEquipo(Request $request, $id)
{
    $cedula = $this->representanteCedula($request);
    
    $equipo = Equipo::with([
        'jugadores' => function ($q) {
            $q->with(['persona:cedula,nombres,apellidos,telefono,foto,fecha_nacimiento'])
              ->orderByRaw('numero IS NULL, numero ASC')
              ->orderBy('cedula');
        },
        'torneo:id,nombre',
        'deporte:id,nombre',
        'categoria:id,nombre'
    ])
    ->where('representante_cedula', $cedula)
    ->where('id', $id)
    ->firstOrFail();

    return response()->json($equipo);
}

}
