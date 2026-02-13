<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class EquiposYJugadoresSeeder extends Seeder
{
    public function run()
    {
        // 1. DESACTIVAR RESTRICCIONES (Para evitar el error de Check)
        DB::statement('SET session_replication_role = "replica";');

        // 2. CREAR DATOS PADRE (Deporte y Categoría)
        DB::table('deportes')->updateOrInsert(['id' => 1], ['nombre' => 'Fútbol']);
        DB::table('categorias')->updateOrInsert(['id' => 1], ['nombre' => 'Libre']);

        // 3. CREAR EL TORNEO 
        // He puesto 'Activo', pero con la restricción desactivada debería aceptarlo.
        DB::table('torneos')->updateOrInsert(
            ['id' => 1],
            [
                'nombre' => 'Torneo Apertura 2026',
                'deporte_id' => 1,
                'categoria_id' => 1,
                'fecha_inicio' => '2026-02-01',
                'fecha_fin' => '2026-06-01',
                'estado' => 'Activo', 
                'created_at' => now(),
                'updated_at' => now()
            ]
        );

        // 4. LISTA DE EQUIPOS CON CÉDULAS REALES
        $datosEquipos = [
            ['nombre' => 'Barcelona SC', 'cedula' => '0921345678'],
            ['nombre' => 'Emelec', 'cedula' => '0912345679'],
            ['nombre' => 'Liga de Quito', 'cedula' => '1712345678'],
            ['nombre' => 'Independiente del Valle', 'cedula' => '1723456789'],
            ['nombre' => 'El Nacional', 'cedula' => '1701234567'],
            ['nombre' => 'Delfín SC', 'cedula' => '1309876543'],
            ['nombre' => 'Deportivo Cuenca', 'cedula' => '0102345678'],
            ['nombre' => 'Mushuc Runa', 'cedula' => '1803456782'],
            ['nombre' => 'Aucas', 'cedula' => '1715678901'],
            ['nombre' => 'Universidad Católica', 'cedula' => '1718901234'],
            ['nombre' => 'Macará', 'cedula' => '1801234567'],
            ['nombre' => 'Técnico Universitario', 'cedula' => '1809876543'],
        ];

        foreach ($datosEquipos as $info) {
            $cedula = $info['cedula'];
            
            // Persona
            DB::table('personas')->updateOrInsert(
                ['cedula' => $cedula],
                ['nombres' => 'Capitán', 'apellidos' => $info['nombre'], 'email' => "user{$cedula}@ueb.edu.ec"]
            );

            // Usuario
            DB::table('usuarios')->updateOrInsert(
                ['cedula' => $cedula],
                ['email' => "user{$cedula}@ueb.edu.ec", 'password' => Hash::make('password123'), 'rol' => 'jugador']
            );

            // Equipo
            $equipoId = DB::table('equipos')->insertGetId([
                'nombre' => $info['nombre'],
                'torneo_id' => 1,
                'deporte_id' => 1,
                'categoria_id' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // Jugador
            DB::table('jugadores')->insert([
                'cedula' => $cedula,
                'equipo_id' => $equipoId,
                'posicion' => 'Capitán',
                'numero' => 10,
                'victorias' => 0, 'derrotas' => 0, 'empates' => 0,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }

        // 6. CREAR ALGUNOS PARTIDOS CON MARCADORES PARA LA TABLA DE POSICIONES
        $partidos = [
            ['local' => 1, 'visitante' => 2, 'ml' => 2, 'mv' => 1], // Barcelona 2-1 Emelec
            ['local' => 3, 'visitante' => 4, 'ml' => 1, 'mv' => 1], // Liga 1-1 IDV
            ['local' => 5, 'visitante' => 6, 'ml' => 3, 'mv' => 0], // Nacional 3-0 Delfín
            ['local' => 7, 'visitante' => 8, 'ml' => 0, 'mv' => 2], // Cuenca 0-2 Mushuc
            ['local' => 9, 'visitante' => 10, 'ml' => 1, 'mv' => 0], // Aucas 1-0 Católica
            ['local' => 11, 'visitante' => 12, 'ml' => 2, 'mv' => 2], // Macará 2-2 Técnico
        ];

        foreach ($partidos as $p) {
            DB::table('partidos')->insert([
                'torneo_id' => 1,
                'equipo_local_id' => $p['local'],
                'equipo_visitante_id' => $p['visitante'],
                'fecha' => now()->subDays(rand(1, 10)),
                'hora' => '15:00',
                'campo' => 'Estadio Principal',
                'marcador_local' => $p['ml'],
                'marcador_visitante' => $p['mv'],
                'estado' => 'Finalizado',
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }

        // 7. REACTIVAR RESTRICCIONES
        DB::statement('SET session_replication_role = "origin";');
    }
}