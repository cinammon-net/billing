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

            // ── Supervivencia (Rust, ARK, Palworld, 7DTD, Conan, DayZ, Zomboid, Enshrouded) ──
            ['category' => 'survival', 'name' => 'Explorer', 'ram_mb' => 6144,  'cpu_pct' => 200, 'storage_gb' => 30,  'price' => 7.99,  'popular' => false],
            ['category' => 'survival', 'name' => 'Warlord',  'ram_mb' => 8192,  'cpu_pct' => 250, 'storage_gb' => 40,  'price' => 9.99,  'popular' => true],
            ['category' => 'survival', 'name' => 'Apex',     'ram_mb' => 12288, 'cpu_pct' => 300, 'storage_gb' => 60,  'price' => 13.99, 'popular' => false],
            ['category' => 'survival', 'name' => 'Legend',   'ram_mb' => 16384, 'cpu_pct' => 400, 'storage_gb' => 80,  'price' => 17.99, 'popular' => false],

            // ── Shooters / FPS (CS2, CS:GO, TF2, Insurgency, L4D2, KF2) ──
            ['category' => 'shooters', 'name' => 'Squad',      'ram_mb' => 4096, 'cpu_pct' => 150, 'storage_gb' => 20, 'price' => 5.99,  'popular' => false],
            ['category' => 'shooters', 'name' => 'Clan',       'ram_mb' => 6144, 'cpu_pct' => 200, 'storage_gb' => 30, 'price' => 7.99,  'popular' => true],
            ['category' => 'shooters', 'name' => 'Pro League', 'ram_mb' => 8192, 'cpu_pct' => 300, 'storage_gb' => 40, 'price' => 10.99, 'popular' => false],

            // ── Sandbox y creativos (GMod, Factorio, Mindustry, Core Keeper, DST, Eco) ──
            ['category' => 'sandbox', 'name' => 'Builder',   'ram_mb' => 4096, 'cpu_pct' => 150, 'storage_gb' => 20, 'price' => 4.99, 'popular' => false],
            ['category' => 'sandbox', 'name' => 'Engineer',  'ram_mb' => 6144, 'cpu_pct' => 200, 'storage_gb' => 30, 'price' => 6.99, 'popular' => true],
            ['category' => 'sandbox', 'name' => 'Architect', 'ram_mb' => 8192, 'cpu_pct' => 250, 'storage_gb' => 40, 'price' => 8.99, 'popular' => false],

            // ── Simuladores (Assetto Corsa, ETS2, ATS) ──
            ['category' => 'simulation', 'name' => 'Cruiser',   'ram_mb' => 4096, 'cpu_pct' => 150, 'storage_gb' => 20, 'price' => 5.49, 'popular' => false],
            ['category' => 'simulation', 'name' => 'Racer',     'ram_mb' => 6144, 'cpu_pct' => 250, 'storage_gb' => 30, 'price' => 7.99, 'popular' => true],
            ['category' => 'simulation', 'name' => 'Endurance', 'ram_mb' => 8192, 'cpu_pct' => 300, 'storage_gb' => 40, 'price' => 9.99, 'popular' => false],

            // ── Servidores de voz (TeamSpeak 3, TeaSpeak, Lavalink) ──
            ['category' => 'voice', 'name' => 'Chat',      'ram_mb' => 1024, 'cpu_pct' => 50,  'storage_gb' => 5,  'price' => 1.49, 'popular' => false],
            ['category' => 'voice', 'name' => 'Community', 'ram_mb' => 2048, 'cpu_pct' => 75,  'storage_gb' => 10, 'price' => 2.49, 'popular' => true],
            ['category' => 'voice', 'name' => 'Network',   'ram_mb' => 4096, 'cpu_pct' => 100, 'storage_gb' => 20, 'price' => 3.99, 'popular' => false],

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
            'survival'  => ['Rust, ARK, Palworld, 7DTD, Conan, DayZ y más', 'Wipes y backups automáticos', 'Instalación instantánea', 'Protección DDoS', 'Soporte 24/7'],
            'shooters'  => ['CS2, CS:GO, TF2, Insurgency y L4D2', 'Tickrate estable para competitivo', 'Instalación instantánea', 'Protección DDoS Game', 'Soporte 24/7'],
            'sandbox'   => ["Garry's Mod, Factorio, Mindustry y DST", 'Workshop y mods compatibles', 'Backups automáticos', 'Protección DDoS', 'Soporte 24/7'],
            'simulation'=> ['Assetto Corsa, ETS2 y ATS', 'Baja latencia para carreras', 'Backups automáticos', 'Protección DDoS', 'Soporte 24/7'],
            'voice'     => ['TeamSpeak 3, TeaSpeak y Lavalink', 'Siempre online', 'Baja latencia de voz', 'Protección DDoS', 'Soporte 24/7'],
            'bots'      => ['Discord, Twitch y TS3', 'Reinicio automático', 'Logs en tiempo real', 'Protección DDoS', 'Soporte 24/7'],
            'databases' => ['Redis, MariaDB, PostgreSQL y MongoDB', 'Backups automáticos', 'Acceso remoto seguro', 'Soporte 24/7'],
            'web'       => ['Certificado SSL gratuito', 'PHP 8.4 y MariaDB', 'Gestor de archivos y SFTP', 'Backups automáticos', 'Soporte 24/7'],
        ];

        // Complementos incluidos en cada plan de hosting web (clave = nombre del plan).
        $webAddons = [
            'Web Start' => [
                ['name' => 'Certificado SSL', 'desc' => "Let's Encrypt con renovación automática"],
                ['name' => '1 base de datos MariaDB', 'desc' => 'Gestionada desde phpMyAdmin'],
                ['name' => '1 cuenta de correo', 'desc' => 'Buzón @tudominio con webmail'],
                ['name' => 'Backups semanales', 'desc' => 'Copia completa con restauración en 1 clic'],
            ],
            'Web Plus' => [
                ['name' => 'Certificado SSL', 'desc' => "Let's Encrypt con renovación automática"],
                ['name' => '3 bases de datos MariaDB', 'desc' => 'Gestionadas desde phpMyAdmin'],
                ['name' => '5 cuentas de correo', 'desc' => 'Buzones @tudominio con webmail'],
                ['name' => 'Subdominios ilimitados', 'desc' => 'Apunta tantos como necesites'],
                ['name' => 'Backups diarios', 'desc' => 'Copia completa con restauración en 1 clic'],
            ],
            'Web Pro' => [
                ['name' => 'Certificado SSL', 'desc' => "Let's Encrypt con renovación automática"],
                ['name' => '10 bases de datos MariaDB', 'desc' => 'Gestionadas desde phpMyAdmin'],
                ['name' => '20 cuentas de correo', 'desc' => 'Buzones @tudominio con webmail'],
                ['name' => 'Subdominios ilimitados', 'desc' => 'Apunta tantos como necesites'],
                ['name' => 'Backups diarios', 'desc' => 'Copia completa con restauración en 1 clic'],
                ['name' => 'CDN con caché global', 'desc' => 'Entrega estática acelerada vía Cloudflare'],
            ],
            'Web Business' => [
                ['name' => 'Certificado SSL', 'desc' => "Let's Encrypt con renovación automática"],
                ['name' => 'Bases de datos ilimitadas', 'desc' => 'MariaDB gestionadas desde phpMyAdmin'],
                ['name' => 'Correo ilimitado', 'desc' => 'Buzones @tudominio con webmail'],
                ['name' => 'Subdominios ilimitados', 'desc' => 'Apunta tantos como necesites'],
                ['name' => 'Backups diarios + bajo demanda', 'desc' => 'Restauración en 1 clic y retención 30 días'],
                ['name' => 'CDN con caché global', 'desc' => 'Entrega estática acelerada vía Cloudflare'],
                ['name' => 'IP dedicada', 'desc' => 'Reputación de envío y SSL propios'],
            ],
        ];

        foreach ($plans as $i => $plan) {
            Plan::updateOrCreate(
                ['slug' => Str::slug($plan['category'] . '-' . $plan['name'])],
                [
                    ...$plan,
                    'cycle_prices' => Plan::defaultCyclePrices($plan['price']),
                    'features' => $features[$plan['category']],
                    'addons' => $webAddons[$plan['name']] ?? null,
                    'sort' => $i,
                ]
            );
        }
    }
}
