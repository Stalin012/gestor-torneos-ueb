<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
// ⬇️ CORRECCIÓN CLAVE: Importar el modelo Torneo
use App\Models\Torneo;
use App\Models\Deporte;
// ⬆️ FIN DE CORRECCIÓN

class Categoria extends Model
{
    use HasFactory;

    protected $table = 'categorias';

    protected $fillable = [
        'nombre',
        'descripcion',
        'deporte_id'
    ];

    /**
     * Relación N:1 — Una categoría pertenece a un deporte
     */
    public function deporte()
    {
        return $this->belongsTo(Deporte::class, 'deporte_id');
    }

    /**
     * Relación 1:N — Una categoría tiene muchos torneos
     */
    public function torneos()
    {
        // FK: torneos.categoria_id
        return $this->hasMany(Torneo::class, 'categoria_id');
    }
}