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

            // ── Supervivencia: un plan por juego (egg = nombre exacto en el panel) ──
            ['category' => 'survival', 'egg' => 'Rust Autowipe', 'name' => 'Rust', 'ram_mb' => 8192, 'cpu_pct' => 250, 'storage_gb' => 40, 'price' => 7.99, 'popular' => true],
            ['category' => 'survival', 'egg' => 'Ark: Survival Evolved', 'name' => 'ARK: Survival Evolved', 'ram_mb' => 8192, 'cpu_pct' => 250, 'storage_gb' => 40, 'price' => 7.99, 'popular' => false],
            ['category' => 'survival', 'egg' => 'ARK: Survival Ascended', 'name' => 'ARK: Survival Ascended', 'ram_mb' => 12288, 'cpu_pct' => 300, 'storage_gb' => 60, 'price' => 11.99, 'popular' => false],
            ['category' => 'survival', 'egg' => 'Palworld', 'name' => 'Palworld', 'ram_mb' => 8192, 'cpu_pct' => 250, 'storage_gb' => 40, 'price' => 7.49, 'popular' => false],
            ['category' => 'survival', 'egg' => '7 Days To Die', 'name' => '7 Days to Die', 'ram_mb' => 6144, 'cpu_pct' => 200, 'storage_gb' => 30, 'price' => 5.99, 'popular' => false],
            ['category' => 'survival', 'egg' => 'Conan Exiles', 'name' => 'Conan Exiles', 'ram_mb' => 6144, 'cpu_pct' => 200, 'storage_gb' => 30, 'price' => 5.99, 'popular' => false],
            ['category' => 'survival', 'egg' => 'DayZ (Experimental)', 'name' => 'DayZ', 'ram_mb' => 4096, 'cpu_pct' => 150, 'storage_gb' => 25, 'price' => 4.49, 'popular' => false],
            ['category' => 'survival', 'egg' => 'Project Zomboid', 'name' => 'Project Zomboid', 'ram_mb' => 4096, 'cpu_pct' => 150, 'storage_gb' => 20, 'price' => 3.99, 'popular' => false],
            ['category' => 'survival', 'egg' => 'Enshrouded', 'name' => 'Enshrouded', 'ram_mb' => 6144, 'cpu_pct' => 200, 'storage_gb' => 30, 'price' => 5.99, 'popular' => false],
            ['category' => 'survival', 'egg' => 'V Rising', 'name' => 'V Rising', 'ram_mb' => 4096, 'cpu_pct' => 150, 'storage_gb' => 20, 'price' => 4.49, 'popular' => false],
            ['category' => 'survival', 'egg' => 'Sons Of The Forest', 'name' => 'Sons Of The Forest', 'ram_mb' => 6144, 'cpu_pct' => 200, 'storage_gb' => 30, 'price' => 5.99, 'popular' => false],
            ['category' => 'survival', 'egg' => 'The Forest', 'name' => 'The Forest', 'ram_mb' => 3072, 'cpu_pct' => 100, 'storage_gb' => 15, 'price' => 2.99, 'popular' => false],
            ['category' => 'survival', 'egg' => 'Unturned', 'name' => 'Unturned', 'ram_mb' => 2048, 'cpu_pct' => 100, 'storage_gb' => 10, 'price' => 1.99, 'popular' => false],
            ['category' => 'survival', 'egg' => 'The Isle', 'name' => 'The Isle', 'ram_mb' => 6144, 'cpu_pct' => 200, 'storage_gb' => 30, 'price' => 5.99, 'popular' => false],
            ['category' => 'survival', 'egg' => 'Craftopia', 'name' => 'Craftopia', 'ram_mb' => 4096, 'cpu_pct' => 150, 'storage_gb' => 20, 'price' => 3.99, 'popular' => false],

            // ── Shooters / FPS: un plan por juego (egg = nombre exacto en el panel) ──
            ['category' => 'shooters', 'egg' => 'Counter-Strike 2', 'name' => 'Counter-Strike 2', 'ram_mb' => 4096, 'cpu_pct' => 200, 'storage_gb' => 40, 'price' => 3.99, 'popular' => true],
            ['category' => 'shooters', 'egg' => 'Counter-Strike: Source', 'name' => 'Counter-Strike: Source', 'ram_mb' => 2048, 'cpu_pct' => 100, 'storage_gb' => 10, 'price' => 1.99, 'popular' => false],
            ['category' => 'shooters', 'egg' => 'Team Fortress 2 Classic', 'name' => 'Team Fortress 2 Classic', 'ram_mb' => 2048, 'cpu_pct' => 100, 'storage_gb' => 15, 'price' => 1.99, 'popular' => false],
            ['category' => 'shooters', 'egg' => 'Insurgency: Sandstorm', 'name' => 'Insurgency: Sandstorm', 'ram_mb' => 3072, 'cpu_pct' => 150, 'storage_gb' => 20, 'price' => 2.99, 'popular' => false],
            ['category' => 'shooters', 'egg' => 'Left 4 Dead 2', 'name' => 'Left 4 Dead 2', 'ram_mb' => 2048, 'cpu_pct' => 100, 'storage_gb' => 15, 'price' => 1.99, 'popular' => false],
            ['category' => 'shooters', 'egg' => 'Left 4 Dead', 'name' => 'Left 4 Dead', 'ram_mb' => 1024, 'cpu_pct' => 75, 'storage_gb' => 10, 'price' => 1.49, 'popular' => false],
            ['category' => 'shooters', 'egg' => 'Killing Floor 2', 'name' => 'Killing Floor 2', 'ram_mb' => 2048, 'cpu_pct' => 150, 'storage_gb' => 20, 'price' => 2.49, 'popular' => false],
            ['category' => 'shooters', 'egg' => 'Squad', 'name' => 'Squad', 'ram_mb' => 6144, 'cpu_pct' => 250, 'storage_gb' => 40, 'price' => 6.99, 'popular' => false],
            ['category' => 'shooters', 'egg' => 'Arma 3', 'name' => 'Arma 3', 'ram_mb' => 4096, 'cpu_pct' => 200, 'storage_gb' => 30, 'price' => 4.99, 'popular' => false],
            ['category' => 'shooters', 'egg' => 'Arma Reforger', 'name' => 'Arma Reforger', 'ram_mb' => 6144, 'cpu_pct' => 250, 'storage_gb' => 40, 'price' => 6.49, 'popular' => false],
            ['category' => 'shooters', 'egg' => 'Mordhau', 'name' => 'Mordhau', 'ram_mb' => 3072, 'cpu_pct' => 150, 'storage_gb' => 20, 'price' => 3.49, 'popular' => false],
            ['category' => 'shooters', 'egg' => 'Post Scriptum', 'name' => 'Post Scriptum', 'ram_mb' => 6144, 'cpu_pct' => 250, 'storage_gb' => 40, 'price' => 6.49, 'popular' => false],
            ['category' => 'shooters', 'egg' => 'Holdfast NaW', 'name' => 'Holdfast: NaW', 'ram_mb' => 2048, 'cpu_pct' => 150, 'storage_gb' => 15, 'price' => 2.49, 'popular' => false],

            // ── Sandbox y creativos: un plan por juego (egg = nombre exacto en el panel) ──
            ['category' => 'sandbox', 'egg' => 'Factorio', 'name' => 'Factorio', 'ram_mb' => 2048, 'cpu_pct' => 100, 'storage_gb' => 10, 'price' => 1.99, 'popular' => true],
            ['category' => 'sandbox', 'egg' => 'Mindustry', 'name' => 'Mindustry', 'ram_mb' => 1024, 'cpu_pct' => 75, 'storage_gb' => 5, 'price' => 1.49, 'popular' => false],
            ['category' => 'sandbox', 'egg' => 'Core Keeper', 'name' => 'Core Keeper', 'ram_mb' => 2048, 'cpu_pct' => 100, 'storage_gb' => 10, 'price' => 2.49, 'popular' => false],
            ['category' => 'sandbox', 'egg' => "Don't Starve Together", 'name' => "Don't Starve Together", 'ram_mb' => 2048, 'cpu_pct' => 100, 'storage_gb' => 10, 'price' => 1.99, 'popular' => false],
            ['category' => 'sandbox', 'egg' => 'Eco', 'name' => 'Eco', 'ram_mb' => 4096, 'cpu_pct' => 150, 'storage_gb' => 20, 'price' => 3.99, 'popular' => false],
            ['category' => 'sandbox', 'egg' => 'Satisfactory', 'name' => 'Satisfactory', 'ram_mb' => 8192, 'cpu_pct' => 250, 'storage_gb' => 30, 'price' => 7.49, 'popular' => false],
            ['category' => 'sandbox', 'egg' => 'Space Engineers', 'name' => 'Space Engineers', 'ram_mb' => 6144, 'cpu_pct' => 200, 'storage_gb' => 30, 'price' => 5.99, 'popular' => false],
            ['category' => 'sandbox', 'egg' => 'tshock', 'name' => 'Terraria (TShock)', 'ram_mb' => 1024, 'cpu_pct' => 75, 'storage_gb' => 5, 'price' => 1.49, 'popular' => false],
            ['category' => 'sandbox', 'egg' => 'Stationeers', 'name' => 'Stationeers', 'ram_mb' => 4096, 'cpu_pct' => 150, 'storage_gb' => 20, 'price' => 3.99, 'popular' => false],
            ['category' => 'sandbox', 'egg' => 'Barotrauma', 'name' => 'Barotrauma', 'ram_mb' => 2048, 'cpu_pct' => 100, 'storage_gb' => 10, 'price' => 1.99, 'popular' => false],
            ['category' => 'sandbox', 'egg' => 'Rising World Unity', 'name' => 'Rising World', 'ram_mb' => 4096, 'cpu_pct' => 150, 'storage_gb' => 20, 'price' => 3.99, 'popular' => false],
            ['category' => 'sandbox', 'egg' => 'Veloren', 'name' => 'Veloren', 'ram_mb' => 2048, 'cpu_pct' => 100, 'storage_gb' => 10, 'price' => 1.99, 'popular' => false],

            // ── Simuladores: un plan por juego (egg = nombre exacto en el panel) ──
            ['category' => 'simulation', 'egg' => 'Assetto Corsa', 'name' => 'Assetto Corsa', 'ram_mb' => 2048, 'cpu_pct' => 150, 'storage_gb' => 15, 'price' => 2.49, 'popular' => true],
            ['category' => 'simulation', 'egg' => 'Euro Truck Simulator 2 Dedicated server', 'name' => 'Euro Truck Simulator 2', 'ram_mb' => 2048, 'cpu_pct' => 100, 'storage_gb' => 15, 'price' => 2.49, 'popular' => false],
            ['category' => 'simulation', 'egg' => 'American Truck Simulator Dedicated Server', 'name' => 'American Truck Simulator', 'ram_mb' => 2048, 'cpu_pct' => 100, 'storage_gb' => 15, 'price' => 2.49, 'popular' => false],
            ['category' => 'simulation', 'egg' => 'Stormworks: Build and Rescue', 'name' => 'Stormworks', 'ram_mb' => 3072, 'cpu_pct' => 150, 'storage_gb' => 15, 'price' => 2.99, 'popular' => false],

            // ── Roleplay y GTA: un plan por juego (egg = nombre exacto en el panel) ──
            ['category' => 'roleplay', 'egg' => 'FiveM', 'name' => 'FiveM', 'ram_mb' => 4096, 'cpu_pct' => 200, 'storage_gb' => 30, 'price' => 3.99, 'popular' => true],
            ['category' => 'roleplay', 'egg' => 'RedM', 'name' => 'RedM', 'ram_mb' => 4096, 'cpu_pct' => 200, 'storage_gb' => 30, 'price' => 3.99, 'popular' => false],
            ['category' => 'roleplay', 'egg' => 'alt:V', 'name' => 'alt:V', 'ram_mb' => 4096, 'cpu_pct' => 200, 'storage_gb' => 30, 'price' => 3.99, 'popular' => false],
            ['category' => 'roleplay', 'egg' => 'Multi Theft Auto', 'name' => 'Multi Theft Auto', 'ram_mb' => 1024, 'cpu_pct' => 100, 'storage_gb' => 10, 'price' => 1.49, 'popular' => false],
            ['category' => 'roleplay', 'egg' => 'SA-MP', 'name' => 'SA-MP', 'ram_mb' => 1024, 'cpu_pct' => 75, 'storage_gb' => 5, 'price' => 0.99, 'popular' => false],

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
            'survival'  => ['El juego viene instalado y listo', 'Wipes y backups automáticos', 'Instalación instantánea', 'Protección DDoS', 'Soporte 24/7'],
            'shooters'  => ['El juego viene instalado y listo', 'Tickrate estable para competitivo', 'Instalación instantánea', 'Protección DDoS Game', 'Soporte 24/7'],
            'sandbox'   => ['Factorio, Satisfactory, Terraria, DST y más', 'Workshop y mods compatibles', 'Backups automáticos', 'Protección DDoS', 'Soporte 24/7'],
            'simulation'=> ['El juego viene instalado y listo', 'Baja latencia para carreras', 'Backups automáticos', 'Protección DDoS', 'Soporte 24/7'],
            'roleplay'  => ['FiveM, RedM, alt:V, MTA y SA-MP', 'txAdmin y recursos personalizados', 'Instalación instantánea', 'Protección DDoS', 'Soporte 24/7'],
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
            $slug = Str::slug($plan['category'] . '-' . $plan['name']);
            $existing = Plan::where('slug', $slug)->first();
            $attributes = [
                'egg' => null,
                ...$plan,
                'cycle_prices' => Plan::defaultCyclePrices($plan['price']),
                'features' => $features[$plan['category']],
                'addons' => $webAddons[$plan['name']] ?? null,
                'sort' => $i,
            ];

            if ($existing) {
                // No pisar los precios que el admin haya cambiado en /admin/plans.
                unset($attributes['price'], $attributes['cycle_prices']);
                $existing->update($attributes);
            } else {
                Plan::create(['slug' => $slug, ...$attributes]);
            }
        }

        // Los niveles genéricos antiguos de las categorías de juegos instalaban siempre el
        // mismo juego; ahora hay un plan por juego. Se quitan solo si nadie los ha comprado.
        $legacy = [
            'survival' => ['Explorer', 'Warlord', 'Apex', 'Legend'],
            'shooters' => ['Squad', 'Clan', 'Pro League'],
            'sandbox' => ['Builder', 'Engineer', 'Architect'],
            'simulation' => ['Cruiser', 'Racer', 'Endurance'],
        ];
        foreach ($legacy as $category => $names) {
            Plan::where('category', $category)->whereIn('name', $names)->whereNull('egg')
                ->whereDoesntHave('orders')
                ->delete();
        }
    }
}
