<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EquipoRequest extends FormRequest
{
    /**
     * Determina si el usuario está autorizado a hacer esta petición.
     */
    public function authorize(): bool
    {
        // Permitimos que usuarios autenticados (Admin y Representante) usen este Request
        return true;
    }

    /**
     * Obtiene las reglas de validación que se aplican a la petición.
     */
    public function rules(): array
    {
        // Obtenemos el ID del equipo desde la ruta para la excepción en el unique
        $equipoId = $this->route('equipo');

        return [
            'nombre' => [
                'required',
                'string',
                'max:255',
                // Regla de unicidad ignorando el equipo actual si es una actualización
                Rule::unique('equipos', 'nombre')->ignore($equipoId),
            ],
            'deporte_id' => 'required|exists:deportes,id',
            'categoria_id' => 'required|exists:categorias,id',
            'logo_url' => 'nullable|string|max:500', 
            // 'representante_cedula' no se valida aquí porque la tomamos del Auth::user() en el controlador
        ];
    }

    /**
     * Personaliza los mensajes de error.
     */
    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre del equipo es obligatorio.',
            'nombre.unique' => 'Ya existe un equipo registrado con este nombre.',
            'deporte_id.required' => 'Debes seleccionar un deporte.',
            'deporte_id.exists' => 'El deporte seleccionado no es válido.',
            'categoria_id.required' => 'Debes seleccionar una categoría.',
            'categoria_id.exists' => 'La categoría seleccionada no es válida.',
        ];
    }
}