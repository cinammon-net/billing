<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            // transfer · bizum · crypto · paypal · simulated
            $table->string('payment_method', 20)->nullable()->after('status');
            // Id del pago en la pasarela (NOWPayments / PayPal)
            $table->string('payment_reference')->nullable()->after('payment_method');
            // Lo que indica el cliente al avisar de una transferencia/Bizum
            $table->string('payer_note', 255)->nullable()->after('payment_reference');
            // Motivo si el admin rechaza un pago manual
            $table->string('admin_note', 255)->nullable()->after('payer_note');
            $table->timestamp('paid_at')->nullable()->after('due_at');
            $table->index(['status', 'payment_method']);
        });
    }

    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropIndex(['status', 'payment_method']);
            $table->dropColumn(['payment_method', 'payment_reference', 'payer_note', 'admin_note', 'paid_at']);
        });
    }
};
