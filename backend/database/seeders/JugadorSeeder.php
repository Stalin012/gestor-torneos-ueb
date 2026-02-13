<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class JugadorSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('jugadores')->insert([
            ['cedula' => '1500982671', 'posicion' => 'Delantero', 'numero' => 10, 'equipo_id' => 5, 'created_at' => '2025-11-09 00:15:35', 'updated_at' => '2025-11-09 00:15:35'],
            ['cedula' => '1500982782', 'posicion' => 'Portero', 'numero' => 1, 'equipo_id' => 5, 'created_at' => '2025-12-24 02:53:37', 'updated_at' => '2025-12-24 02:53:37'],
        ]);
    }
}