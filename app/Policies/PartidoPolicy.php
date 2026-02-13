<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Partido;
use Illuminate\Auth\Access\Response;

class PartidoPolicy
{
    /**
     * Determina si el usuario puede ver cualquier modelo Partido.
     */
    public function viewAny(?User $user): bool
    {
        // Todos pueden ver la lista de partidos.
        return true;
    }

    /**
     * Determina si el usuario puede ver el modelo Partido dado.
     */
    public function view(?User $user, Partido $partido): bool
    {
        // Todos pueden ver un partido específico.
        return true;
    }

    /**
     * Determina si el usuario puede crear modelos Partido.
     */
    public function create(User $user): Response
    {
        // Solo usuarios autenticados pueden crear partidos.
        return $user
            ? Response::allow()
            : Response::deny('Debes estar autenticado para crear partidos.');
    }

    /**
     * Determina si el usuario puede actualizar el modelo Partido dado.
     */
    public function update(User $user, Partido $partido): Response
    {
        // Solo el usuario que creó el partido puede actualizarlo.
        return $user->id === $partido->user_id
            ? Response::allow()
            : Response::deny('No estás autorizado para actualizar este partido.');
    }

    /**
     * Determina si el usuario puede eliminar el modelo Partido dado.
     */
    public function delete(User $user, Partido $partido): Response
    {
        // Solo el usuario que creó el partido puede eliminarlo.
        return $user->id === $partido->user_id
            ? Response::allow()
            : Response::deny('No estás autorizado para eliminar este partido.');
    }
}