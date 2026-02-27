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
        Schema::table('personas', function (Blueprint $table) {
            if (!Schema::hasColumn('personas', 'sexo')) {
                $table->string('sexo', 1)->nullable()->after('apellidos');
            }
            if (!Schema::hasColumn('personas', 'genero')) {
                $table->string('genero', 1)->nullable()->after('sexo');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('personas', function (Blueprint $table) {
            if (Schema::hasColumn('personas', 'genero')) {
                $table->dropColumn('genero');
            }
            if (Schema::hasColumn('personas', 'sexo')) {
                $table->dropColumn('sexo');
            }
        });
    }
};
