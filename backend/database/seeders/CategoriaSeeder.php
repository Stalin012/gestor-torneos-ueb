<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategoriaSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('categorias')->insert([
            ['id' => 1, 'nombre' => 'Libre', 'descripcion' => null, 'deporte_id' => null, 'created_at' => '2026-01-03 16:03:31', 'updated_at' => '2026-01-03 16:03:31'],
            ['id' => 2, 'nombre' => 'Masculino', 'descripcion' => null, 'deporte_id' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 3, 'nombre' => 'Femenino', 'descripcion' => null, 'deporte_id' => 1, 'created_at' => null, 'updated_at' => '2026-01-16 00:23:30'],
            ['id' => 4, 'nombre' => 'Mixto', 'descripcion' => null, 'deporte_id' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 5, 'nombre' => 'Sub-18', 'descripcion' => null, 'deporte_id' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 6, 'nombre' => 'Sub-20', 'descripcion' => null, 'deporte_id' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 7, 'nombre' => 'Master', 'descripcion' => null, 'deporte_id' => null, 'created_at' => null, 'updated_at' => null],
            ['id' => 8, 'nombre' => 'Juvenil', 'descripcion' => null, 'deporte_id' => 3, 'created_at' => '2025-11-26 16:01:09', 'updated_at' => '2026-01-16 00:32:45'],
            ['id' => 10, 'nombre' => 'juvenil 2026', 'descripcion' => null, 'deporte_id' => null, 'created_at' => '2026-01-15 20:52:48', 'updated_at' => '2026-01-15 20:52:48'],
        ]);
    }
}