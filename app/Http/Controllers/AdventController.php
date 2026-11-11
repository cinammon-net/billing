<?php

namespace App\Http\Controllers;

use App\Models\AdventClaim;
use App\Models\Order;
use App\Models\Setting;
use App\Services\CoinService;
use App\Services\PanelService;
use App\Support\Advent;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AdventController extends Controller
{
    public function __construct(
        private readonly CoinService $coins,
        private readonly PanelService $panel,
    ) {
    }

    public function index(Request $request): Response
    {
        $state = Advent::state();
        $user = $request->user();
        $paidPerks = Advent::paidPerks($user);

        $claimed = $user
            ? AdventClaim::where('user_id', $user->id)
                ->where('edition', $state['edition'])
                ->get(['day', 'coins', 'bonus_coins', 'created_at'])
                ->keyBy('day')
            : collect();

        return Inertia::render('Advent', [
            'advent' => $state,
            'paidPerks' => $paidPerks,
            'claimedDays' => $claimed->keys()->map(fn ($d) => (int) $d)->values(),
            'claimedDetails' => $claimed,
            'totalEarned' => (int) $claimed->sum(fn ($c) => $c->coins + $c->bonus_coins),
            'themes' => collect(Advent::THEMES)->map(fn ($t, $k) => ['key' => $k, 'title' => $t['title'], 'badge' => $t['badge']])->values(),
            'rewardModal' => $request->session()->get('advent_reward'),
        ]);
    }

    public function claim(Request $request, int $day): RedirectResponse
    {
        if ($day < 1 || $day > 24) {
            abort(404);
        }

        $state = Advent::state();
        if (!$state['active']) {
            return back()->withErrors(['advent' => 'El calendario no está activo en este momento.']);
        }

        $user = $request->user();
        $paidPerks = Advent::paidPerks($user);
        $isPaid = $paidPerks['is_paid'];

        $currentDay = $state['current_day'];
        if ($day > $currentDay) {
            return back()->withErrors(['advent' => "La casilla {$day} todavía está bloqueada. ¡Vuelve cuando llegue su día!"]);
        }
        if ($day < $currentDay && !$state['allow_catchup'] && !$isPaid) {
            return back()->withErrors(['advent' => "La casilla {$day} ya pasó. Los clientes con plan de pago o rango VIP pueden abrir casillas atrasadas sin perder la racha."]);
        }

        $doorMeta = collect($state['doors'])->firstWhere('day', $day);
        $baseCoins = (int) ($isPaid ? ($doorMeta['vip_coins'] ?? 40) : ($doorMeta['coins'] ?? 20));
        $extraDays = $isPaid ? (int) ($doorMeta['extra_days'] ?? 0) : 0;
        $requestedOrderId = $request->integer('order_id') ?: ($paidPerks['order_id'] ?? null);

        $result = DB::transaction(function () use ($user, $state, $day, $baseCoins, $isPaid, $extraDays, $requestedOrderId) {
            $exists = AdventClaim::where('user_id', $user->id)
                ->where('edition', $state['edition'])
                ->where('day', $day)
                ->lockForUpdate()
                ->exists();

            if ($exists) {
                return null;
            }

            $openedCount = AdventClaim::where('user_id', $user->id)
                ->where('edition', $state['edition'])
                ->count() + 1;

            $milestone = collect($state['milestones'])->firstWhere('count', $openedCount);
            $bonusCoins = (int) ($milestone ? ($isPaid ? $milestone['vip_coins'] : $milestone['coins']) : 0);

            AdventClaim::create([
                'user_id' => $user->id,
                'edition' => $state['edition'],
                'day' => $day,
                'coins' => $baseCoins,
                'bonus_coins' => $bonusCoins,
            ]);

            $extendedOrder = null;
            if ($extraDays > 0 && $requestedOrderId) {
                $order = Order::with('plan')
                    ->where('user_id', $user->id)
                    ->where('status', 'active')
                    ->where('is_free', false)
                    ->whereKey($requestedOrderId)
                    ->lockForUpdate()
                    ->first();
                if ($order) {
                    $baseDate = $order->renews_at && $order->renews_at->isFuture() ? $order->renews_at : now();
                    $order->update(['renews_at' => $baseDate->copy()->addDays($extraDays)]);
                    $extendedOrder = $order;
                }
            }

            return [
                'day' => $day,
                'coins' => $baseCoins,
                'bonus_coins' => $bonusCoins,
                'milestone_label' => $milestone['label'] ?? null,
                'opened_count' => $openedCount,
                'is_paid_bonus' => $isPaid,
                'extra_days' => $extendedOrder ? $extraDays : 0,
                'extended_order_name' => $extendedOrder ? ($extendedOrder->server_name ?: $extendedOrder->plan?->name) : null,
                '_order_for_role' => $extendedOrder,
            ];
        });

        if ($result === null) {
            return back()->withErrors(['advent' => "Ya habías abierto la casilla {$day}."]);
        }

        // Si el servicio extendido es un rango VIP, actualiza también su fecha de expiración en el panel
        if ($result['_order_for_role'] && $result['_order_for_role']->plan?->isRank()) {
            $this->panel->grantRole($result['_order_for_role']);
        }
        unset($result['_order_for_role']);

        $total = $result['coins'] + $result['bonus_coins'];
        $detail = "{$state['theme']['title']} · Casilla #{$day}"
            . ($isPaid ? ' (Bonus 2x VIP)' : '')
            . ($result['bonus_coins'] > 0 ? " (+{$result['bonus_coins']} meta)" : '')
            . ($result['extra_days'] > 0 ? " (+{$result['extra_days']}d en {$result['extended_order_name']})" : '');
        $this->coins->apply($user, $total, 'advent', $detail);

        $msg = "¡Casilla #{$day} abierta! +{$total} monedas"
            . ($result['extra_days'] > 0 ? " y +{$result['extra_days']} día(s) gratis añadidos a «{$result['extended_order_name']}»." : '.');

        return back()
            ->with('success', $msg)
            ->with('advent_reward', $result);
    }

    public function updateSettings(Request $request): RedirectResponse
    {
        $current = Advent::settings();
        $data = $request->validate([
            'mode' => ['required', Rule::in(['auto', 'active', 'off'])],
            'theme' => ['required', Rule::in(array_keys(Advent::THEMES))],
            'multiplier' => ['required', 'integer', 'min:50', 'max:500'],
            'allow_catchup' => ['required', 'boolean'],
            'override_day' => ['nullable', 'integer', 'min:1', 'max:24'],
            'reset_edition' => ['nullable', 'boolean'],
        ]);

        $seq = $current['edition_seq'] + (!empty($data['reset_edition']) ? 1 : 0);

        Setting::put('advent', [
            'mode' => $data['mode'],
            'theme' => $data['theme'],
            'multiplier' => (int) $data['multiplier'],
            'allow_catchup' => (bool) $data['allow_catchup'],
            'override_day' => $data['override_day'] ? (int) $data['override_day'] : null,
            'start_date' => $current['start_date'] ?? CarbonImmutable::now('Europe/Madrid')->toDateString(),
            'edition_seq' => $seq,
        ]);

        return back()->with('success', 'Configuración del calendario actualizada.');
    }
}
