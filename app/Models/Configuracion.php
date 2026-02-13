<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Configuracion extends Model
{
    protected $table = 'configuracion';

    protected $fillable = [
        'clave',
        'valor',
    ];

    // Muy importante: para que Laravel trate "valor" como JSON/array
    protected $casts = [
        'valor' => 'array',
    ];
}
