<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTorneoRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * La autorización real (si puede editar este torneo específico) se maneja en el Controller con la Policy.
     */
    public function authorize(): bool
    {
        // El controlador manejará la autorización específica del recurso ($this->authorize('update', $torneo)).
        return auth()->check(); 
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        // Para obtener el ID del torneo que se está actualizando
        $torneoId = $this->route('torneo'); 

        return [
            'nombre' => ['sometimes', 'string', 'max:255', Rule::unique('torneos', 'nombre')->ignore($torneoId)],
            'fecha_inicio' => 'sometimes|date',
            'deporte_id' => 'sometimes|exists:deportes,id',
            'es_publico' => 'sometimes|boolean',
            'estado' => 'sometimes|in:programado,iniciado,finalizado',
        ];
    }
}