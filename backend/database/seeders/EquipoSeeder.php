<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EquipoSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('equipos')->insert([
            ['id' => 5, 'nombre' => 'Los Informaticos', 'logo' => '/img/equipos/informaticos.png', 'torneo_id' => 28, 'deporte_id' => 1, 'categoria_id' => 2, 'representante_cedula' => '0302429733', 'created_at' => '2025-12-18 18:17:43', 'updated_at' => '2025-12-18 18:17:43'],
            ['id' => 7, 'nombre' => 'The streamers', 'logo' => '/img/equipos/streamers.png', 'torneo_id' => 28, 'deporte_id' => 3, 'categoria_id' => 3, 'representante_cedula' => '0302429733', 'created_at' => '2025-12-21 19:50:59', 'updated_at' => '2025-12-21 19:50:59'],
            ['id' => 9, 'nombre' => 'Barcelona SC', 'logo' => '/img/equipos/barcelona.png', 'torneo_id' => 1, 'deporte_id' => 1, 'categoria_id' => 1, 'representante_cedula' => null, 'created_at' => '2026-01-03 16:06:40', 'updated_at' => '2026-01-03 16:06:40'],
        ]);
    }
}