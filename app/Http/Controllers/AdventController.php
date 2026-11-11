<?php

namespace App\Http\Controllers;

use App\Models\AdventClaim;
use App\Models\Setting;
use App\Services\CoinService;
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
    public function __construct(private readonly CoinService $coins)
    {
    }

    public function index(Request $request): Response
    {
        $state = Advent::state();
        $user = $request->user();

        $claimed = $user
            ? AdventClaim::where('user_id', $user->id)
                ->where('edition', $state['edition'])
                ->get(['day', 'coins', 'bonus_coins', 'created_at'])
                ->keyBy('day')
            : collect();

        return Inertia::render('Advent', [
            'advent' => $state,
            'claimedDays' => $claimed->keys()->map(fn ($d) => (int) $d)->values(),
            'claimedDetails' => $claimed,
            'totalEarned' => (int) $claimed->sum(fn ($c) => $c->coins + $c->bonus_coins),
            'themes' => collect(Advent::THEMES)->map(fn ($t, $k) => ['key' => $k, 'title' => $t['title'], 'emoji' => $t['emoji'], 'badge' => $t['badge']])->values(),
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

        $currentDay = $state['current_day'];
        if ($day > $currentDay) {
            return back()->withErrors(['advent' => "La casilla {$day} todavía está bloqueada. ¡Vuelve cuando llegue su día!"]);
        }
        if ($day < $currentDay && !$state['allow_catchup']) {
            return back()->withErrors(['advent' => "La casilla {$day} ya pasó. Abre hoy la casilla {$currentDay}."]);
        }

        $user = $request->user();
        $doorMeta = collect($state['doors'])->firstWhere('day', $day);
        $baseCoins = (int) ($doorMeta['coins'] ?? 20);

        $result = DB::transaction(function () use ($user, $state, $day, $baseCoins) {
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
            $bonusCoins = (int) ($milestone['coins'] ?? 0);

            AdventClaim::create([
                'user_id' => $user->id,
                'edition' => $state['edition'],
                'day' => $day,
                'coins' => $baseCoins,
                'bonus_coins' => $bonusCoins,
            ]);

            return [
                'day' => $day,
                'coins' => $baseCoins,
                'bonus_coins' => $bonusCoins,
                'milestone_label' => $milestone['label'] ?? null,
                'opened_count' => $openedCount,
            ];
        });

        if ($result === null) {
            return back()->withErrors(['advent' => "Ya habías abierto la casilla {$day}."]);
        }

        $total = $result['coins'] + $result['bonus_coins'];
        $detail = "{$state['theme']['title']} · Casilla #{$day}" . ($result['bonus_coins'] > 0 ? " (+{$result['bonus_coins']} bonus meta)" : '');
        $this->coins->apply($user, $total, 'advent', $detail);

        return back()
            ->with('success', "¡Casilla #{$day} abierta! Has ganado +{$total} monedas.")
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
