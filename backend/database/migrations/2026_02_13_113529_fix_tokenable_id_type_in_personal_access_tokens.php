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
        if (config('database.default') === 'pgsql') {
            \Illuminate\Support\Facades\DB::statement('ALTER TABLE personal_access_tokens ALTER COLUMN tokenable_id TYPE VARCHAR(255) USING tokenable_id::varchar');
        } else {
            Schema::table('personal_access_tokens', function (Blueprint $table) {
                $table->string('tokenable_id')->change();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (config('database.default') === 'pgsql') {
            \Illuminate\Support\Facades\DB::statement('ALTER TABLE personal_access_tokens ALTER COLUMN tokenable_id TYPE BIGINT USING tokenable_id::bigint');
        } else {
            Schema::table('personal_access_tokens', function (Blueprint $table) {
                $table->bigInteger('tokenable_id')->unsigned()->change();
            });
        }
    }
};

