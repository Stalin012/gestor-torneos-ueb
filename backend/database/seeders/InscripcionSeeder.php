<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Inscripcion;
use App\Models\Equipo;
use App\Models\Torneo;
use Faker\Factory as Faker;

class InscripcionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create('es_ES');

        $equipos = Equipo::all();
        $torneos = Torneo::all();

        if ($equipos->isEmpty()) {
            $this->call(EquipoSeeder::class);
            $equipos = Equipo::all();
        }
        if ($torneos->isEmpty()) {
            $this->call(TorneoSeeder::class);
            $torneos = Torneo::all();
        }

        if ($equipos->isNotEmpty() && $torneos->isNotEmpty()) {
            for ($i = 0; $i < 30; $i++) {
                $equipo = $equipos->random();
                $torneo = $torneos->random();

                // Ensure unique combination of equipo_id and torneo_id
                $existingInscripcion = Inscripcion::where('equipo_id', $equipo->id)
                                                ->where('torneo_id', $torneo->id)
                                                ->first();
                if ($existingInscripcion) {
                    continue; // Skip if already exists
                }

                Inscripcion::create([
                    'equipo_id' => $equipo->id,
                    'torneo_id' => $torneo->id,
                    'fecha_inscripcion' => $faker->dateTimeBetween('-1 year', 'now'),
                    'estado' => $faker->randomElement(['Pendiente', 'Aceptada', 'Rechazada']),
                ]);
            }
        }
    }
}
