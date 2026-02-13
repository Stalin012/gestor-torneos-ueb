<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class NotificacionSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('notificaciones')->insert([
            ['titulo' => 'Nuevo torneo disponible', 'mensaje' => 'Se ha creado un nuevo torneo de fútbol', 'tipo' => 'info', 'usuario_cedula' => null, 'leida' => false, 'created_at' => now(), 'updated_at' => now()],
            ['titulo' => 'Inscripciones abiertas', 'mensaje' => 'Las inscripciones están abiertas hasta fin de mes', 'tipo' => 'success', 'usuario_cedula' => null, 'leida' => false, 'created_at' => now(), 'updated_at' => now()],
            ['titulo' => 'Partido programado', 'mensaje' => 'Tu equipo tiene un partido mañana', 'tipo' => 'warning', 'usuario_cedula' => '0302429733', 'leida' => false, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}