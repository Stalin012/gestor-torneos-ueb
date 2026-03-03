<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ArbitroSeeder extends Seeder
{
    public function run(): void
    {
        $arbitros = [
            ['cedula' => '1500511231', 'experiencia' => 6, 'especialidad' => null, 'estado' => 'Certificado', 'created_at' => '2026-02-05 15:00:42', 'updated_at' => '2026-02-05 15:17:05'],
        ];

        foreach ($arbitros as $arbitro) {
            DB::table('arbitros')->updateOrInsert(['cedula' => $arbitro['cedula']], $arbitro);
        }
    }
}