<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('jugadores', function (Blueprint $table) {
            $table->string('carrera')->nullable()->after('posicion');
            $table->string('facultad')->nullable()->after('carrera');
        });
    }

    public function down(): void
    {
        Schema::table('jugadores', function (Blueprint $table) {
            $table->dropColumn(['carrera', 'facultad']);
        });
    }
};