<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;

use App\Models\Torneo;
use App\Models\Persona;
use App\Models\Equipo; // ✅ IMPORTANTE: faltaba para la relación equipos()

class Usuario extends Authenticatable
{
    use HasApiTokens, Notifiable, HasFactory;

    protected $table = 'usuarios';
    protected $primaryKey = 'cedula';

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'cedula',
        'email',
        'password',
        'rol',
        'estado',
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'estado' => 'boolean',
        // 'password' => 'hashed', // si usas Laravel 10+
    ];

    // Torneos creados por este usuario
    public function torneosCreados()
    {
        return $this->hasMany(Torneo::class, 'creado_por', 'cedula');
    }

    // Relación con persona (personas.cedula)
    public function persona()
    {
        return $this->belongsTo(Persona::class, 'cedula', 'cedula');
    }

    /**
     * Un representante puede tener muchos equipos a su cargo.
     */
    public function equipos()
    {
        return $this->hasMany(Equipo::class, 'representante_cedula', 'cedula');
    }
}
