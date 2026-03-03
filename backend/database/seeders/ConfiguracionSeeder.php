<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Configuracion;

class ConfiguracionSeeder extends Seeder
{
    public function run(): void
    {
        Configuracion::updateOrCreate(
            ['clave' => 'general'],
            ['valor' => [
                'nombreSistema' => 'Gestor de Torneos UEB',
                'emailContacto' => 'contacto@ueb.edu.ec',
                'logoUrl' => '',
                'timezone' => 'America/Guayaquil',
                'registroAbierto' => true,
            ]]
        );

        Configuracion::updateOrCreate(
            ['clave' => 'operacional'],
            ['valor' => [
                'maxEquiposPorTorneo' => 32,
                'defaultEstadoInscripcion' => 'Pendiente',
                'diasMaximoParaProgramacion' => 15,
                'activarNotificacionesEmail' => true,
            ]]
        );

        Configuracion::updateOrCreate(
            ['clave' => 'seguridad'],
            ['valor' => [
                'longitudMinimaContrasena' => 8,
                'rolUsuarioPorDefecto' => 'Invitado',
                'forzar2FA' => false,
            ]]
        );
    }
}

