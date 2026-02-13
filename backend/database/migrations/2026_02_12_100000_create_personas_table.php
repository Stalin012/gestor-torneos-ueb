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
        Schema::create('personas', function (Blueprint $table) {
            $table->string('cedula', 10)->primary();
            $table->string('nombres', 100);
            $table->string('apellidos', 100);
            $table->integer('edad')->nullable();
            $table->decimal('estatura', 4, 2)->nullable();
            $table->string('telefono', 20)->nullable();
            $table->string('foto')->nullable();
            $table->string('email')->nullable();
            $table->date('fecha_nacimiento')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('personas');
    }
};
