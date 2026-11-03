<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            // ── Minecraft ─────────────────────────────────────────────
            ['category' => 'minecraft', 'name' => 'Coal',      'ram_mb' => 2048,  'cpu_pct' => 100, 'storage_gb' => 10,  'price' => 1.99,  'popular' => false],
            ['category' => 'minecraft', 'name' => 'Iron',      'ram_mb' => 4096,  'cpu_pct' => 150, 'storage_gb' => 20,  'price' => 3.99,  'popular' => false],
            ['category' => 'minecraft', 'name' => 'Gold',      'ram_mb' => 6144,  'cpu_pct' => 200, 'storage_gb' => 30,  'price' => 5.99,  'popular' => false],
            ['category' => 'minecraft', 'name' => 'Diamond',   'ram_mb' => 8192,  'cpu_pct' => 250, 'storage_gb' => 40,  'price' => 7.99,  'popular' => true],
            ['category' => 'minecraft', 'name' => 'Netherite', 'ram_mb' => 12288, 'cpu_pct' => 300, 'storage_gb' => 60,  'price' => 11.99, 'popular' => false],
            ['category' => 'minecraft', 'name' => 'Dragon',    'ram_mb' => 16384, 'cpu_pct' => 400, 'storage_gb' => 80,  'price' => 15.99, 'popular' => false],

            // ── Juegos ────────────────────────────────────────────────
            ['category' => 'games', 'name' => 'Starter', 'ram_mb' => 4096,  'cpu_pct' => 150, 'storage_gb' => 20,  'price' => 4.99,  'popular' => false],
            ['category' => 'games', 'name' => 'Pro',     'ram_mb' => 8192,  'cpu_pct' => 250, 'storage_gb' => 40,  'price' => 8.99,  'popular' => true],
            ['category' => 'games', 'name' => 'Elite',   'ram_mb' => 16384, 'cpu_pct' => 400, 'storage_gb' => 80,  'price' => 16.99, 'popular' => false],
            ['category' => 'games', 'name' => 'Titan',   'ram_mb' => 32768, 'cpu_pct' => 600, 'storage_gb' => 160, 'price' => 29.99, 'popular' => false],

            // ── Bots ──────────────────────────────────────────────────
            ['category' => 'bots', 'name' => 'Nano',  'ram_mb' => 512,  'cpu_pct' => 50,  'storage_gb' => 2,  'price' => 1.49, 'popular' => false],
            ['category' => 'bots', 'name' => 'Micro', 'ram_mb' => 1024, 'cpu_pct' => 75,  'storage_gb' => 5,  'price' => 2.49, 'popular' => true],
            ['category' => 'bots', 'name' => 'Max',   'ram_mb' => 2048, 'cpu_pct' => 100, 'storage_gb' => 10, 'price' => 3.99, 'popular' => false],

            // ── Bases de datos ────────────────────────────────────────
            ['category' => 'databases', 'name' => 'Basic', 'ram_mb' => 1024, 'cpu_pct' => 50,  'storage_gb' => 5,  'price' => 1.99, 'popular' => false],
            ['category' => 'databases', 'name' => 'Plus',  'ram_mb' => 2048, 'cpu_pct' => 100, 'storage_gb' => 10, 'price' => 2.99, 'popular' => true],
            ['category' => 'databases', 'name' => 'Ultra', 'ram_mb' => 4096, 'cpu_pct' => 150, 'storage_gb' => 20, 'price' => 4.99, 'popular' => false],

            // ── Hosting web ───────────────────────────────────────────
            ['category' => 'web', 'name' => 'Web Start',    'ram_mb' => 512,  'cpu_pct' => 50,  'storage_gb' => 5,  'price' => 1.99, 'popular' => false],
            ['category' => 'web', 'name' => 'Web Plus',     'ram_mb' => 1024, 'cpu_pct' => 100, 'storage_gb' => 10, 'price' => 3.49, 'popular' => true],
            ['category' => 'web', 'name' => 'Web Pro',      'ram_mb' => 2048, 'cpu_pct' => 150, 'storage_gb' => 25, 'price' => 5.99, 'popular' => false],
            ['category' => 'web', 'name' => 'Web Business', 'ram_mb' => 4096, 'cpu_pct' => 250, 'storage_gb' => 50, 'price' => 9.99, 'popular' => false],
        ];

        $features = [
            'minecraft' => ['Java y Bedrock', 'Instalador de modpacks', 'Backups automáticos', 'Protección DDoS', 'Soporte 24/7'],
            'games'     => ['Más de 55 juegos', 'Instalación instantánea', 'Backups automáticos', 'Protección DDoS', 'Soporte 24/7'],
            'bots'      => ['Discord, Twitch y TS3', 'Reinicio automático', 'Logs en tiempo real', 'Protección DDoS', 'Soporte 24/7'],
            'databases' => ['Redis, MariaDB, PostgreSQL y MongoDB', 'Backups automáticos', 'Acceso remoto seguro', 'Soporte 24/7'],
            'web'       => ['Certificado SSL gratuito', 'PHP 8.4 y MariaDB', 'Gestor de archivos y SFTP', 'Backups automáticos', 'Soporte 24/7'],
        ];

        foreach ($plans as $i => $plan) {
            Plan::updateOrCreate(
                ['slug' => Str::slug($plan['category'] . '-' . $plan['name'])],
                [
                    ...$plan,
                    'cycle_prices' => Plan::defaultCyclePrices($plan['price']),
                    'features' => $features[$plan['category']],
                    'sort' => $i,
                ]
            );
        }
    }
}
