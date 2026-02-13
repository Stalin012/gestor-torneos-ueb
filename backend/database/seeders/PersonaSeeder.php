<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PersonaSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('personas')->insert([
            ['cedula' => '1500982671', 'nombres' => 'Stalin', 'apellidos' => 'Alvarado', 'edad' => 26, 'estatura' => 1.59, 'telefono' => '0989213708', 'foto' => '/img/personas/stalin.jpg', 'email' => null, 'fecha_nacimiento' => null, 'created_at' => '2025-11-09 00:15:35', 'updated_at' => '2025-11-09 00:15:35'],
            ['cedula' => '1500982689', 'nombres' => 'Maria', 'apellidos' => '', 'edad' => null, 'estatura' => null, 'telefono' => null, 'foto' => '/img/personas/maria.jpg', 'email' => null, 'fecha_nacimiento' => null, 'created_at' => '2025-11-10 19:19:13', 'updated_at' => '2025-11-10 19:19:13'],
            ['cedula' => '123456789', 'nombres' => 'Raul', 'apellidos' => 'Lopez', 'edad' => null, 'estatura' => null, 'telefono' => null, 'foto' => '/img/personas/raul.jpg', 'email' => null, 'fecha_nacimiento' => null, 'created_at' => '2025-11-18 14:59:14', 'updated_at' => '2025-11-18 14:59:14'],
            ['cedula' => '1500982673', 'nombres' => 'Raul', 'apellidos' => 'Lopez', 'edad' => null, 'estatura' => null, 'telefono' => null, 'foto' => '/img/personas/raul2.jpg', 'email' => null, 'fecha_nacimiento' => null, 'created_at' => '2025-11-18 15:02:16', 'updated_at' => '2025-11-18 15:02:16'],
            ['cedula' => '0102030405', 'nombres' => 'Henry', 'apellidos' => 'Administrador', 'edad' => null, 'estatura' => null, 'telefono' => null, 'foto' => '/img/personas/henry.jpg', 'email' => null, 'fecha_nacimiento' => null, 'created_at' => '2025-11-27 14:45:04', 'updated_at' => '2026-02-09 15:09:55'],
            ['cedula' => '0302429733', 'nombres' => 'Luis', 'apellidos' => 'Duy', 'edad' => null, 'estatura' => null, 'telefono' => null, 'foto' => '/img/personas/luis.jpg', 'email' => null, 'fecha_nacimiento' => null, 'created_at' => '2025-12-18 14:14:25', 'updated_at' => '2026-02-09 13:00:03'],
            ['cedula' => '1500511231', 'nombres' => 'Bethy', 'apellidos' => 'Chongo', 'edad' => null, 'estatura' => null, 'telefono' => '0989213708', 'foto' => '/img/personas/bethy.jpg', 'email' => null, 'fecha_nacimiento' => null, 'created_at' => '2025-11-30 17:58:13', 'updated_at' => '2026-02-09 13:30:21'],
            ['cedula' => '1500982782', 'nombres' => 'Winston', 'apellidos' => 'Alvarado', 'edad' => null, 'estatura' => null, 'telefono' => null, 'foto' => '/img/personas/winston.jpg', 'email' => null, 'fecha_nacimiento' => null, 'created_at' => '2025-12-24 02:53:37', 'updated_at' => '2026-02-09 13:47:23'],
            ['cedula' => '1500470453', 'nombres' => 'Saul', 'apellidos' => 'Alvarado', 'edad' => null, 'estatura' => null, 'telefono' => null, 'foto' => '/img/personas/saul.jpg', 'email' => null, 'fecha_nacimiento' => null, 'created_at' => '2025-12-15 00:58:41', 'updated_at' => '2025-12-15 00:58:41'],
            ['cedula' => '1718718396', 'nombres' => 'Anthony', 'apellidos' => 'Pozo', 'edad' => null, 'estatura' => null, 'telefono' => null, 'foto' => '/img/personas/anthony.jpg', 'email' => null, 'fecha_nacimiento' => null, 'created_at' => '2025-12-19 17:48:57', 'updated_at' => '2025-12-19 17:48:57'],
        ]);
    }
}