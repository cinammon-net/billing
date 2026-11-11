<?php

use App\Models\Plan;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        $botPlans = [
            // WhatsApp Bots (Baileys, WPPConnect, whatsapp-web.js, Venom)
            [
                'category' => 'bots',
                'egg' => 'Bot de WhatsApp',
                'name' => 'WhatsApp Starter',
                'ram_mb' => 1024,
                'cpu_pct' => 75,
                'storage_gb' => 10,
                'price' => 2.49,
                'popular' => false,
                'features' => ['Node.js 22 LTS & Python 3.12', 'Baileys & WPPConnect optimizado', 'Sesión QR multi-dispositivo persistente', 'Reinicio automático 24/7', 'Protección Anti-DDoS'],
            ],
            [
                'category' => 'bots',
                'egg' => 'Bot de WhatsApp',
                'name' => 'WhatsApp Pro',
                'ram_mb' => 2048,
                'cpu_pct' => 125,
                'storage_gb' => 15,
                'price' => 3.99,
                'popular' => true,
                'features' => ['Chromium / Puppeteer (whatsapp-web.js)', 'Envío multimedia y difusión masiva', '2 GB RAM para cero caídas', 'Reinicio automático 24/7', 'Soporte prioritario'],
            ],
            [
                'category' => 'bots',
                'egg' => 'Bot de WhatsApp',
                'name' => 'WhatsApp Business',
                'ram_mb' => 4096,
                'cpu_pct' => 200,
                'storage_gb' => 30,
                'price' => 6.99,
                'popular' => false,
                'features' => ['4 GB RAM y 2 vCPU dedicadas', 'Ideal para CRM, IA (OpenAI) y flujos masivos', '30 GB SSD para audios, fotos y vídeos', 'Múltiples sesiones simultáneas', 'Soporte prioritario 24/7'],
            ],

            // Telegram Bots (aiogram, Telethon, python-telegram-bot, grammY, Telegraf)
            [
                'category' => 'bots',
                'egg' => 'Bot de Telegram',
                'name' => 'Telegram Starter',
                'ram_mb' => 512,
                'cpu_pct' => 50,
                'storage_gb' => 5,
                'price' => 1.29,
                'popular' => false,
                'features' => ['Telethon, aiogram, Telegraf y grammY', 'Polling continuo 24/7 sin límites', 'Python 3.12 y Node.js 22', 'Reinicio automático en caídas', 'Protección Anti-DDoS'],
            ],
            [
                'category' => 'bots',
                'egg' => 'Bot de Telegram',
                'name' => 'Telegram Pro',
                'ram_mb' => 1024,
                'cpu_pct' => 75,
                'storage_gb' => 10,
                'price' => 2.29,
                'popular' => false,
                'features' => ['Para canales y grupos masivos', 'Bases de datos SQLite integradas', 'Soporte para Webhooks y endpoints HTTPS', 'Logs y consola en tiempo real', 'Soporte 24/7'],
            ],
            [
                'category' => 'bots',
                'egg' => 'Bot de Telegram',
                'name' => 'Telegram Multi-Bot',
                'ram_mb' => 2048,
                'cpu_pct' => 100,
                'storage_gb' => 20,
                'price' => 3.49,
                'popular' => false,
                'features' => ['Ejecuta múltiples bots a la vez', 'Descarga y reenvío de archivos pesados', '20 GB NVMe ultra-rápido', 'Reinicio automático 24/7', 'Soporte 24/7'],
            ],
        ];

        foreach ($botPlans as $i => $plan) {
            $slug = Str::slug($plan['category'] . '-' . $plan['name']);
            $existing = Plan::where('slug', $slug)->first();
            $attrs = [
                ...$plan,
                'cycle_prices' => Plan::defaultCyclePrices($plan['price']),
                'sort' => $i + 10,
            ];

            if ($existing) {
                unset($attrs['price'], $attrs['cycle_prices']);
                $existing->update($attrs);
            } else {
                Plan::create(['slug' => $slug, ...$attrs]);
            }
        }
    }

    public function down(): void
    {
        Plan::where('category', 'bots')
            ->whereIn('name', [
                'WhatsApp Starter', 'WhatsApp Pro', 'WhatsApp Business',
                'Telegram Starter', 'Telegram Pro', 'Telegram Multi-Bot',
            ])
            ->delete();
    }
};
