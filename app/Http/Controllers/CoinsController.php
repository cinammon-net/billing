<?php

namespace App\Http\Controllers;

use App\Models\CoinTransaction;
use App\Models\GameSession;
use App\Models\Order;
use App\Models\Plan;
use App\Services\CoinService;
use App\Services\PanelService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Monedas: se ganan con minijuegos (y anuncios con recompensa cuando se activen)
 * y se gastan en servidores gratuitos limitados. Ampliar = comprar un plan de pago.
 */
class CoinsController extends Controller
{
    public function __construct(private readonly CoinService $coins)
    {
    }

    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Coins', [
            'balance' => $user->coins,
            'earnedToday' => $this->coins->earnedToday($user),
            'dailyCap' => config('coins.daily_cap'),
            'games' => collect(config('coins.games'))->map(fn ($g, $key) => ['key' => $key, 'label' => $g['label'], 'max_coins' => $g['max_coins']])->values(),
            'ads' => [
                'enabled' => config('coins.ads.enabled') && filled(config('coins.ads.gpt_unit')),
                'unit' => config('coins.ads.gpt_unit'),
                'reward' => config('coins.ads.reward'),
                'per_day' => config('coins.ads.per_day'),
                'watched_today' => GameSession::where('user_id', $user->id)->where('game', 'ad')->whereNotNull('finished_at')->where('started_at', '>=', now()->startOfDay())->count(),
            ],
            'freePlans' => Plan::whereNotNull('coin_cost')->orderBy('sort')->get(['id', 'name', 'category', 'egg', 'ram_mb', 'cpu_pct', 'storage_gb', 'coin_cost', 'coin_renew_cost', 'coin_days', 'features']),
            'freeServers' => Order::where('user_id', $user->id)
                ->whereHas('plan', fn ($q) => $q->whereNotNull('coin_cost'))
                ->whereIn('status', ['active', 'suspended'])
                ->with('plan:id,name,category,coin_renew_cost,coin_days')
                ->latest()->get(['id', 'plan_id', 'server_name', 'status', 'renews_at', 'server_address']),
            'history' => CoinTransaction::where('user_id', $user->id)->latest()->limit(15)->get(['amount', 'reason', 'detail', 'created_at']),
        ]);
    }

    public function startGame(Request $request): JsonResponse
    {
        $data = $request->validate(['game' => ['required', Rule::in(array_keys(config('coins.games')))]]);
        $user = $request->user();

        $recent = GameSession::where('user_id', $user->id)->where('game', '!=', 'ad')->where('started_at', '>=', now()->subHour())->count();
        if ($recent >= config('coins.games_per_hour')) {
            return response()->json(['message' => 'Has jugado mucho esta hora. Descansa un poco y vuelve más tarde.'], 429);
        }

        $session = GameSession::create([
            'user_id' => $user->id,
            'game' => $data['game'],
            'token' => Str::random(48),
            'started_at' => now(),
        ]);

        return response()->json(['token' => $session->token]);
    }

    public function finishGame(Request $request): JsonResponse
    {
        $data = $request->validate([
            'token' => ['required', 'string', 'size:48'],
            'score' => ['required', 'integer', 'min:0', 'max:10000'],
        ]);
        $user = $request->user();

        $session = GameSession::where('token', $data['token'])->where('user_id', $user->id)->whereNull('finished_at')->first();
        if (!$session || $session->game === 'ad') {
            return response()->json(['message' => 'Partida no válida.'], 422);
        }

        $rules = config("coins.games.{$session->game}");
        $elapsed = $session->started_at->diffInSeconds(now());
        $score = min((int) $data['score'], $rules['max_score']);

        $coins = 0;
        if ($elapsed >= $rules['min_seconds'] && $elapsed <= $rules['max_seconds'] && (int) $data['score'] <= $rules['max_score']) {
            $coins = match ($session->game) {
                'reflex' => min($rules['max_coins'], intdiv($score, 5)),
                'memory' => $score >= $rules['max_score'] ? $rules['max_coins'] : intdiv($score, 2),
                default => 0,
            };
        }
        $coins = max(0, min($coins, config('coins.daily_cap') - $this->coins->earnedToday($user)));

        $session->update(['finished_at' => now(), 'score' => $score, 'coins' => $coins]);
        if ($coins > 0) {
            $this->coins->apply($user, $coins, 'game', $rules['label']);
        }

        return response()->json([
            'coins' => $coins,
            'balance' => $user->fresh()->coins,
            'earnedToday' => $this->coins->earnedToday($user),
            'message' => match (true) {
                $coins > 0 => "+{$coins} monedas",
                $elapsed < $rules['min_seconds'] => 'Partida demasiado corta: no da monedas.',
                (int) $data['score'] > $rules['max_score'] || $elapsed > $rules['max_seconds'] => 'Partida no válida: no da monedas.',
                $this->coins->earnedToday($user) >= config('coins.daily_cap') => 'Hoy ya has llegado al tope de monedas. ¡Vuelve mañana!',
                default => 'Sin puntos suficientes para ganar monedas. ¡Prueba otra vez!',
            },
        ]);
    }

    public function startAd(Request $request): JsonResponse
    {
        abort_unless(config('coins.ads.enabled') && filled(config('coins.ads.gpt_unit')), 404);
        $user = $request->user();

        $today = GameSession::where('user_id', $user->id)->where('game', 'ad')->whereNotNull('finished_at')->where('started_at', '>=', now()->startOfDay())->count();
        if ($today >= config('coins.ads.per_day')) {
            return response()->json(['message' => 'Hoy ya has visto todos los anuncios con recompensa.'], 429);
        }

        $session = GameSession::create(['user_id' => $user->id, 'game' => 'ad', 'token' => Str::random(48), 'started_at' => now()]);

        return response()->json(['token' => $session->token]);
    }

    public function completeAd(Request $request): JsonResponse
    {
        abort_unless(config('coins.ads.enabled'), 404);
        $data = $request->validate(['token' => ['required', 'string', 'size:48']]);
        $user = $request->user();

        $session = GameSession::where('token', $data['token'])->where('user_id', $user->id)->where('game', 'ad')->whereNull('finished_at')->first();
        if (!$session || $session->started_at->diffInSeconds(now()) < config('coins.ads.min_seconds')) {
            return response()->json(['message' => 'Anuncio no completado.'], 422);
        }

        $coins = max(0, min(config('coins.ads.reward'), config('coins.daily_cap') - $this->coins->earnedToday($user)));
        $session->update(['finished_at' => now(), 'coins' => $coins]);
        if ($coins > 0) {
            $this->coins->apply($user, $coins, 'ad', 'Anuncio con recompensa');
        }

        return response()->json(['coins' => $coins, 'balance' => $user->fresh()->coins]);
    }

    public function claim(Request $request, PanelService $panel): RedirectResponse
    {
        if ($panel->storeBlocked()) {
            return back()->withErrors(['plan_id' => 'La tienda está en mantenimiento. Inténtalo cuando termine.']);
        }

        $data = $request->validate([
            'plan_id' => ['required', Rule::exists('plans', 'id')->whereNotNull('coin_cost')],
            'server_name' => ['required', 'string', 'min:3', 'max:40'],
        ]);
        $user = $request->user();
        $plan = Plan::findOrFail($data['plan_id']);

        $activeFree = Order::where('user_id', $user->id)->where('status', 'active')
            ->whereHas('plan', fn ($q) => $q->whereNotNull('coin_cost'))->count();
        if ($activeFree >= config('coins.free_servers_per_user')) {
            return back()->withErrors(['plan_id' => 'Ya tienes un servidor gratuito activo. Para tener más, compra un plan en la tienda.']);
        }

        if (!$this->coins->apply($user, -$plan->coin_cost, 'free_server', $plan->name)) {
            return back()->withErrors(['plan_id' => "Te faltan monedas: necesitas {$plan->coin_cost}."]);
        }

        $order = Order::create([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'server_name' => $data['server_name'],
            'status' => 'active',
            'price' => 0,
            'billing_cycle' => 'weekly',
            'renews_at' => now()->addDays($plan->coin_days),
        ]);

        $ok = $panel->provision($order);

        return redirect()->route('coins.index')->with('success', $ok
            ? "¡Servidor gratuito «{$order->server_name}» creado! Dura {$plan->coin_days} días; renuévalo con monedas o pásate a un plan de pago."
            : "Servidor gratuito «{$order->server_name}» en preparación. Aparecerá en el panel en unos minutos.");
    }

    public function renew(Request $request, Order $order): RedirectResponse
    {
        abort_unless($order->user_id === $request->user()->id, 403);
        $plan = $order->plan;
        abort_unless($plan && $plan->coin_cost !== null && $order->status === 'active', 422);

        if ($order->renews_at && $order->renews_at->gt(now()->addDays(7))) {
            return back()->withErrors(['renew' => 'Solo puedes renovar cuando le queden menos de 7 días.']);
        }
        if (!$this->coins->apply($request->user(), -$plan->coin_renew_cost, 'free_renew', $order->server_name)) {
            return back()->withErrors(['renew' => "Te faltan monedas: necesitas {$plan->coin_renew_cost}."]);
        }

        $base = $order->renews_at && $order->renews_at->isFuture() ? $order->renews_at : now();
        $order->update(['renews_at' => $base->copy()->addDays($plan->coin_days)]);

        return back()->with('success', "Renovado hasta el {$order->renews_at->format('d/m/Y H:i')}.");
    }
}
