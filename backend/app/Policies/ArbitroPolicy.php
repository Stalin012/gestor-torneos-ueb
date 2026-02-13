<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Arbitro;
use Illuminate\Auth\Access\HandlesAuthorization;

class ArbitroPolicy
{
    use HandlesAuthorization;

    /**
     * Anula todas las políticas si el usuario es un administrador.
     */
    public function before(User $user)
    {
        if ($user->rol === 'admin') {
             return true;
        }
        return null;
    }

    /**
     * Determina si el usuario puede ver cualquier árbitro (lista).
     */
    public function viewAny(User $user)
    {
        // Los árbitros son públicos para la visualización (o para usuarios autenticados)
        return true; 
    }

    /**
     * Determina si el usuario puede ver un árbitro específico.
     */
    public function view(User $user, Arbitro $arbitro)
    {
        return true;
    }

    /**
     * Determina si el usuario puede crear árbitros.
     */
    public function create(User $user)
    {
        // Solo moderadores y administradores pueden registrar nuevos árbitros.
        return in_array($user->rol, ['moderador', 'admin']);
    }

    /**
     * Determina si el usuario puede actualizar un árbitro.
     */
    public function update(User $user, Arbitro $arbitro)
    {
        // Solo un moderador/admin puede actualizar la información de un árbitro.
        return in_array($user->rol, ['moderador', 'admin']);
    }

    /**
     * Determina si el usuario puede eliminar un árbitro.
     */
    public function delete(User $user, Arbitro $arbitro)
    {
        // Solo un administrador puede eliminar un árbitro.
        return $user->rol === 'admin';
    }
}