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
        Schema::table('partidos', function (Blueprint $table) {
            if (!Schema::hasColumn('partidos', 'hora')) {
                $table->time('hora')->nullable()->after('fecha');
            }
            if (!Schema::hasColumn('partidos', 'campo')) {
                $table->string('campo', 100)->nullable()->after('hora');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('partidos', function (Blueprint $table) {
            $table->dropColumn(['hora', 'campo']);
        });
    }
};
