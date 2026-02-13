<?php
// app/Models/Estadistica.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Estadistica extends Model
{
    protected $fillable = [
        'jugador_cedula',
        'partido_id',
        'goles',
        'asistencias',
        'tarjetas_amarillas',
        'tarjetas_rojas',
        'rebotes',
        'bloqueos',
    ];

    // Relación N:1 con Jugador
    public function jugador()
    {
        return $this->belongsTo(Jugador::class, 'jugador_cedula', 'cedula');
    }

    // Relación N:1 con Partido
    public function partido()
    {
        return $this->belongsTo(Partido::class);
    }
}