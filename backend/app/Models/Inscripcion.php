<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Models\Equipo;
use App\Models\Torneo;
use App\Models\Persona;

class Inscripcion extends Model
{
    use HasFactory;

    protected $table = 'inscripciones';

    protected $fillable = [
        'cedula',
        'equipo_id',
        'torneo_id',
        'fecha_inscripcion',
        'estado',
    ];

    protected $casts = [
        'fecha_inscripcion' => 'date',
    ];

    // QUIÉN se inscribe
    public function persona()
    {
        return $this->belongsTo(Persona::class, 'cedula', 'cedula');
    }

    // A QUÉ equipo
    public function equipo()
    {
        return $this->belongsTo(Equipo::class, 'equipo_id');
    }

    // A QUÉ torneo
    public function torneo()
    {
        return $this->belongsTo(Torneo::class, 'torneo_id');
    }
}
