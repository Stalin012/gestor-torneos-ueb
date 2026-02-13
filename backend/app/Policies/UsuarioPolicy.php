<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class UsuarioPolicy
{
    use HandlesAuthorization;

    public function before(User $user)
    {
        // Solo un administrador puede anular las reglas de gestión de usuarios.
        if ($user->rol === 'admin') {
             return true;
        }
        return null;
    }

    public function viewAny(User $user)
    {
        // Generalmente, solo los administradores pueden ver la lista completa de usuarios.
        return $user->rol === 'admin';
    }

    public function view(User $user, User $model)
    {
        // Un usuario puede ver su propio perfil O un admin/moderador puede ver cualquier perfil.
        return $user->id === $model->id || in_array($user->rol, ['moderador', 'admin']);
    }

    public function create(User $user)
    {
        // La creación de usuarios suele ser libre (registro), o restringida a un admin si es una interfaz interna.
        // Asumimos que el registro es manejado por AuthController, y esta Policy aplica a la gestión de usuarios por admins.
        return $user->rol === 'admin';
    }

    public function update(User $user, User $model)
    {
        // Un usuario puede actualizar su propio perfil O un admin puede actualizar cualquier perfil.
        return $user->id === $model->id || $user->rol === 'admin';
    }

    public function delete(User $user, User $model)
    {
        // Nadie puede eliminarse a sí mismo, y solo el administrador puede eliminar a otros.
        return $user->id !== $model->id && $user->rol === 'admin';
    }
}