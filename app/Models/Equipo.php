<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
// ⬇️ CORRECCIONES CLAVE: Importar los modelos relacionados
use App\Models\Torneo;
use App\Models\Deporte;
use App\Models\Categoria;
use App\Models\Jugador;
use App\Models\Partido;
use App\Models\Inscripcion;
// ⬆️ FIN DE CORRECCIONES

class Equipo extends Model
{
    use HasFactory;

    protected $table = 'equipos';

    /**
     * Los atributos que son asignables masivamente.
     */
    protected $fillable = [
        'nombre',
        'torneo_id',
        'logo',      // coincide con el nombre de la columna en la BD
        'deporte_id',
        'categoria_id',
        'representante_cedula',
    ];

    // --- RELACIONES ---

    /**
     * Un equipo pertenece a un torneo.
     */
    public function torneo()
    {
        return $this->belongsTo(Torneo::class, 'torneo_id');
    }

    /**
     * Un equipo pertenece a un deporte.
     */
    public function deporte()
    {
        return $this->belongsTo(Deporte::class, 'deporte_id');
    }

    /**
     * Un equipo pertenece a una categoría.
     */
    public function categoria()
    {
        return $this->belongsTo(Categoria::class, 'categoria_id');
    }

    /**
     * Un equipo tiene muchos jugadores.
     * (relación UNO a MUCHOS)
     */
    public function jugadores()
    {
        return $this->hasMany(Jugador::class, 'equipo_id');
    }

    /**
     * Un equipo tiene muchos partidos como local.
     */
    public function partidosLocal()
    {
        return $this->hasMany(Partido::class, 'equipo_local_id');
    }

    /**
     * Un equipo tiene muchos partidos como visitante.
     */
    public function partidosVisitante()
    {
        return $this->hasMany(Partido::class, 'equipo_visitante_id');
    }
    public function inscripciones()
    {
        return $this->hasMany(Inscripcion::class, 'equipo_id');
    }
}