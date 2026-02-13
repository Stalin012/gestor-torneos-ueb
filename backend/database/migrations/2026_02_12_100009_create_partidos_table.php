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
        Schema::create('partidos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('torneo_id')->constrained('torneos')->onDelete('cascade');
            $table->string('arbitro_cedula', 10)->nullable();
            $table->foreignId('equipo_local_id')->constrained('equipos')->onDelete('cascade');
            $table->foreignId('equipo_visitante_id')->constrained('equipos')->onDelete('cascade');
            $table->timestamp('fecha')->nullable();
            $table->time('hora')->nullable();
            $table->string('campo', 100)->nullable();
            $table->integer('marcador_local')->default(0);
            $table->integer('marcador_visitante')->default(0);
            $table->string('estado')->default('Programado');
            $table->timestamps();

            $table->foreign('arbitro_cedula')->references('cedula')->on('arbitros')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('partidos');
    }
};
