<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('torneos', function (Blueprint $table) {
            // PostgreSQL no soporta 'after()', Laravel lo ignora pero es mejor ser limpio.
            // Agregamos las columnas si no existen
            if (!Schema::hasColumn('torneos', 'categorias_incluidas')) {
                $table->json('categorias_incluidas')->nullable();
            }
            if (!Schema::hasColumn('torneos', 'fecha_inicio_inscripciones')) {
                $table->date('fecha_inicio_inscripciones')->nullable();
            }
            if (!Schema::hasColumn('torneos', 'fecha_fin_inscripciones')) {
                $table->date('fecha_fin_inscripciones')->nullable();
            }
            if (!Schema::hasColumn('torneos', 'ciudad_campus')) {
                $table->string('ciudad_campus')->nullable();
            }
            if (!Schema::hasColumn('torneos', 'limite_equipos')) {
                $table->integer('limite_equipos')->nullable();
            }
            if (!Schema::hasColumn('torneos', 'limite_jugadores_equipo')) {
                $table->integer('limite_jugadores_equipo')->nullable();
            }
            if (!Schema::hasColumn('torneos', 'responsable_nombre')) {
                $table->string('responsable_nombre')->nullable();
            }
            if (!Schema::hasColumn('torneos', 'contacto')) {
                $table->string('contacto')->nullable();
            }
            if (!Schema::hasColumn('torneos', 'notas_internas')) {
                $table->text('notas_internas')->nullable();
            }

            // Cambiar categoria_id a nullable de forma segura
            $table->unsignedBigInteger('categoria_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('torneos', function (Blueprint $table) {
            $table->dropColumn([
                'categorias_incluidas',
                'fecha_inicio_inscripciones',
                'fecha_fin_inscripciones',
                'ciudad_campus',
                'limite_equipos',
                'limite_jugadores_equipo',
                'responsable_nombre',
                'contacto',
                'notas_internas'
            ]);
        });
        // \Illuminate\Support\Facades\DB::statement('ALTER TABLE torneos ALTER COLUMN categoria_id SET NOT NULL;');
        // Dejamos pendiente esta reversión para evitar crashes si hay data nullable
    }
};
