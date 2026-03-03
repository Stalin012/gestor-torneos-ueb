<?php

/**
 * REQUESTS DE USUARIOS PARA RECORDAR:
 * 
 * 1. Sistema de gestión de torneos deportivos UEB
 * 2. Backend Laravel 11 + Frontend React + Vite
 * 3. Base de datos PostgreSQL con migraciones y seeders
 * 4. Autenticación JWT con Laravel Sanctum
 * 5. Sistema de roles: Admin, Representante, Árbitro, Usuario
 * 6. Gestión completa de torneos, equipos y jugadores
 * 7. Sistema de notificaciones en tiempo real
 * 8. Interfaz responsive con diseño moderno glassmorphism
 * 9. Dashboard personalizado por rol
 * 10. Sistema de auditoría y logs
 * 11. Carnet digital para jugadores
 * 12. Gestión de partidos y marcadores
 * 13. Inscripciones a torneos
 * 14. Administración de nóminas
 * 15. Perfil de usuario con foto
 * 
 * CREDENCIALES DE PRUEBA:
 * - Admin: admin@ueb.edu.ec / password
 * - Representante: luis@ueb.edu.ec / password  
 * - Árbitro: bethy@ueb.edu.ec / password
 * - Usuario: winston@ueb.edu.ec / password
 */

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UsuarioSeeder extends Seeder
{
    /**
     * Seed usuarios del sistema con datos reales
     * Incluye: Admin, Representante, Árbitro, Usuario
     */
    public function run(): void
    {
        $usuarios = [
            ['cedula' => '0102030405', 'email' => 'admin@ueb.edu.ec', 'password' => Hash::make('1234'), 'rol' => 'admin', 'nombres' => 'Henry', 'apellidos' => 'Perez', 'estado' => \Illuminate\Support\Facades\DB::raw('true')],
            ['cedula' => '0302429733', 'email' => 'luis@ueb.edu.ec', 'password' => Hash::make('password'), 'rol' => 'representante', 'nombres' => 'Luis', 'apellidos' => 'Duy', 'estado' => \Illuminate\Support\Facades\DB::raw('true')],
            ['cedula' => '1500511231', 'email' => 'bethy@ueb.edu.ec', 'password' => Hash::make('password'), 'rol' => 'arbitro', 'nombres' => 'Bethy', 'apellidos' => 'Chongo', 'estado' => \Illuminate\Support\Facades\DB::raw('true')],
            ['cedula' => '1500982782', 'email' => 'winston@ueb.edu.ec', 'password' => Hash::make('password'), 'rol' => 'usuario', 'nombres' => 'Winston', 'apellidos' => 'Alvarado', 'estado' => \Illuminate\Support\Facades\DB::raw('true')],
            ['cedula' => '1500470453', 'email' => 'saul.alvarado@ueb.edu.ec', 'password' => Hash::make('12345678'), 'rol' => 'representante', 'nombres' => 'Saul', 'apellidos' => 'Alvarado', 'estado' => \Illuminate\Support\Facades\DB::raw('true')],
        ];

        foreach ($usuarios as $userData) {
            $cedula = (string)$userData['cedula'];
            $email = $userData['email'];
            $password = $userData['password'];
            $rol = $userData['rol'];
            $nombres = $userData['nombres'];
            $apellidos = $userData['apellidos'];
            $now = now();

            // 🛡️ SOLUCIÓN HARD RAW PARA SUPABASE
            // Primero borramos si existe para simular el updateOrInsert
            \Illuminate\Support\Facades\DB::statement("DELETE FROM usuarios WHERE cedula = ?", [$cedula]);
            
            \Illuminate\Support\Facades\DB::statement("
                INSERT INTO usuarios (cedula, email, password, rol, nombres, apellidos, estado, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, TRUE, ?, ?)
            ", [$cedula, $email, $password, $rol, $nombres, $apellidos, $now, $now]);
        }
    }
}