<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Estadistica;
use App\Models\Jugador;
use App\Models\Partido;
use Faker\Factory as Faker;

class EstadisticaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create('es_ES');

        $jugadores = Jugador::all();
        $partidos = Partido::all();

        if ($jugadores->isEmpty()) {
            $this->call(JugadorSeeder::class);
            $jugadores = Jugador::all();
        }
        if ($partidos->isEmpty()) {
            $this->call(PartidoSeeder::class);
            $partidos = Partido::all();
        }

        if ($jugadores->isNotEmpty() && $partidos->isNotEmpty()) {
            foreach ($partidos as $partido) {
                $jugadoresLocal = $jugadores->where('equipo_id', $partido->equipo_local_id);
                foreach ($jugadoresLocal as $jugador) {
                    if ($faker->boolean(60)) {
                        Estadistica::create([
                            'jugador_cedula' => $jugador->cedula,
                            'partido_id' => $partido->id,
                            'goles' => $faker->numberBetween(0, 3),
                            'tipo' => $faker->randomElement(['gol', 'asistencia', 'tarjeta_amarilla', 'tarjeta_roja', 'lesion']),
                            'minuto' => $faker->numberBetween(1, 90),
                            'observaciones' => $faker->sentence,
                        ]);
                    }
                }

                $jugadoresVisitante = $jugadores->where('equipo_id', $partido->equipo_visitante_id);
                foreach ($jugadoresVisitante as $jugador) {
                    if ($faker->boolean(60)) {
                        Estadistica::create([
                            'jugador_cedula' => $jugador->cedula,
                            'partido_id' => $partido->id,
                            'goles' => $faker->numberBetween(0, 3),
                            'tipo' => $faker->randomElement(['gol', 'asistencia', 'tarjeta_amarilla', 'tarjeta_roja', 'lesion']),
                            'minuto' => $faker->numberBetween(1, 90),
                            'observaciones' => $faker->sentence,
                        ]);
                    }
                }
            }
        }
    }
}
