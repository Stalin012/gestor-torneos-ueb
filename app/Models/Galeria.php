<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Galeria extends Model
{
    protected $table = 'galeria';

    protected $fillable = [
        'titulo',
        'descripcion',
        'imagen',
    ];
}