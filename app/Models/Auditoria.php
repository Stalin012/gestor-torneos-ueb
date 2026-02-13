<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Usuario;

class Auditoria extends Model
{
    use HasFactory;

    protected $table = 'auditoria';

    protected $fillable = [
        'timestamp',
        'usuario_cedula',
        'accion',
        'entidad',
        'entidad_id',
        'detalle',
    ];

    protected $casts = [
        'timestamp' => 'datetime',
    ];

    public $timestamps = true;

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_cedula', 'cedula');
    }
}
