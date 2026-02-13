<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TorneoSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('torneos')->insert([
            ['id' => 1, 'nombre' => 'Torneo Apertura 2026', 'descripcion' => null, 'deporte_id' => 1, 'categoria_id' => 1, 'fecha_inicio' => '2026-02-01', 'fecha_fin' => '2026-06-01', 'ubicacion' => null, 'estado' => 'Activo', 'creado_por' => null, 'created_at' => '2026-01-03 16:06:40', 'updated_at' => '2026-01-03 16:06:40'],
            ['id' => 28, 'nombre' => 'Software 2025', 'descripcion' => 'Torneo Relampago', 'deporte_id' => 1, 'categoria_id' => 3, 'fecha_inicio' => '2025-11-27', 'fecha_fin' => '2025-12-16', 'ubicacion' => null, 'estado' => 'Activo', 'creado_por' => null, 'created_at' => '2025-11-15 13:06:00', 'updated_at' => '2025-12-15 00:21:11'],
            ['id' => 29, 'nombre' => 'Los Innovadores', 'descripcion' => null, 'deporte_id' => 3, 'categoria_id' => 4, 'fecha_inicio' => '2025-12-16', 'fecha_fin' => '2025-12-31', 'ubicacion' => null, 'estado' => 'Activo', 'creado_por' => null, 'created_at' => '2025-12-15 00:23:48', 'updated_at' => '2025-12-15 00:23:48'],
        ]);
    }
}