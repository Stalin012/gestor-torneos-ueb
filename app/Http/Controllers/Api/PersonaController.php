<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Persona;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use App\Traits\ApiResponse;

class PersonaController extends Controller
{
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
            $validator = Validator::make($request->all(), [
                'cedula'           => 'required|string|size:10|unique:personas,cedula',
                'nombres'          => 'required|string|max:100',
                'apellidos'        => 'required|string|max:100',
                'fecha_nacimiento' => 'nullable|date|before:today',
                'edad'             => 'nullable|integer|min:1|max:120',
                'estatura'         => 'nullable|numeric|min:0|max:3',
                'telefono'         => 'nullable|string|max:20',
                'email'            => 'nullable|email|max:255|unique:personas,email',
                'foto'             => 'nullable|file|mimes:jpg,jpeg,png,webp|max:2048',
            ]);

            if ($validator->fails()) {
                return $this->validationErrorResponse($validator->errors());
            }

            $data = $validator->validated();

            if ($request->hasFile('foto')) {
                $path = $request->file('foto')->store('fotos', 'public');
                $data['foto'] = $path;
            }

            $persona = Persona::create($data);

            return $this->successResponse($persona, 'Persona registrada correctamente.', 201);
        } catch (\Exception $e) {
            return $this->errorResponse('Error al crear persona: ' . $e->getMessage(), 500);
        }
    }

    public function update(Request $request, string $cedula)
    {
        try {
            $persona = Persona::find($cedula);

            if (!$persona) {
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
                'foto'             => 'sometimes|nullable|file|mimes:jpg,jpeg,png,webp|max:2048',
            ]);

            if ($validator->fails()) {
                return $this->validationErrorResponse($validator->errors());
            }

            $data = $validator->validated();

            if ($request->hasFile('foto')) {
                if (!empty($persona->foto) && Storage::disk('public')->exists($persona->foto)) {
                    Storage::disk('public')->delete($persona->foto);
                }
                $path = $request->file('foto')->store('fotos', 'public');
                $data['foto'] = $path;
            }

            $persona->update($data);

            return $this->successResponse($persona, 'Persona actualizada correctamente.');
        } catch (\Exception $e) {
            return $this->errorResponse('Error al actualizar persona: ' . $e->getMessage(), 500);
        }
    }

    public function destroy(string $cedula)
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

            return $this->successResponse(null, 'Persona eliminada correctamente.');
        } catch (\Exception $e) {
            return $this->errorResponse('Error al eliminar persona: ' . $e->getMessage(), 500);
        }
    }
}
