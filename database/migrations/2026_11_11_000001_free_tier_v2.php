<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Servidores gratis v2: el cliente elige el servicio y los recursos (dentro de los límites
 * que pone el admin), las monedas se ganan con anuncios, racha diaria, misiones, invitaciones y compras (sin minijuegos).
 */
return new class extends Migration
{
    public function up(): void
    {
        // Ajustes generales clave → valor (JSON). Lo usa el modo gratis.
        Schema::create('settings', function (Blueprint $table) {
            $table->string('key', 60)->primary();
            $table->json('value')->nullable();
            $table->timestamps();
        });

        Schema::table('orders', function (Blueprint $table) {
            // Los gratuitos no tienen plan: sus recursos van en el propio pedido.
            $table->foreignId('plan_id')->nullable()->change();
            // Pedido gratuito (monedas) con recursos elegidos por el cliente.
            $table->boolean('is_free')->default(false)->after('status');
            $table->string('category', 40)->nullable()->after('is_free');
            $table->string('egg')->nullable()->after('category');
            $table->unsignedInteger('ram_mb')->nullable()->after('egg');
            $table->unsignedSmallInteger('cpu_pct')->nullable()->after('ram_mb');
            $table->unsignedSmallInteger('storage_gb')->nullable()->after('cpu_pct');
            $table->unsignedInteger('coin_daily')->nullable()->after('storage_gb');
            $table->index(['is_free', 'status']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('referral_code', 12)->nullable()->unique();
            $table->foreignId('referred_by')->nullable()->constrained('users')->nullOnDelete();
            // 0 = sin premio aún · 1 = premio por usuario activo · 2 = premio por primera compra
            $table->unsignedTinyInteger('referral_stage')->default(0);
            $table->unsignedSmallInteger('streak_days')->default(0);
            $table->date('last_checkin')->nullable();
        });

        Schema::create('user_missions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('mission', 40);
            $table->timestamps();
            $table->unique(['user_id', 'mission']);
        });

        // Los gratuitos de la v1 (planes con coin_cost) pasan a marcarse como gratuitos.
        $freePlans = DB::table('plans')->whereNotNull('coin_cost')->pluck('id');
        if ($freePlans->isNotEmpty()) {
            DB::table('orders')->whereIn('plan_id', $freePlans)->update(['is_free' => true]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('user_missions');
        Schema::table('users', function (Blueprint $t) {
            $t->dropConstrainedForeignId('referred_by');
            $t->dropColumn(['referral_code', 'referral_stage', 'streak_days', 'last_checkin']);
        });
        Schema::table('orders', function (Blueprint $t) {
            $t->dropIndex(['is_free', 'status']);
            $t->dropColumn(['is_free', 'category', 'egg', 'ram_mb', 'cpu_pct', 'storage_gb', 'coin_daily']);
        });
        Schema::dropIfExists('settings');
    }
};
