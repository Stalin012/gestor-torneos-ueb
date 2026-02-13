<?php
// app/Models/Deporte.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Deporte extends Model
{
    use HasFactory;

    protected $table = 'deportes';

    protected $fillable = [
        'nombre',
        'descripcion',
    ];

    /**
     * Relación 1:N — Un deporte tiene muchos torneos
     */
    public function torneos()
    {
        return $this->hasMany(Torneo::class, 'deporte_id');
    }
}
