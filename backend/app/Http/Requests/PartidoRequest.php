<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PartidoRequest extends FormRequest
{
    /**
     * Determina si el usuario está autorizado a hacer esta petición.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Obtiene las reglas de validación que se aplican a la petición.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'torneo_id' => 'required|exists:torneos,id',
            'fecha' => 'required|date',
            'hora' => 'required|date_format:H:i:s',
            'equipo_local_id' => [
                'required',
                'exists:equipos,id',
                // Asegura que el equipo local no sea el mismo que el visitante
                Rule::notIn([$this->equipo_visitante_id]),
            ],
            'equipo_visitante_id' => 'required|exists:equipos,id',
            
            // Reglas para el marcador, que solo son obligatorias si el estado es 'finalizado'
            'estado' => 'required|in:programado,en_juego,finalizado,pospuesto',
            'marcador_equipo_local' => [
                'nullable',
                'integer',
                'min:0',
                Rule::requiredIf($this->estado === 'finalizado'),
            ],
            'marcador_equipo_visitante' => [
                'nullable',
                'integer',
                'min:0',
                Rule::requiredIf($this->estado === 'finalizado'),
            ],
        ];
    }

    /**
     * Personaliza los mensajes de error.
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'torneo_id.required' => 'El ID del torneo es obligatorio.',
            'torneo_id.exists' => 'El torneo especificado no existe.',
            'fecha.required' => 'La fecha del partido es obligatoria.',
            'hora.required' => 'La hora del partido es obligatoria.',
            'equipo_local_id.required' => 'El equipo local es obligatorio.',
            'equipo_local_id.exists' => 'El equipo local especificado no existe.',
            'equipo_local_id.not_in' => 'El equipo local no puede ser el mismo que el equipo visitante.',
            'equipo_visitante_id.required' => 'El equipo visitante es obligatorio.',
            'equipo_visitante_id.exists' => 'El equipo visitante especificado no existe.',
            'estado.required' => 'El estado del partido es obligatorio.',
            'estado.in' => 'El estado debe ser uno de: programado, en_juego, finalizado, pospuesto.',
            'marcador_equipo_local.required_if' => 'El marcador local es obligatorio cuando el partido está finalizado.',
            'marcador_equipo_local.integer' => 'El marcador local debe ser un número entero.',
            'marcador_equipo_local.min' => 'El marcador local no puede ser negativo.',
            'marcador_equipo_visitante.required_if' => 'El marcador visitante es obligatorio cuando el partido está finalizado.',
            'marcador_equipo_visitante.integer' => 'El marcador visitante debe ser un número entero.',
            'marcador_equipo_visitante.min' => 'El marcador visitante no puede ser negativo.',
        ];
    }
}