<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

// Importaciones de Modelos
use App\Models\Torneo;
use App\Models\Equipo;

// Importaciones de Políticas
use App\Policies\TorneoPolicy;
use App\Policies\EquipoPolicy;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        // Mapeo del Modelo Torneo a su Política de Autorización
        Torneo::class => TorneoPolicy::class,

        // Mapeo del Modelo Equipo a su Política de Autorización
        Equipo::class => EquipoPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        //
    }
}