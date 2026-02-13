<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TorneoRequest extends FormRequest
{
    /**
     * Determina si el usuario está autorizado a hacer esta petición.
     * En un sistema real, esto debería verificar el rol de 'admin'.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        return true; // Asumimos autorización por ahora
    }

    /**
     * Obtiene las reglas de validación que se aplican a la petición.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        // Reglas comunes para crear (POST) y actualizar (PUT/PATCH)
        $rules = [
            'nombre' => 'required|string|max:255|unique:torneos,nombre,' . $this->route('torneo'),
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'nullable|date|after_or_equal:fecha_inicio',
            'estado' => 'required|in:inscripciones,en_curso,finalizado',
        ];
        
        // La regla unique necesita excluir el ID actual en el método PUT/PATCH
        if ($this->isMethod('put') || $this->isMethod('patch')) {
            $rules['nombre'] = 'required|string|max:255|unique:torneos,nombre,' . $this->route('torneo');
        } else {
            // Para el método POST (Store), la unicidad es total
            $rules['nombre'] = 'required|string|max:255|unique:torneos,nombre';
        }

        return $rules;
    }

    /**
     * Personaliza los mensajes de error.
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre del torneo es obligatorio.',
            'nombre.unique' => 'Ya existe un torneo con este nombre.',
            'fecha_inicio.required' => 'La fecha de inicio es obligatoria.',
            'fecha_inicio.date' => 'La fecha de inicio debe ser una fecha válida.',
            'fecha_fin.after_or_equal' => 'La fecha de fin no puede ser anterior a la fecha de inicio.',
            'estado.required' => 'El estado del torneo es obligatorio.',
            'estado.in' => 'El estado debe ser uno de: inscripciones, en_curso, finalizado.',
        ];
    }
}