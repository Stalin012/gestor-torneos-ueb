<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Arbitro extends Model
{
    use HasFactory;

    protected $table = 'arbitros';

    // La PK es la cédula, no un ID autoincremental
    protected $primaryKey = 'cedula';
    public $incrementing = false;
    protected $keyType = 'string';

    public $timestamps = true;

    protected $fillable = [
        'cedula',
        'experiencia',
    ];

    /**
     * Relación 1:1 con Persona
     */
    public function persona()
    {
        return $this->belongsTo(Persona::class, 'cedula', 'cedula');
    }

    /**
     * Relación 1:N con Partidos (los partidos que ha arbitrado)
     */
    public function partidos()
    {
        return $this->hasMany(Partido::class, 'arbitro_cedula', 'cedula');
    }
}
