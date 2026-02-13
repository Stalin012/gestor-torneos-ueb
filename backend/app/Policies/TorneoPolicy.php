<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Torneo;
use Illuminate\Auth\Access\Response;

class TorneoPolicy
{
    /**
     * Determina si el usuario puede ver cualquier modelo Torneo.
     */
    public function viewAny(?User $user): bool
    {
        // Todos, incluso los invitados, pueden ver la lista de torneos.
        return true;
    }

    /**
     * Determina si el usuario puede ver el modelo Torneo dado.
     */
    public function view(?User $user, Torneo $torneo): bool
    {
        // Todos pueden ver un torneo específico.
        return true;
    }

    /**
     * Determina si el usuario puede crear modelos Torneo.
     */
    public function create(User $user): Response
    {
        // Solo usuarios autenticados pueden crear torneos.
        return $user
            ? Response::allow()
            : Response::deny('Debes estar autenticado para crear torneos.');
    }

    /**
     * Determina si el usuario puede actualizar el modelo Torneo dado.
     */
    public function update(User $user, Torneo $torneo): Response
    {
        // Solo el usuario que creó el torneo puede actualizarlo.
        return $user->id === $torneo->user_id
            ? Response::allow()
            : Response::deny('No estás autorizado para actualizar este torneo.');
    }

    /**
     * Determina si el usuario puede eliminar el modelo Torneo dado.
     */
    public function delete(User $user, Torneo $torneo): Response
    {
        // Solo el usuario que creó el torneo puede eliminarlo.
        return $user->id === $torneo->user_id
            ? Response::allow()
            : Response::deny('No estás autorizado para eliminar este torneo.');
    }
}