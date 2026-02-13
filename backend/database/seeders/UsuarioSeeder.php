<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UsuarioSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('usuarios')->insert([
            ['cedula' => '0102030405', 'email' => 'admin@ueb.edu.ec', 'password' => '$2y$12$c6jFhoECiqfrKMLM2qBAC.6CK0.Y8dcatrOKuFyEQbpD7EogncPca', 'rol' => 'admin', 'estado' => true, 'nombres' => null, 'apellidos' => null, 'foto' => '/img/usuarios/admin.jpg', 'telefono' => null, 'created_at' => '2025-11-27 14:45:06', 'updated_at' => '2026-02-05 16:59:48'],
            ['cedula' => '0302429733', 'email' => 'luis@ueb.edu.ec', 'password' => '$2y$12$oGi146qP/5sxT3DALc8yFOt2jD.fqKVTujAfEYjvnKuMHbrcZRljW', 'rol' => 'representante', 'estado' => true, 'nombres' => null, 'apellidos' => null, 'foto' => '/img/usuarios/representante.jpg', 'telefono' => null, 'created_at' => '2025-12-18 14:14:25', 'updated_at' => '2026-02-05 17:00:09'],
            ['cedula' => '1500511231', 'email' => 'bethy@ueb.edu.ec', 'password' => '$2y$12$Ggnjj2Ei8hj1bCTuwFvdI.tIiEU9wjD6nB3WQOfPmRTKgHemexfpG', 'rol' => 'arbitro', 'estado' => true, 'nombres' => null, 'apellidos' => null, 'foto' => '/img/usuarios/arbitro.jpg', 'telefono' => null, 'created_at' => '2025-11-30 23:18:16', 'updated_at' => '2026-01-15 02:26:18'],
            ['cedula' => '1500982782', 'email' => 'winston@ueb.edu.ec', 'password' => '$2y$12$pVjLg.UEhIP3iAXzDtviE.Kp8yjHOJ0g1Yr8r10u/b0cHz4iNSxhW', 'rol' => 'usuario', 'estado' => true, 'nombres' => null, 'apellidos' => null, 'foto' => '/img/usuarios/usuario.jpg', 'telefono' => null, 'created_at' => '2025-12-24 02:53:38', 'updated_at' => '2026-02-05 21:11:56'],
        ]);
    }
}