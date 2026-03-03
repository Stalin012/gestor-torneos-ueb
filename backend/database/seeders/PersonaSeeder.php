<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PersonaSeeder extends Seeder
{
    public function run(): void
    {
        $personas = [
            ['cedula' => '1500982671', 'nombres' => 'Stalin', 'apellidos' => 'Alvarado', 'edad' => 26, 'estatura' => 1.59, 'telefono' => '0989213708', 'foto' => 'fotos/stalin.jpg', 'email' => 'stalin98alvarado@gmail.com', 'fecha_nacimiento' => '1998-12-18', 'created_at' => '2025-11-09 00:15:35', 'updated_at' => '2025-11-09 00:15:35'],
            ['cedula' => '1500982689', 'nombres' => 'Maria', 'apellidos' => 'Gomez', 'edad' => 22, 'estatura' => 1.65, 'telefono' => '0991234567', 'foto' => 'fotos/maria.jpg', 'email' => 'maria.gomez@ueb.edu.ec', 'fecha_nacimiento' => '2001-08-20', 'created_at' => '2025-11-10 19:19:13', 'updated_at' => '2025-11-10 19:19:13'],
            ['cedula' => '123456789', 'nombres' => 'Raul', 'apellidos' => 'Lopez', 'edad' => 28, 'estatura' => 1.75, 'telefono' => '0987654321', 'foto' => 'fotos/raul.jpg', 'email' => 'raul.lopez@ueb.edu.ec', 'fecha_nacimiento' => '1995-03-10', 'created_at' => '2025-11-18 14:59:14', 'updated_at' => '2025-11-18 14:59:14'],
            ['cedula' => '1500982673', 'nombres' => 'Raul', 'apellidos' => 'Lopez', 'edad' => 25, 'estatura' => 1.70, 'telefono' => '0998765432', 'foto' => 'fotos/raul2.jpg', 'email' => 'raul.lopez2@ueb.edu.ec', 'fecha_nacimiento' => '1998-07-25', 'created_at' => '2025-11-18 15:02:16', 'updated_at' => '2025-11-18 15:02:16'],
            ['cedula' => '0102030405', 'nombres' => 'Henry', 'apellidos' => 'Administrador', 'edad' => 35, 'estatura' => 1.80, 'telefono' => '0987123456', 'foto' => 'fotos/henry.jpg', 'email' => 'henry.admin@ueb.edu.ec', 'fecha_nacimiento' => '1988-01-01', 'created_at' => '2025-11-27 14:45:04', 'updated_at' => '2026-02-09 15:09:55'],
            ['cedula' => '0302429733', 'nombres' => 'Luis', 'apellidos' => 'Duy', 'edad' => 29, 'estatura' => 1.72, 'telefono' => '0987654321', 'foto' => 'fotos/luis.jpg', 'email' => 'luis.duy@ueb.edu.ec', 'fecha_nacimiento' => '1994-04-04', 'created_at' => '2025-12-18 14:14:25', 'updated_at' => '2026-02-09 13:00:03'],
            ['cedula' => '1500511231', 'nombres' => 'Bethy', 'apellidos' => 'Chongo', 'edad' => 23, 'estatura' => 1.60, 'telefono' => '0989213708', 'foto' => 'fotos/bethy.jpg', 'email' => 'bethy.chongo@ueb.edu.ec', 'fecha_nacimiento' => '2000-11-20', 'created_at' => '2025-11-30 17:58:13', 'updated_at' => '2026-02-09 13:30:21'],
            ['cedula' => '1500982782', 'nombres' => 'Winston', 'apellidos' => 'Alvarado', 'edad' => 31, 'estatura' => 1.78, 'telefono' => '0991122334', 'foto' => 'fotos/winston.jpg', 'email' => 'winston.alvarado@ueb.edu.ec', 'fecha_nacimiento' => '1992-09-01', 'created_at' => '2025-12-24 02:53:37', 'updated_at' => '2026-02-09 13:47:23'],
            ['cedula' => '1500470453', 'nombres' => 'Saul', 'apellidos' => 'Alvarado', 'edad' => 27, 'estatura' => 1.73, 'telefono' => '0987654321', 'foto' => 'fotos/saul.jpg', 'email' => 'saul.alvarado@ueb.edu.ec', 'fecha_nacimiento' => '1996-06-05', 'created_at' => '2025-12-15 00:58:41', 'updated_at' => '2025-12-15 00:58:41'],
            ['cedula' => '1718718396', 'nombres' => 'Anthony', 'apellidos' => 'Pozo', 'edad' => 24, 'estatura' => 1.70, 'telefono' => '0995544332', 'foto' => 'fotos/anthony.jpg', 'email' => 'anthony.pozo@ueb.edu.ec', 'fecha_nacimiento' => '1999-02-18', 'created_at' => '2025-12-19 17:48:57', 'updated_at' => '2025-12-19 17:48:57'],
        ];

        foreach ($personas as $persona) {
            DB::table('personas')->updateOrInsert(
                ['cedula' => $persona['cedula']],
                $persona
            );
        }
    }
}