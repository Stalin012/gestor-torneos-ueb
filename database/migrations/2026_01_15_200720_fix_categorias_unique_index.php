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
        Schema::table('categorias', function (Blueprint $table) {
            // Eliminar la restricción única existente que puede estar corrupta
            $table->dropUnique(['nombre']);

            // Recrear la restricción única
            $table->unique('nombre');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('categorias', function (Blueprint $table) {
            $table->dropUnique(['nombre']);
            $table->unique('nombre');
        });
    }
};
