<?php

namespace App\Policies;

use App\Models\Usuario;
use Illuminate\Auth\Access\HandlesAuthorization;

class UsuarioPolicy
{
    use HandlesAuthorization;

    public function before(Usuario $user)
    {
        // Solo un administrador puede anular las reglas de gestión de usuarios.
        if ($user->rol === 'admin') {
             return true;
        }
        return null;
    }

    public function viewAny(Usuario $user)
    {
        // Generalmente, solo los administradores pueden ver la lista completa de usuarios.
        return $user->rol === 'admin';
    }

    public function view(Usuario $user, Usuario $model)
    {
        // Un usuario puede ver su propio perfil O un admin/moderador puede ver cualquier perfil.
        return $user->id === $model->id || in_array($user->rol, ['moderador', 'admin']);
    }

    public function create(Usuario $user)
    {
        // La creación de usuarios suele ser libre (registro), o restringida a un admin si es una interfaz interna.
        // Asumimos que el registro es manejado por AuthController, y esta Policy aplica a la gestión de usuarios por admins.
        return $user->rol === 'admin';
    }

    public function update(Usuario $user, Usuario $model)
    {
        // Un usuario puede actualizar su propio perfil O un admin puede actualizar cualquier perfil.
        return $user->id === $model->id || $user->rol === 'admin';
    }

    public function delete(Usuario $user, Usuario $model)
    {
        // Nadie puede eliminarse a sí mismo, y solo el administrador puede eliminar a otros.
        return $user->id !== $model->id && $user->rol === 'admin';
    }
}