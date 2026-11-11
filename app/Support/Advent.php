<?php

namespace App\Support;

use App\Models\Setting;
use Carbon\CarbonImmutable;

/**
 * Calendario de Adviento (Navidad, 1–24 dic) y calendarios de regalos para otros eventos
 * (Halloween, Verano, Aniversario). Cada día desbloquea una casilla con monedas y cofres especiales.
 */
class Advent
{
    public const THEMES = [
        'christmas' => [
            'title' => 'Calendario de Adviento',
            'subtitle' => 'Abre una casilla cada día del 1 al 24 de diciembre y consigue monedas, cofres especiales y el Gran Regalo de Nochebuena.',
            'badge' => '🎄 NAVIDAD EN CINAMMON',
            'emoji' => '🎄',
            'box_emoji' => '🎁',
            'special_emoji' => '🌟',
            'grand_emoji' => '🎅',
            'accent' => 'emerald',
        ],
        'halloween' => [
            'title' => 'Calendario de Halloween',
            'subtitle' => 'Abre una puerta misteriosa cada día y llévate monedas encantadas y cofres especiales sin truco.',
            'badge' => '🎃 ESPECIAL HALLOWEEN',
            'emoji' => '🎃',
            'box_emoji' => '🍬',
            'special_emoji' => '👻',
            'grand_emoji' => '🔮',
            'accent' => 'orange',
        ],
        'summer' => [
            'title' => 'Calendario de Verano',
            'subtitle' => 'Recompensas refrescantes cada día para desplegar tus servidores durante las vacaciones.',
            'badge' => '☀️ FESTIVAL DE VERANO',
            'emoji' => '☀️',
            'box_emoji' => '🏖️',
            'special_emoji' => '🌴',
            'grand_emoji' => '🏆',
            'accent' => 'cyan',
        ],
        'special' => [
            'title' => 'Calendario de Regalos',
            'subtitle' => 'Abre tu regalo diario en Cinammon y acumula monedas para tus servidores gratuitos.',
            'badge' => '🎁 EVENTO ESPECIAL',
            'emoji' => '🎁',
            'box_emoji' => '🎀',
            'special_emoji' => '💎',
            'grand_emoji' => '👑',
            'accent' => 'pink',
        ],
    ];

    /** Recompensa base de cada una de las 24 casillas. */
    public const BASE_DOORS = [
        1  => ['coins' => 20,  'tier' => 'normal',  'label' => 'Día 1 · Bienvenida'],
        2  => ['coins' => 20,  'tier' => 'normal',  'label' => 'Sorpresa diaria'],
        3  => ['coins' => 25,  'tier' => 'normal',  'label' => 'Sorpresa diaria'],
        4  => ['coins' => 25,  'tier' => 'normal',  'label' => 'Sorpresa diaria'],
        5  => ['coins' => 30,  'tier' => 'normal',  'label' => 'Sorpresa diaria'],
        6  => ['coins' => 75,  'tier' => 'special', 'label' => 'Cofre Especial #1'],
        7  => ['coins' => 30,  'tier' => 'normal',  'label' => 'Sorpresa diaria'],
        8  => ['coins' => 30,  'tier' => 'normal',  'label' => 'Sorpresa diaria'],
        9  => ['coins' => 35,  'tier' => 'normal',  'label' => 'Sorpresa diaria'],
        10 => ['coins' => 35,  'tier' => 'normal',  'label' => 'Sorpresa diaria'],
        11 => ['coins' => 40,  'tier' => 'normal',  'label' => 'Sorpresa diaria'],
        12 => ['coins' => 100, 'tier' => 'special', 'label' => 'Cofre Especial #2'],
        13 => ['coins' => 40,  'tier' => 'normal',  'label' => 'Sorpresa diaria'],
        14 => ['coins' => 40,  'tier' => 'normal',  'label' => 'Sorpresa diaria'],
        15 => ['coins' => 45,  'tier' => 'normal',  'label' => 'Sorpresa diaria'],
        16 => ['coins' => 45,  'tier' => 'normal',  'label' => 'Sorpresa diaria'],
        17 => ['coins' => 50,  'tier' => 'normal',  'label' => 'Sorpresa diaria'],
        18 => ['coins' => 125, 'tier' => 'special', 'label' => 'Cofre Especial #3'],
        19 => ['coins' => 50,  'tier' => 'normal',  'label' => 'Sorpresa diaria'],
        20 => ['coins' => 55,  'tier' => 'normal',  'label' => 'Sorpresa diaria'],
        21 => ['coins' => 55,  'tier' => 'normal',  'label' => 'Sorpresa diaria'],
        22 => ['coins' => 60,  'tier' => 'normal',  'label' => 'Sorpresa diaria'],
        23 => ['coins' => 70,  'tier' => 'normal',  'label' => 'Víspera del Gran Cofre'],
        24 => ['coins' => 250, 'tier' => 'grand',   'label' => '¡Gran Cofre Final!'],
    ];

    /** Bonus extra al alcanzar X casillas abiertas en la misma edición. */
    public const MILESTONES = [
        7  => ['coins' => 50,  'label' => '7 casillas abiertas'],
        14 => ['coins' => 100, 'label' => '14 casillas abiertas'],
        24 => ['coins' => 300, 'label' => '¡Calendario completo (24/24)!'],
    ];

    public static function settings(): array
    {
        $saved = Setting::get('advent', []);

        return [
            // Por defecto 'auto': se activa solo el 1 de diciembre a las 00:00 y se desactiva el 25 de diciembre a las 23:59
            'mode' => $saved['mode'] ?? 'auto',
            'theme' => isset(self::THEMES[$saved['theme'] ?? '']) ? $saved['theme'] : 'christmas',
            // Multiplicador porcentual de premios (100 = normal, 200 = doble monedas)
            'multiplier' => max(50, min(500, (int) ($saved['multiplier'] ?? 100))),
            // Fecha de inicio cuando mode === 'active' (día 1 del calendario)
            'start_date' => $saved['start_date'] ?? CarbonImmutable::now('Europe/Madrid')->toDateString(),
            // Si el admin fija un día concreto (1..24), se desbloquea hasta ese día
            'override_day' => isset($saved['override_day']) && $saved['override_day'] !== null ? (int) $saved['override_day'] : null,
            // Si true, permite abrir también casillas de días anteriores que se te hayan pasado
            'allow_catchup' => (bool) ($saved['allow_catchup'] ?? false),
            'edition_seq' => (int) ($saved['edition_seq'] ?? 1),
        ];
    }

    /** Estado actual del calendario para mostrar en la tienda y validar aperturas. */
    public static function state(?CarbonImmutable $now = null): array
    {
        $now ??= CarbonImmutable::now(config('billing.season_timezone', 'Europe/Madrid'));
        $s = self::settings();
        $themeKey = $s['theme'];
        $theme = self::THEMES[$themeKey] ?? self::THEMES['christmas'];

        // El Adviento real va del 1 de diciembre al 24 de diciembre (con margen hasta el 25 dic 23:59 para recoger el día 24)
        $isDecemberWindow = $now->month === 12 && $now->day >= 1 && $now->day <= 25;
        $active = match ($s['mode']) {
            'active' => true,
            'auto' => $isDecemberWindow,
            default => false,
        };

        // ¿Qué día (1..24) toca hoy?
        if ($s['override_day'] !== null && $s['override_day'] >= 1 && $s['override_day'] <= 24) {
            $currentDay = $s['override_day'];
        } elseif ($s['mode'] === 'auto' || ($isDecemberWindow && $themeKey === 'christmas')) {
            $currentDay = min(24, max(1, $now->day));
        } else {
            $start = CarbonImmutable::parse($s['start_date'], $now->timezone)->startOfDay();
            $diff = $start->diffInDays($now->startOfDay(), false) + 1;
            $currentDay = min(24, max(1, (int) $diff));
        }

        $mult = $s['multiplier'] / 100;
        $doors = [];
        foreach (self::BASE_DOORS as $day => $meta) {
            $doors[$day] = [
                'day' => $day,
                'coins' => (int) round($meta['coins'] * $mult),
                'tier' => $meta['tier'],
                'label' => $meta['label'],
            ];
        }

        $milestones = [];
        foreach (self::MILESTONES as $count => $m) {
            $milestones[$count] = [
                'count' => $count,
                'coins' => (int) round($m['coins'] * $mult),
                'label' => $m['label'],
            ];
        }

        return [
            'active' => $active,
            'mode' => $s['mode'],
            'theme_key' => $themeKey,
            'theme' => $theme,
            'edition' => "{$now->year}-{$themeKey}-{$s['edition_seq']}",
            'current_day' => $currentDay,
            'allow_catchup' => $s['allow_catchup'],
            'multiplier' => $s['multiplier'],
            'start_date' => $s['start_date'],
            'override_day' => $s['override_day'],
            'doors' => array_values($doors),
            'milestones' => array_values($milestones),
        ];
    }

    /** Resumen ligero para la barra de navegación y el panel. */
    public static function summary(): ?array
    {
        $st = self::state();
        if (!$st['active']) {
            return null;
        }

        return [
            'title' => $st['theme']['title'],
            'emoji' => $st['theme']['emoji'],
            'badge' => $st['theme']['badge'],
            'current_day' => $st['current_day'],
        ];
    }
}
