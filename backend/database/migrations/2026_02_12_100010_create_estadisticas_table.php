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
        Schema::create('estadisticas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('partido_id')->constrained('partidos')->onDelete('cascade');
            $table->string('jugador_cedula', 10);
            $table->string('tipo');
            $table->integer('minuto')->nullable();
            $table->text('observaciones')->nullable();
            $table->integer('goles')->default(0);
            $table->timestamps();

            $table->foreign('jugador_cedula')->references('cedula')->on('jugadores')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('estadisticas');
    }
};
