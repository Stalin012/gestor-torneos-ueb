<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

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
        return $this->belongsTo(User::class, 'usuario_cedula', 'cedula');
    }

    /**
     * Registrar una acción de auditoría de forma detallada.
     */
    public static function log(string $accion, string $entidad, ?string $entidadId, string $detalle): self
    {
        return self::create([
            'timestamp'      => now(),
            'usuario_cedula' => auth()->user() ? auth()->user()->cedula : 'SISTEMA',
            'accion'         => strtoupper($accion),
            'entidad'        => $entidad,
            'entidad_id'     => $entidadId,
            'detalle'        => $detalle,
        ]);
    }
}
