<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User; // 👈 opcionales pero recomendados
use App\Models\Jugador;
use App\Models\Arbitro;

class Persona extends Model
{
    use HasFactory;

    protected $table = 'personas';

    // Clave primaria personalizada
    protected $primaryKey = 'cedula';
    public $incrementing = false;
    protected $keyType = 'string';

    // Tu tabla tiene created_at y updated_at, así que timestamps = true está bien
    public $timestamps = true;

    protected $fillable = [
        'cedula',
        'nombres',
        'apellidos',
        'sexo',
        'genero',
        'fecha_nacimiento',
        'edad',
        'estatura',
        'email',
        'telefono',
        'foto',
        'password',
        'rol',
        'estado',
    ];

    protected $casts = [
        'fecha_nacimiento' => 'date',
    ];

    protected $appends = ['foto_url', 'edad_calculada'];

    /**
     * Relación 1:1 con Usuario
     * personas.cedula -> usuarios.cedula
     */
    public function usuario()
    {
        return $this->hasOne(User::class, 'cedula', 'cedula');
    }

    /**
     * Relación 1:1 con Jugador
     * personas.cedula -> jugadores.cedula
     */
    public function jugador()
    {
        return $this->hasOne(Jugador::class, 'cedula', 'cedula');
    }

    /**
     * Relación 1:1 con Árbitro
     * personas.cedula -> arbitros.cedula
     */
    public function arbitro()
    {
        return $this->hasOne(Arbitro::class, 'cedula', 'cedula');
    }
    public function getFotoUrlAttribute()
    {
        if (!$this->foto) {
            return null;
        }

        if (filter_var($this->foto, FILTER_VALIDATE_URL)) {
            return $this->foto;
        }

        // Si es una ruta local, asegurar que apunte a la API correcta
        $baseUrl = config('app.url');
        
        // Normalizar la ruta: si ya tiene 'fotos/', no duplicar 'storage/'
        $path = $this->foto;
        if (!str_starts_with($path, 'fotos/') && !str_starts_with($path, 'perfiles/') && !str_starts_with($path, 'storage/')) {
            $path = 'fotos/' . $path;
        }
        
        // Return relative path so frontend can prepend API_BASE
        // Si la ruta ya incluye 'storage/', no duplicar
        if (str_starts_with($path, 'storage/')) {
            return $path;
        }
        
        return 'storage/' . $path;
    }

    public function getEdadCalculadaAttribute()
    {
        if (!$this->fecha_nacimiento) {
            return $this->edad;
        }

        return \Carbon\Carbon::parse($this->fecha_nacimiento)->age;
    }
}
