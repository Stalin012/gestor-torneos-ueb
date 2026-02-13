<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Auditoria;
use App\Models\Persona;
use Faker\Factory as Faker;

class AuditoriaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create('es_ES');
        $personasCedulas = Persona::pluck('cedula')->toArray();

        if (empty($personasCedulas)) {
            // If no personas exist, we can't create auditoria entries with valid cedulas
            // You might want to seed personas first or handle this case differently
            $this->call(PersonaSeeder::class);
            $personasCedulas = Persona::pluck('cedula')->toArray();
        }

        for ($i = 0; $i < 50; $i++) {
            Auditoria::create([
                'timestamp' => $faker->dateTimeBetween('-1 year', 'now'),
                'usuario_cedula' => $faker->randomElement($personasCedulas),
                'accion' => $faker->randomElement(['crear', 'actualizar', 'eliminar', 'consultar']),
                'entidad' => $faker->randomElement(['Persona', 'Equipo', 'Torneo', 'Partido']),
                'entidad_id' => $faker->uuid(), // Generates a UUID for entity_id
                'detalle' => $faker->sentence(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
