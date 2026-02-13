<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'usuarios';
    protected $primaryKey = 'cedula';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'cedula',
        'nombres',
        'apellidos',
        'edad',
        'estatura',
        'telefono',
        'foto',
        'email',
        'fecha_nacimiento',
        'password',
        'rol',
        'estado',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    protected $appends = ['foto_url', 'edad_calculada'];

    public function getFotoUrlAttribute()
    {
        return $this->persona ? $this->persona->foto_url : null;
    }

    public function getEdadCalculadaAttribute()
    {
        return $this->persona ? $this->persona->edad_calculada : ($this->edad ?? null);
    }

    public function persona()
    {
        return $this->belongsTo(Persona::class, 'cedula', 'cedula');
    }

    public function jugador()
    {
        return $this->hasOne(Jugador::class, 'cedula', 'cedula');
    }

    public function arbitro()
    {
        return $this->hasOne(Arbitro::class, 'cedula', 'cedula');
    }
}
