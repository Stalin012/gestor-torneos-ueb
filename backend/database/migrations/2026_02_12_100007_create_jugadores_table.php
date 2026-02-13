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
        Schema::create('jugadores', function (Blueprint $table) {
            $table->string('cedula', 10)->primary();
            $table->foreignId('equipo_id')->nullable()->constrained('equipos')->onDelete('set null');
            $table->string('posicion')->nullable();
            $table->integer('numero')->nullable();
            $table->string('carnet_qr')->nullable();
            $table->string('carnet_pdf')->nullable();
            $table->integer('victorias')->default(0);
            $table->integer('derrotas')->default(0);
            $table->integer('empates')->default(0);
            $table->string('qr_token', 80)->nullable();
            $table->timestamp('qr_generated_at')->nullable();
            $table->string('carrera')->nullable();
            $table->string('facultad')->nullable();
            $table->timestamps();

            $table->foreign('cedula')->references('cedula')->on('personas')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jugadores');
    }
};
