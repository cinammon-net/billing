<?php

use App\Support\Seasons;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** Descuentos iniciales (solo festivos importantes). Se cambian en /admin/promotions. */
    private const DEFAULT_DISCOUNTS = [
        'black_friday' => 30,
        'christmas' => 20,
        'new_year' => 15,
        'reyes' => 15,
        'halloween' => 15,
        'muertos' => 10,
        'valentine' => 10,
        'easter' => 10,
        'gamer_day' => 10,
        'national' => 10,
    ];

    public function up(): void
    {
        Schema::create('promotions', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->string('name');
            $table->unsignedTinyInteger('percent')->default(0);
            $table->boolean('enabled')->default(true);
            $table->timestamps();
        });

        $now = now();
        DB::table('promotions')->insert(collect(Seasons::promotionKeys())->map(fn ($name, $key) => [
            'key' => $key,
            'name' => $name,
            'percent' => self::DEFAULT_DISCOUNTS[$key] ?? 0,
            'enabled' => true,
            'created_at' => $now,
            'updated_at' => $now,
        ])->values()->all());

        Schema::table('users', function (Blueprint $table) {
            $table->unsignedInteger('coins')->default(0);
        });

        Schema::create('coin_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->integer('amount');
            $table->string('reason', 40);
            $table->string('detail')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'created_at']);
        });

        Schema::create('game_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('game', 20);
            $table->string('token', 64)->unique();
            $table->timestamp('started_at');
            $table->timestamp('finished_at')->nullable();
            $table->unsignedInteger('score')->nullable();
            $table->unsignedInteger('coins')->default(0);
            $table->timestamps();
            $table->index(['user_id', 'started_at']);
        });

        Schema::table('plans', function (Blueprint $table) {
            // Planes gratuitos: se consiguen con monedas y no salen en la tienda.
            $table->unsignedInteger('coin_cost')->nullable()->after('price');
            $table->unsignedInteger('coin_renew_cost')->nullable()->after('coin_cost');
            $table->unsignedSmallInteger('coin_days')->nullable()->after('coin_renew_cost');
        });

        $free = [
            ['slug' => 'free-minecraft', 'name' => 'Gratis · Minecraft', 'category' => 'minecraft', 'egg' => 'Paper', 'features' => ['1 GB RAM · 5 GB disco', 'Hasta 5-8 jugadores', 'Se renueva con monedas']],
            ['slug' => 'free-bot', 'name' => 'Gratis · Bot de Discord', 'category' => 'bots', 'egg' => 'node.js generic', 'features' => ['512 MB RAM · 2 GB disco', 'Node.js', 'Se renueva con monedas']],
        ];
        foreach ($free as $i => $p) {
            DB::table('plans')->insert([
                'category' => $p['category'],
                'egg' => $p['egg'],
                'name' => $p['name'],
                'slug' => $p['slug'],
                'ram_mb' => $p['slug'] === 'free-bot' ? 512 : 1024,
                'cpu_pct' => 50,
                'storage_gb' => $p['slug'] === 'free-bot' ? 2 : 5,
                'price' => 0,
                'coin_cost' => 300,
                'coin_renew_cost' => 200,
                'coin_days' => 7,
                'popular' => false,
                'features' => json_encode($p['features']),
                'sort' => 9000 + $i,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }

    public function down(): void
    {
        DB::table('plans')->whereIn('slug', ['free-minecraft', 'free-bot'])->delete();
        Schema::table('plans', fn (Blueprint $t) => $t->dropColumn(['coin_cost', 'coin_renew_cost', 'coin_days']));
        Schema::dropIfExists('game_sessions');
        Schema::dropIfExists('coin_transactions');
        Schema::table('users', fn (Blueprint $t) => $t->dropColumn('coins'));
        Schema::dropIfExists('promotions');
    }
};
