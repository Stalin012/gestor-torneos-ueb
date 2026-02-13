<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Partido;
use App\Models\Torneo;
use App\Models\Equipo;
use App\Models\Arbitro;
use Faker\Factory as Faker;

class PartidoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create('es_ES');

        $torneos = Torneo::all();
        $equipos = Equipo::all();
        $arbitros = Arbitro::all();

        if ($torneos->isEmpty()) {
            $this->call(TorneoSeeder::class);
            $torneos = Torneo::all();
        }
        if ($equipos->isEmpty()) {
            $this->call(EquipoSeeder::class);
            $equipos = Equipo::all();
        }
        if ($arbitros->isEmpty()) {
            $this->call(ArbitroSeeder::class);
            $arbitros = Arbitro::all();
        }

        if ($torneos->isNotEmpty() && $equipos->count() >= 2 && $arbitros->isNotEmpty()) {
            for ($i = 0; $i < 50; $i++) {
                $torneo = $torneos->random();
                $equipoLocal = $equipos->random();
                $equipoVisitante = $equipos->except($equipoLocal->id)->random(); // Ensure different teams
                $arbitro = $arbitros->random();

                $fechaPartido = $faker->dateTimeBetween($torneo->fecha_inicio, $torneo->fecha_fin);

                Partido::create([
                    'torneo_id' => $torneo->id,
                    'equipo_local_id' => $equipoLocal->id,
                    'equipo_visitante_id' => $equipoVisitante->id,
                    'fecha' => $fechaPartido,
                    'hora' => $faker->time('H:i:s'),
                    'campo' => $faker->address,
                    'arbitro_cedula' => $arbitro->cedula,
                    'marcador_local' => $faker->numberBetween(0, 5),
                    'marcador_visitante' => $faker->numberBetween(0, 5),
                    'estado' => $faker->randomElement(['Programado', 'En Curso', 'Finalizado', 'Cancelado']),
                ]);
            }
        }
    }
}
