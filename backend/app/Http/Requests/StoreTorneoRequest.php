<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTorneoRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * Solo permitir si el usuario está autenticado.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'nombre' => 'required|string|max:255|unique:torneos,nombre',
            'fecha_inicio' => 'required|date',
            'deporte_id' => 'required|exists:deportes,id',
            'es_publico' => 'nullable|boolean',
            // El campo 'creado_por' se llena en el controlador con Auth::id()
        ];
    }

    /**
     * Personalizar mensajes de error.
     */
    public function messages(): array
    {
        return [
            'nombre.unique' => 'Ya existe un torneo con ese nombre.',
            'deporte_id.exists' => 'El ID del deporte seleccionado no es válido.',
        ];
    }
}