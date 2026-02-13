<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class NoticiaSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('noticias')->insert([
            ['id' => 1, 'titulo' => 'Inicio del Torneo Apertura 2026', 'contenido' => 'Se anuncia el inicio del torneo de fútbol más esperado del año.', 'imagen' => '/img/noticia1.jpg', 'created_at' => '2026-01-03 16:10:00', 'updated_at' => '2026-01-03 16:10:00'],
            ['id' => 2, 'titulo' => 'Nuevas inscripciones abiertas', 'contenido' => 'Las inscripciones para nuevos equipos están disponibles hasta fin de mes.', 'imagen' => '/img/noticia2.jpg', 'created_at' => '2026-01-05 10:00:00', 'updated_at' => '2026-01-05 10:00:00'],
        ]);
    }
}