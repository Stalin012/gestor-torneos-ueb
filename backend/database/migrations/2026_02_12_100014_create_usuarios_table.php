<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('usuarios', function (Blueprint $table) {
            $table->string('cedula', 10)->primary();
            $table->string('email', 100)->unique();
            $table->string('password');
            $table->string('rol')->default('usuario');
            $table->boolean('estado')->default(true);
            $table->string('nombres', 100)->nullable();
            $table->string('apellidos', 100)->nullable();
            $table->string('foto')->nullable();
            $table->string('telefono', 20)->nullable();
            $table->timestamps();
            
            $table->foreign('cedula')->references('cedula')->on('personas')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('usuarios');
    }
};
