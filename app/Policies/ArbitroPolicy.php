<?php

namespace App\Policies;

use App\Models\Usuario;
use App\Models\Arbitro;
use Illuminate\Auth\Access\HandlesAuthorization;

class ArbitroPolicy
{
    use HandlesAuthorization;

    /**
     * Anula todas las políticas si el usuario es un administrador.
     */
    public function before(Usuario $user)
    {
        if ($user->rol === 'admin') {
             return true;
        }
        return null;
    }

    /**
     * Determina si el usuario puede ver cualquier árbitro (lista).
     */
    public function viewAny(Usuario $user)
    {
        // Los árbitros son públicos para la visualización (o para usuarios autenticados)
        return true; 
    }

    /**
     * Determina si el usuario puede ver un árbitro específico.
     */
    public function view(Usuario $user, Arbitro $arbitro)
    {
        return true;
    }

    /**
     * Determina si el usuario puede crear árbitros.
     */
    public function create(Usuario $user)
    {
        // Solo moderadores y administradores pueden registrar nuevos árbitros.
        return in_array($user->rol, ['moderador', 'admin']);
    }

    /**
     * Determina si el usuario puede actualizar un árbitro.
     */
    public function update(Usuario $user, Arbitro $arbitro)
    {
        // Solo un moderador/admin puede actualizar la información de un árbitro.
        return in_array($user->rol, ['moderador', 'admin']);
    }

    /**
     * Determina si el usuario puede eliminar un árbitro.
     */
    public function delete(Usuario $user, Arbitro $arbitro)
    {
        // Solo un administrador puede eliminar un árbitro.
        return $user->rol === 'admin';
    }
}