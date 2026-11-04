<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            // Rangos VIP: rol del panel que concede el plan (null = plan de servidor) y sus ventajas.
            $table->string('role')->nullable()->after('egg');
            $table->json('perks')->nullable()->after('features');
        });
    }

    public function down(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->dropColumn(['role', 'perks']);
        });
    }
};
