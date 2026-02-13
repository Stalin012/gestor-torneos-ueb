<?php

namespace App\Policies;

use App\Models\Usuario;
use App\Models\Categoria;
use Illuminate\Auth\Access\HandlesAuthorization;

class CategoriaPolicy
{
    use HandlesAuthorization;

    public function before(Usuario $user)
    {
        if ($user->rol === 'admin') {
             return true;
        }
        return null;
    }

    public function viewAny(Usuario $user)
    {
        return true;
    }

    public function view(Usuario $user, Categoria $categoria)
    {
        return true;
    }

    public function create(Usuario $user)
    {
        // Crear categorías requiere permisos administrativos.
        return in_array($user->rol, ['moderador', 'admin']);
    }

    public function update(Usuario $user, Categoria $categoria)
    {
        // Actualizar categorías requiere permisos administrativos.
        return in_array($user->rol, ['moderador', 'admin']);
    }

    public function delete(Usuario $user, Categoria $categoria)
    {
        // Eliminar categorías requiere un rol de administrador.
        return $user->rol === 'admin';
    }
}