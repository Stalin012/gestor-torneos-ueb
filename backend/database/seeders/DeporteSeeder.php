<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DeporteSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('deportes')->insert([
            ['id' => 1, 'nombre' => 'Fútbol', 'descripcion' => 'Deporte de equipo jugado con balón y dos porterías.', 'created_at' => '2026-01-03 16:03:31', 'updated_at' => '2026-01-03 16:03:31'],
            ['id' => 2, 'nombre' => 'Vóley', 'descripcion' => 'Juego con balón y red central.', 'created_at' => '2025-11-08 18:14:23', 'updated_at' => '2025-11-08 18:14:23'],
            ['id' => 3, 'nombre' => 'Básquet', 'descripcion' => 'Juego de balón y aro.', 'created_at' => '2025-11-08 18:14:23', 'updated_at' => '2025-11-08 18:14:23'],
        ]);
    }
}