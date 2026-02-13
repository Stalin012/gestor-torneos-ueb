<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Equipo;
use App\Models\Persona;

class Jugador extends Model
{
    use HasFactory;

    protected $table = 'jugadores';

    // La clave primaria NO es id, es "cedula"
    protected $primaryKey = 'cedula';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'cedula',
        'equipo_id',
        'posicion',
        'carrera',
        'facultad',
        'numero',
        'carnet_qr',
        'carnet_pdf',
        'qr_token', 
        'qr_generated_at', 
        'victorias',
        'derrotas',
        'empates',
    ];

    protected $casts = [
        'victorias' => 'integer',
        'derrotas' => 'integer',
        'empates' => 'integer',
        'numero' => 'integer',
        'qr_generated_at' => 'datetime', 
    ];

    /**
     * 🟢 CORRECCIÓN CLAVE PARA POSTGRESQL (char/character):
     * Elimina el relleno de espacios (padding) que PostgreSQL añade a las
     * columnas character(10). Esto asegura que la cédula sea idéntica
     * al valor usado en la URL o al campo de la tabla personas.
     */
    public function getCedulaAttribute($value): string
    {
        return trim($value); 
    }

    /**
     * Un jugador pertenece a un equipo.
     */
    public function equipo()
    {
        return $this->belongsTo(Equipo::class, 'equipo_id');
    }

    /**
     * Un jugador es una Persona (comparten la misma cédula).
     */
    public function persona()
    {
        return $this->belongsTo(Persona::class, 'cedula', 'cedula');
    }
}