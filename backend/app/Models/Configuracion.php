<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Configuracion extends Model
{
    use HasFactory;

    protected $table = 'configuracion';

    protected $fillable = [
        'clave',
        'valor',
        'created_at',
        'updated_at',
    ];

    // Muy importante: para que Laravel trate "valor" como JSON/array
    protected $casts = [
        'valor' => 'array',
    ];
}
