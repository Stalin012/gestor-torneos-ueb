<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Persona;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use App\Traits\ApiResponse;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Artisan;
use App\Models\Auditoria;

class PersonaController extends Controller
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
    use ApiResponse;

    public function index()
    {
        try {
            $personas = Persona::orderBy('apellidos')->paginate(20);
            return $this->successResponse($personas);
        } catch (\Exception $e) {
            return $this->errorResponse('Error al obtener personas', 500);
        }
    }

    public function show(string $cedula)
    {
        try {
            $persona = Persona::find($cedula);

            if (!$persona) {
                return response()->json([
                    'exists'  => false,
                    'message' => 'No existe una persona con esta cédula.',
                ], 404);
            }

            return response()->json([
                'exists' => true,
                'data'   => $persona,
            ]);
        } catch (\Exception $e) {
            return $this->errorResponse('Error al obtener persona', 500);
        }
    }

    public function store(Request $request)
    {
        try {
            Log::info('Intentando crear persona', $request->all());

            $validator = Validator::make($request->all(), [
                'cedula'           => 'required|string|size:10|unique:personas,cedula',
                'nombres'          => 'required|string|max:100',
                'apellidos'        => 'required|string|max:100',
                'fecha_nacimiento' => 'nullable|date|before:today',
                'edad'             => 'nullable|integer|min:1|max:120',
                'estatura'         => 'nullable|numeric|min:0|max:3',
                'telefono'         => 'nullable|string|max:20',
                'email'            => 'nullable|email|max:255|unique:personas,email',
                'foto'             => $request->hasFile('foto') ? 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048' : 'nullable',
            ]);

            if ($validator->fails()) {
                Log::warning('Fallo de validación al crear persona', ['errors' => $validator->errors()]);
                return $this->validationErrorResponse($validator->errors());
            }

            $data = $validator->validated();

            if ($request->hasFile('foto')) {
                Log::info('Se detectó archivo de foto en la solicitud.');
                $nombres = $data['nombres'] ?? '';
                $apellidos = $data['apellidos'] ?? '';
                $originalName = $request->file('foto')->getClientOriginalName();
                $extension = $request->file('foto')->getClientOriginalExtension();
                $baseName = Str::slug("{$nombres} {$apellidos}");
                $fileName = "{$baseName}-" . time() . ".{$extension}";

                $path = $request->file('foto')->storeAs('fotos', $fileName, 'public');
                $data['foto'] = $path;
                Log::info('Foto guardada en: ' . $path);
                
                // Sincronizar storage (alternativa al enlace simbólico en Windows)
                Artisan::call('storage:sync');
                Log::info('Storage sincronizado automáticamente');
            } else {
                Log::info('No se detectó archivo de foto en la solicitud.');
                $data['foto'] = $request->input('foto');
            }

            $persona = Persona::create($data);
            Log::info('Persona creada exitosamente', ['persona_cedula' => $persona->cedula]);

            $this->logAudit(
                $request->user() ? $request->user()->cedula : 'SISTEMA',
                'CREAR',
                'Persona',
                (string)$persona->cedula,
                'Persona creada: ' . ($persona->nombres ?? 'N/A') . ' ' . ($persona->apellidos ?? 'N/A')
            );

            return $this->successResponse($persona, 'Persona registrada correctamente.', 201);
        } catch (\Exception $e) {
            Log::error('Error al crear persona: ' . $e->getMessage(), ['exception' => $e]);
            return $this->errorResponse('Error al crear persona: ' . $e->getMessage(), 500);
        }
    }

    public function update(Request $request, string $cedula)
    {
        try {
            Log::info('Intentando actualizar persona', ['cedula' => $cedula, 'request_data' => $request->all()]);

            $persona = Persona::find($cedula);

            if (!$persona) {
                Log::warning('Persona no encontrada para actualizar', ['cedula' => $cedula]);
                return $this->notFoundResponse('Persona no encontrada.');
            }

            $validator = Validator::make($request->all(), [
                'nombres'          => 'sometimes|required|string|max:100',
                'apellidos'        => 'sometimes|required|string|max:100',
                'fecha_nacimiento' => 'sometimes|nullable|date|before:today',
                'edad'             => 'sometimes|nullable|integer|min:1|max:120',
                'estatura'         => 'sometimes|nullable|numeric|min:0|max:3',
                'telefono'         => 'sometimes|nullable|string|max:20',
                'email'            => 'sometimes|nullable|email|max:255|unique:personas,email,' . $persona->cedula . ',cedula',
                'foto'             => $request->hasFile('foto') ? 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048' : 'nullable',
            ]);

            if ($validator->fails()) {
                Log::warning('Fallo de validación al actualizar persona', ['errors' => $validator->errors()]);
                return $this->validationErrorResponse($validator->errors());
            }

            $data = $validator->validated();

            if ($request->hasFile('foto')) {
                Log::info('Se detectó archivo de foto en la solicitud de actualización.');
                // Eliminar foto anterior si existe
                if (!empty($persona->foto) && Storage::disk('public')->exists($persona->foto)) {
                    Storage::disk('public')->delete($persona->foto);
                    Log::info('Foto anterior eliminada: ' . $persona->foto);
                }

                // Generar nombre de archivo descriptivo
                $nombres = $data['nombres'] ?? $persona->nombres ?? '';
                $apellidos = $data['apellidos'] ?? $persona->apellidos ?? '';
                $originalName = $request->file('foto')->getClientOriginalName();
                $extension = $request->file('foto')->getClientOriginalExtension();
                $baseName = Str::slug("{$nombres} {$apellidos}");
                $fileName = "{$baseName}-" . time() . ".{$extension}";

                $path = $request->file('foto')->storeAs('fotos', $fileName, 'public');
                $data['foto'] = $path;
                Log::info('Nueva foto guardada en: ' . $path);
                
                // Sincronizar storage (alternativa al enlace simbólico en Windows)
                Artisan::call('storage:sync');
                Log::info('Storage sincronizado automáticamente');
            } elseif ($request->has('foto')) {
                // Si viene como string (URL), lo guardamos tal cual
                Log::info('Campo foto presente como string (URL) o nulo.');
                $data['foto'] = $request->input('foto');
            } else {
                Log::info('No se detectó archivo de foto ni campo foto en la solicitud de actualización.');
                // Si no se envía 'foto' en el request, y no hay un archivo,
                // y la persona ya tenía una foto, mantenemos la existente.
                // Si se envía 'foto' como null, se borrará la foto.
                if (!isset($data['foto']) && $persona->foto) {
                    $data['foto'] = $persona->foto;
                }
            }

            $persona->update($data);
            // Sync with User if exists
            if ($persona->usuario) {
                $persona->usuario->update($request->only([
                    'nombres', 'apellidos', 'email', 'telefono', 'foto', 'edad', 'estatura'
                ]));
            }
            Log::info('Persona actualizada exitosamente', ['persona_cedula' => $persona->cedula]);

            $this->logAudit(
                $request->user() ? $request->user()->cedula : 'SISTEMA',
                'ACTUALIZAR',
                'Persona',
                (string)$persona->cedula,
                'Persona actualizada: ' . ($persona->nombres ?? 'N/A') . ' ' . ($persona->apellidos ?? 'N/A')
            );

            return $this->successResponse($persona, 'Persona actualizada correctamente.');
        } catch (\Exception $e) {
            Log::error('Error al actualizar persona: ' . $e->getMessage(), ['exception' => $e]);
            return $this->errorResponse('Error al actualizar persona: ' . $e->getMessage(), 500);
        }
    }

    public function destroy(Request $request, string $cedula)
    {
        try {
            $persona = Persona::find($cedula);

            if (!$persona) {
                return $this->notFoundResponse('Persona no encontrada.');
            }

            if (!empty($persona->foto) && Storage::disk('public')->exists($persona->foto)) {
                Storage::disk('public')->delete($persona->foto);
            }

            $persona->delete();

            $this->logAudit(
                $request->user() ? $request->user()->cedula : 'SISTEMA',
                'ELIMINAR',
                'Persona',
                (string)$cedula,
                'Persona eliminada: ' . ($persona->nombres ?? 'N/A') . ' ' . ($persona->apellidos ?? 'N/A')
            );

            return $this->successResponse(null, 'Persona eliminada correctamente.');
        } catch (\Exception $e) {
            return $this->errorResponse('Error al eliminar persona: ' . $e->getMessage(), 500);
        }
    }
}
