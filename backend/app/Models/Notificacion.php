<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notificacion extends Model
{
    use HasFactory;

    protected $table = 'notificaciones';

    protected $fillable = [
        'titulo',
        'mensaje',
        'tipo',
        'usuario_cedula',
        'leida',
    ];

    protected $casts = [
        'leida' => 'boolean',
    ];

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_cedula', 'cedula');
    }

    /**
     * Enviar una notificación a un usuario.
     */
    public static function send(string $usuarioCedula, string $titulo, string $mensaje, string $tipo = 'info'): self
    {
        return self::create([
            'usuario_cedula' => $usuarioCedula,
            'titulo'         => $titulo,
            'mensaje'        => $mensaje,
            'tipo'           => $tipo,
            'leida'          => false,
        ]);
    }

    /**
     * Notificar a todos los administradores.
     */
    public static function notifyAdmins(string $titulo, string $mensaje, string $tipo = 'warning'): void
    {
        $admins = User::where('rol', 'admin')->get();
        foreach ($admins as $admin) {
            self::send($admin->cedula, $titulo, $mensaje, $tipo);
        }
    }
}
