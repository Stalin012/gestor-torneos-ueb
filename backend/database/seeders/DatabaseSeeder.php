<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            PersonaSeeder::class,
            UsuarioSeeder::class,
            DeporteSeeder::class,
            CategoriaSeeder::class,
            TorneoSeeder::class,
            EquipoSeeder::class,
            JugadorSeeder::class,
            ArbitroSeeder::class,
            NoticiaSeeder::class,
            GaleriaSeeder::class,
            NotificacionSeeder::class,
            ConfiguracionSeeder::class,
        ]);
    }
}
