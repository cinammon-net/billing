<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->json('cycle_prices')->nullable()->after('price');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->string('billing_cycle')->default('monthly')->after('price');
            // El precio por hora puede ser una fracción de céntimo.
            $table->decimal('price', 10, 4)->change();
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->decimal('amount', 10, 4)->change();
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('billing_cycle');
        });

        Schema::table('plans', function (Blueprint $table) {
            $table->dropColumn('cycle_prices');
        });
    }
};
