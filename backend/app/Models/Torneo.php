<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

// 📌 Importar TODOS los modelos usados en relaciones
use App\Models\Deporte;
use App\Models\Categoria;
use App\Models\User;
use App\Models\Equipo;
use App\Models\Partido;

class Torneo extends Model
{
    use HasFactory;

    // Tabla correcta
    protected $table = 'torneos';

    // Campos permitidos para asignación masiva
    protected $fillable = [
        'nombre',
        'deporte_id',
        'categoria_id',
        'fecha_inicio',
        'fecha_fin',
        'ubicacion',
        'creado_por',     // usuario que creó el torneo
        'estado',         // Activo/Inactivo/Finalizado
        'descripcion',
    ];

    // Cast de fechas
    protected $casts = [
        'fecha_inicio' => 'date',
        'fecha_fin'    => 'date',
    ];

    // ---------------------------------------------------------------
    // 🔗 RELACIONES
    // ---------------------------------------------------------------

    /**
     * Un torneo pertenece a un deporte.
     */
    public function deporte(): BelongsTo
    {
        return $this->belongsTo(Deporte::class, 'deporte_id');
    }

    /**
     * Categoría del torneo (Masculino, Femenino, Mixto, etc.)
     */
    public function categoria(): BelongsTo
    {
        return $this->belongsTo(Categoria::class, 'categoria_id');
    }

    /**
     * Usuario que creó el torneo.
     */
    public function creador(): BelongsTo
    {
        // clave foránea: creado_por (cedula usuario)
        return $this->belongsTo(User::class, 'creado_por', 'cedula');
    }

    /**
     * Equipos inscritos en este torneo.
     */
    public function equipos(): HasMany
    {
        return $this->hasMany(Equipo::class, 'torneo_id');
    }

    /**
     * Partidos asociados al torneo.
     */
    public function partidos(): HasMany
    {
        return $this->hasMany(Partido::class, 'torneo_id');
    }
}
