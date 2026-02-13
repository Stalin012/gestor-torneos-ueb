<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Equipo;
use Illuminate\Auth\Access\Response;

class EquipoPolicy
{
    /**
     * Determina si el usuario puede ver cualquier modelo Equipo.
     */
    public function viewAny(?User $user): bool
    {
        // Todos pueden ver la lista de equipos.
        return true;
    }

    /**
     * Determina si el usuario puede ver el modelo Equipo dado.
     */
    public function view(?User $user, Equipo $equipo): bool
    {
        // Todos pueden ver un equipo específico.
        return true;
    }

    /**
     * Determina si el usuario puede crear modelos Equipo.
     */
    public function create(User $user): Response
    {
        // Solo usuarios autenticados pueden crear equipos.
        return $user
            ? Response::allow()
            : Response::deny('Debes estar autenticado para crear equipos.');
    }

    /**
     * Determina si el usuario puede actualizar el modelo Equipo dado.
     */
    public function update(User $user, Equipo $equipo): Response
    {
        // Solo el usuario que creó el equipo puede actualizarlo.
        // Asumimos que la llave foránea se llama 'user_id' en el modelo Equipo.
        return $user->id === $equipo->user_id
            ? Response::allow()
            : Response::deny('No estás autorizado para actualizar este equipo.');
    }

    /**
     * Determina si el usuario puede eliminar el modelo Equipo dado.
     */
    public function delete(User $user, Equipo $equipo): Response
    {
        // Solo el usuario que creó el equipo puede eliminarlo.
        return $user->id === $equipo->user_id
            ? Response::allow()
            : Response::deny('No estás autorizado para eliminar este equipo.');
    }
}