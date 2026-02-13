<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class GaleriaSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('galeria')->insert([
            ['id' => 1, 'titulo' => 'Torneo Apertura 2026', 'descripcion' => 'Imágenes del torneo', 'imagen' => '/img/torneo1.jpg', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'titulo' => 'Galería de Equipos', 'descripcion' => 'Fotos de los equipos participantes', 'imagen' => '/img/equipos1.jpg', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}