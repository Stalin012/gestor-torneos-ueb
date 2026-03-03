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
}
