<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Categoria;
use Illuminate\Auth\Access\HandlesAuthorization;

class CategoriaPolicy
{
    use HandlesAuthorization;

    public function before(User $user)
    {
        if ($user->rol === 'admin') {
             return true;
        }
        return null;
    }

    public function viewAny(User $user)
    {
        return true;
    }

    public function view(User $user, Categoria $categoria)
    {
        return true;
    }

    public function create(User $user)
    {
        // Crear categorías requiere permisos administrativos.
        return in_array($user->rol, ['moderador', 'admin']);
    }

    public function update(User $user, Categoria $categoria)
    {
        // Actualizar categorías requiere permisos administrativos.
        return in_array($user->rol, ['moderador', 'admin']);
    }

    public function delete(User $user, Categoria $categoria)
    {
        // Eliminar categorías requiere un rol de administrador.
        return $user->rol === 'admin';
    }
}