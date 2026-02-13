<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
// ⬇️ CORRECCIONES CLAVE: Importar los modelos relacionados
use App\Models\Torneo;
use App\Models\Arbitro;
use App\Models\Equipo;
use App\Models\Estadistica;
// ⬆️ FIN DE CORRECCIONES

class Partido extends Model
{
    use HasFactory;

    protected $table = 'partidos';

    protected $fillable = [
        'torneo_id',
        'arbitro_cedula',
        'equipo_local_id',
        'equipo_visitante_id',
        'fecha',
        'hora',
        'campo',
        'marcador_local',
        'marcador_visitante',
        'estado',
    ];

    protected $casts = [
        'fecha' => 'date',
        'hora' => 'datetime:H:i',
        'marcador_local' => 'integer',
        'marcador_visitante' => 'integer',
    ];

    // Relación N:1 con Torneo
    public function torneo()
    {
        return $this->belongsTo(Torneo::class, 'torneo_id');
    }

    // Relación N:1 con Arbitro
    public function arbitro()
    {
        return $this->belongsTo(Arbitro::class, 'arbitro_cedula', 'cedula');
    }

    // Relación N:1 con Equipo Local
    public function equipo_local()
    {
        return $this->belongsTo(Equipo::class, 'equipo_local_id');
    }

    // Relación N:1 con Equipo Visitante
    public function equipo_visitante()
    {
        return $this->belongsTo(Equipo::class, 'equipo_visitante_id');
    }

    // Alias para compatibilidad con frontend
    public function equipoLocal()
    {
        return $this->equipo_local();
    }

    public function equipoVisitante()
    {
        return $this->equipo_visitante();
    }

    // Relación 1:N con Estadísticas (registro de desempeño)
    public function estadisticas()
    {
        return $this->hasMany(Estadistica::class, 'partido_id');
    }
}