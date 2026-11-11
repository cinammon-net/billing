<?php

namespace App\Support;

use App\Http\Controllers\StoreController;
use App\Models\Order;
use App\Models\Plan;
use App\Models\Setting;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

/**
 * Reglas del modo gratis: qué servicios se pueden pedir con monedas, cuántos recursos
 * como máximo (siempre por debajo del plan de pago más barato de ese servicio), cuánto
 * cuestan y cuánta capacidad total se reserva para los gratuitos.
 */
class FreeTier
{
    public const DEFAULTS = [
        'enabled' => true,
        // Categorías de la tienda que NO se ofrecen gratis
        'disabled_categories' => [],
        // Un gratuito tiene como mucho este % de cada recurso del plan de pago más barato
        'paid_ratio' => 0.75,
        // Topes absolutos y mínimos por servidor gratuito
        'max_ram_mb' => 2048, 'max_cpu_pct' => 100, 'max_disk_gb' => 10,
        'min_ram_mb' => 256, 'min_cpu_pct' => 25, 'min_disk_gb' => 1,
        // Precio en monedas por día: base + por GB de RAM + por cada 100 % de CPU + por GB de disco
        'coins_base_day' => 10, 'coins_ram_gb_day' => 20, 'coins_cpu_day' => 10, 'coins_disk_gb_day' => 2,
        // Duraciones que se pueden elegir (días)
        'durations' => [3, 7, 14],
        // Servidores gratuitos activos por persona
        'per_user' => 1,
        // Capacidad total reservada a los gratuitos (0 = sin límite); los de pago siempre van primero
        'max_active' => 40,
        'max_total_ram_mb' => 24576,
        // Ganar monedas
        'daily_cap' => 150,            // tope diario de monedas por anuncios
        'ad_reward' => 10,
        'ads_per_day' => 8,
        'checkin' => [5, 6, 7, 8, 10, 12, 25], // racha de 7 días; el 7.º día da el premio gordo
        'coins_per_euro' => 20,        // monedas de regalo por cada € pagado
        'referral_active' => 50,       // al que invita, cuando el invitado empieza a usar la tienda
        'referral_welcome' => 25,      // al invitado, en ese mismo momento
        'referral_purchase' => 200,    // al que invita, cuando el invitado hace su primera compra
        'referral_active_threshold' => 60, // monedas que tiene que ganar el invitado para contar como activo
    ];

    public const MISSIONS = [
        'panel_avatar' => ['label' => 'Pon una foto de perfil en el panel', 'reward' => 15, 'icon' => 'image'],
        'billing_details' => ['label' => 'Completa tus datos de facturación', 'reward' => 20, 'icon' => 'id'],
        'two_factor' => ['label' => 'Activa la verificación en dos pasos', 'reward' => 40, 'icon' => 'shield'],
        'streak_7' => ['label' => 'Consigue una racha de 7 días', 'reward' => 50, 'icon' => 'flame'],
        'invite_first' => ['label' => 'Invita a un amigo que se una', 'reward' => 30, 'icon' => 'users'],
        'first_purchase' => ['label' => 'Haz tu primera compra', 'reward' => 150, 'icon' => 'cart'],
    ];

    public static function settings(): array
    {
        return array_replace(self::DEFAULTS, Setting::get('free_tier'));
    }

    public static function flush(): void
    {
        Cache::forget('free:options');
        Cache::forget('free:stats');
    }

    /**
     * Servicios que se pueden pedir gratis, con el plan de pago más barato de referencia
     * y el máximo de cada recurso.
     */
    public static function options(): Collection
    {
        $s = self::settings();

        return collect(Cache::remember('free:options', 600, function () use ($s) {
            $ratio = min(0.9, max(0.1, (float) $s['paid_ratio']));
            $categories = StoreController::CATEGORIES;

            return Plan::whereNull('role')->whereNull('coin_cost')->where('price', '>', 0)->whereNotNull('egg')
                ->orderBy('price')->get(['id', 'category', 'egg', 'name', 'ram_mb', 'cpu_pct', 'storage_gb', 'price'])
                ->filter(fn (Plan $p) => isset($categories[$p->category]) && !in_array($p->category, $s['disabled_categories'], true))
                ->unique('egg')
                ->map(function (Plan $p) use ($s, $ratio) {
                    $max = [
                        'ram_mb' => (int) min($s['max_ram_mb'], floor($p->ram_mb * $ratio / 128) * 128),
                        'cpu_pct' => (int) min($s['max_cpu_pct'], floor($p->cpu_pct * $ratio / 5) * 5),
                        'disk_gb' => (int) min($s['max_disk_gb'], floor($p->storage_gb * $ratio)),
                    ];
                    if ($max['ram_mb'] < $s['min_ram_mb'] || $max['cpu_pct'] < $s['min_cpu_pct'] || $max['disk_gb'] < $s['min_disk_gb']) {
                        return null;
                    }

                    return [
                        'egg' => $p->egg,
                        'category' => $p->category,
                        'paid' => ['name' => $p->name, 'price' => $p->price, 'ram_mb' => $p->ram_mb, 'cpu_pct' => $p->cpu_pct, 'disk_gb' => $p->storage_gb],
                        'max' => $max,
                    ];
                })
                ->filter()->sortBy(['category', 'egg'])->values()->all();
        }));
    }

    public static function option(string $egg): ?array
    {
        return self::options()->firstWhere('egg', $egg);
    }

    /** Monedas por día de un servidor gratuito con esos recursos. */
    public static function dailyCost(int $ramMb, int $cpuPct, int $diskGb): int
    {
        $s = self::settings();

        return (int) ceil($s['coins_base_day'] + $ramMb / 1024 * $s['coins_ram_gb_day'] + $cpuPct / 100 * $s['coins_cpu_day'] + $diskGb * $s['coins_disk_gb_day']);
    }

    /** Gratuitos activos ahora (y RAM que ocupan). */
    public static function usage(): array
    {
        $active = Order::where('is_free', true)->where('status', 'active');

        return ['servers' => (clone $active)->count(), 'ram_mb' => (int) (clone $active)->sum('ram_mb')];
    }

    /** null si cabe otro gratuito con esa RAM; si no, el motivo. */
    public static function capacityError(int $ramMb): ?string
    {
        $s = self::settings();
        $u = self::usage();
        if (($s['max_active'] > 0 && $u['servers'] >= $s['max_active']) || ($s['max_total_ram_mb'] > 0 && $u['ram_mb'] + $ramMb > $s['max_total_ram_mb'])) {
            return 'Ahora mismo no quedan plazas gratuitas: los clientes de pago tienen prioridad. Vuelve a intentarlo más tarde o elige un plan de pago.';
        }

        return null;
    }

    /** Contador público (se cachea 5 min). */
    public static function publicStats(): array
    {
        return Cache::remember('free:stats', 300, function () {
            return [
                'active' => Order::where('is_free', true)->where('status', 'active')->count(),
                'total' => Order::where('is_free', true)->count(),
                'people' => Order::where('is_free', true)->distinct('user_id')->count('user_id'),
                'services' => self::options()->count(),
            ];
        });
    }
}
