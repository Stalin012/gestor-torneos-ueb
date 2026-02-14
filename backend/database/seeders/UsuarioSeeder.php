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

class UsuarioSeeder extends Seeder
{
    /**
     * Seed usuarios del sistema con datos reales
     * Incluye: Admin, Representante, Árbitro, Usuario
     */
    public function run(): void
    {
        DB::table('usuarios')->insert([
            // Admin del sistema
            ['cedula' => '0102030405', 'email' => 'admin@ueb.edu.ec', 'password' => '$2y$12$c6jFhoECiqfrKMLM2qBAC.6CK0.Y8dcatrOKuFyEQbpD7EogncPca', 'rol' => 'admin', 'estado' => true, 'nombres' => null, 'apellidos' => null, 'foto' => '/img/usuarios/admin.jpg', 'telefono' => null, 'created_at' => '2025-11-27 14:45:06', 'updated_at' => '2026-02-05 16:59:48'],
            
            // Representante de equipos
            ['cedula' => '0302429733', 'email' => 'luis@ueb.edu.ec', 'password' => '$2y$12$oGi146qP/5sxT3DALc8yFOt2jD.fqKVTujAfEYjvnKuMHbrcZRljW', 'rol' => 'representante', 'estado' => true, 'nombres' => null, 'apellidos' => null, 'foto' => '/img/usuarios/representante.jpg', 'telefono' => null, 'created_at' => '2025-12-18 14:14:25', 'updated_at' => '2026-02-05 17:00:09'],
            
            // Árbitro del sistema
            ['cedula' => '1500511231', 'email' => 'bethy@ueb.edu.ec', 'password' => '$2y$12$Ggnjj2Ei8hj1bCTuwFvdI.tIiEU9wjD6nB3WQOfPmRTKgHemexfpG', 'rol' => 'arbitro', 'estado' => true, 'nombres' => null, 'apellidos' => null, 'foto' => '/img/usuarios/arbitro.jpg', 'telefono' => null, 'created_at' => '2025-11-30 23:18:16', 'updated_at' => '2026-01-15 02:26:18'],
            
            // Usuario/Jugador estándar
            ['cedula' => '1500982782', 'email' => 'winston@ueb.edu.ec', 'password' => '$2y$12$pVjLg.UEhIP3iAXzDtviE.Kp8yjHOJ0g1Yr8r10u/b0cHz4iNSxhW', 'rol' => 'usuario', 'estado' => true, 'nombres' => null, 'apellidos' => null, 'foto' => '/img/usuarios/usuario.jpg', 'telefono' => null, 'created_at' => '2025-12-24 02:53:38', 'updated_at' => '2026-02-05 21:11:56'],
        ]);
        
        // Nota: Todas las contraseñas son 'password' hasheadas con bcrypt
    }
}