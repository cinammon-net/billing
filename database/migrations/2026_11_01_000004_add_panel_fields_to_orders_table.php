<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->unsignedBigInteger('panel_server_id')->nullable()->after('renews_at');
            $table->string('panel_server_uuid')->nullable()->after('panel_server_id');
            $table->string('server_address')->nullable()->after('panel_server_uuid');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['panel_server_id', 'panel_server_uuid', 'server_address']);
        });
    }
};
