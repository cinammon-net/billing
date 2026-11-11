<?php

namespace App\Http\Controllers;

use App\Models\CoinTransaction;
use App\Models\GameSession;
use App\Models\Invoice;
use App\Models\Order;
use App\Models\User;
use App\Models\UserMission;
use App\Services\CoinService;
use App\Services\PanelService;
use App\Support\FreeTier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Servidores gratis con monedas. Las monedas se ganan con anuncios con recompensa, la racha
 * diaria, misiones, invitaciones y compras; se gastan en un servidor gratuito cuyo servicio y
 * recursos elige el cliente, siempre por debajo del plan de pago más barato.
 */
class CoinsController extends Controller
{
    public function __construct(private readonly CoinService $coins)
    {
    }

    public function index(Request $request, PanelService $panel): Response
    {
        $user = $request->user();
        $s = FreeTier::settings();
        $this->ensureReferralCode($user);
        $done = UserMission::where('user_id', $user->id)->pluck('mission')->all();

        return Inertia::render('Coins', [
            'balance' => $user->coins,
            'earnedToday' => $this->coins->earnedToday($user),
            'dailyCap' => $s['daily_cap'],
            'enabled' => (bool) $s['enabled'],
            'checkin' => [
                'rewards' => $s['checkin'],
                'streak' => $this->currentStreak($user),
                'done_today' => $user->last_checkin?->isToday() ?? false,
            ],
            'ads' => [
                'enabled' => config('coins.ads.enabled') && filled(config('coins.ads.gpt_unit')),
                'unit' => config('coins.ads.gpt_unit'),
                'reward' => $s['ad_reward'],
                'per_day' => $s['ads_per_day'],
                'watched_today' => $this->adsToday($user),
            ],
            'missions' => collect(FreeTier::MISSIONS)->map(fn ($m, $key) => [
                'key' => $key, ...$m, 'done' => in_array($key, $done, true),
            ])->values(),
            'referral' => [
                'url' => route('referral', $user->referral_code),
                'invited' => User::where('referred_by', $user->id)->count(),
                'active' => User::where('referred_by', $user->id)->where('referral_stage', '>', 0)->count(),
                'reward_active' => $s['referral_active'],
                'reward_purchase' => $s['referral_purchase'],
                'reward_welcome' => $s['referral_welcome'],
            ],
            'coinsPerEuro' => $s['coins_per_euro'],
            'builder' => [
                'options' => $this->withIcons(FreeTier::options(), $panel),
                'categories' => collect(StoreController::CATEGORIES)->except('ranks')->map(fn ($c) => $c['title']),
                'durations' => $s['durations'],
                'min' => ['ram_mb' => $s['min_ram_mb'], 'cpu_pct' => $s['min_cpu_pct'], 'disk_gb' => $s['min_disk_gb']],
                'rates' => ['base' => $s['coins_base_day'], 'ram' => $s['coins_ram_gb_day'], 'cpu' => $s['coins_cpu_day'], 'disk' => $s['coins_disk_gb_day']],
                'per_user' => $s['per_user'],
                'full' => FreeTier::capacityError($s['min_ram_mb']) !== null,
            ],
            'stats' => FreeTier::publicStats(),
            'freeServers' => Order::where('user_id', $user->id)->where('is_free', true)
                ->whereIn('status', ['active', 'suspended'])
                ->latest()->get(['id', 'server_name', 'status', 'renews_at', 'server_address', 'category', 'egg', 'ram_mb', 'cpu_pct', 'storage_gb', 'coin_daily']),
            'history' => CoinTransaction::where('user_id', $user->id)->latest()->limit(15)->get(['amount', 'reason', 'detail', 'created_at']),
        ]);
    }

    /** Enlace de invitación: guarda quién invita (30 días) y lleva a la tienda. */
    public function referral(string $code): RedirectResponse
    {
        $exists = User::where('referral_code', strtoupper($code))->exists();

        return redirect()->route('coins.index')
            ->withCookie($exists ? Cookie::make('cin_ref', strtoupper($code), 60 * 24 * 30) : Cookie::forget('cin_ref'));
    }

    /** Racha diaria: una vez al día; si te saltas un día vuelve a empezar. */
    public function checkin(Request $request): RedirectResponse
    {
        [$ok, $message] = $this->claimCheckin($request->user());

        return $ok ? back()->with('success', $message) : back()->withErrors(['checkin' => $message]);
    }

    /** Recoge el premio diario (web y bot de Discord). Devuelve [hecho, mensaje]. */
    public function claimCheckin(User $user): array
    {
        $rewards = FreeTier::settings()['checkin'];

        $claimed = User::whereKey($user->id)
            ->where(fn ($q) => $q->whereNull('last_checkin')->orWhere('last_checkin', '<', now()->toDateString()))
            ->update(['last_checkin' => now()->toDateString()]);
        if ($claimed === 0) {
            return [false, 'Ya has recogido el premio de hoy. ¡Vuelve mañana!'];
        }

        $continues = $user->last_checkin?->isYesterday() ?? false;
        $streak = $continues ? $user->streak_days + 1 : 1;
        $day = ($streak - 1) % count($rewards);
        User::whereKey($user->id)->update(['streak_days' => $streak]);
        $user->forceFill(['streak_days' => $streak, 'last_checkin' => now()]);

        $this->coins->apply($user, (int) $rewards[$day], 'checkin', "Día {$streak} de racha");

        return [true, "Racha de {$streak} día(s): +{$rewards[$day]} monedas."];
    }

    public function mission(Request $request, string $mission, PanelService $panel): RedirectResponse
    {
        abort_unless(isset(FreeTier::MISSIONS[$mission]), 404);
        $user = $request->user();

        $ok = match ($mission) {
            'panel_avatar' => $panel->avatarFor($user->email) !== null,
            'billing_details' => filled($user->address) && filled($user->city) && filled($user->country),
            'two_factor' => $user->two_factor_confirmed_at !== null,
            'streak_7' => $user->streak_days >= 7,
            'invite_first' => User::where('referred_by', $user->id)->where('referral_stage', '>', 0)->exists(),
            'first_purchase' => Invoice::where('user_id', $user->id)->where('status', 'paid')->exists(),
        };
        if (!$ok) {
            return back()->withErrors(['mission' => 'Todavía no has completado esta misión.']);
        }

        $created = UserMission::firstOrCreate(['user_id' => $user->id, 'mission' => $mission]);
        if (!$created->wasRecentlyCreated) {
            return back()->withErrors(['mission' => 'Ya recogiste este premio.']);
        }
        $reward = FreeTier::MISSIONS[$mission]['reward'];
        $this->coins->apply($user, $reward, 'mission', FreeTier::MISSIONS[$mission]['label']);

        return back()->with('success', "Misión completada: +{$reward} monedas.");
    }

    public function startAd(Request $request): JsonResponse
    {
        abort_unless(config('coins.ads.enabled') && filled(config('coins.ads.gpt_unit')), 404);
        $user = $request->user();

        if ($this->adsToday($user) >= FreeTier::settings()['ads_per_day']) {
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
        $s = FreeTier::settings();

        $session = GameSession::where('token', $data['token'])->where('user_id', $user->id)->where('game', 'ad')->whereNull('finished_at')->first();
        if (!$session || $session->started_at->diffInSeconds(now()) < config('coins.ads.min_seconds')) {
            return response()->json(['message' => 'Anuncio no completado.'], 422);
        }

        $coins = max(0, min((int) $s['ad_reward'], $s['daily_cap'] - $this->coins->earnedToday($user)));
        $session->update(['finished_at' => now(), 'coins' => $coins]);
        if ($coins > 0) {
            $this->coins->apply($user, $coins, 'ad', 'Anuncio con recompensa');
        }

        return response()->json([
            'coins' => $coins,
            'balance' => $user->fresh()->coins,
            'earnedToday' => $this->coins->earnedToday($user),
            'message' => $coins > 0 ? "+{$coins} monedas" : 'Hoy ya has llegado al tope de monedas por anuncios.',
        ]);
    }

    public function claim(Request $request, PanelService $panel): RedirectResponse
    {
        $s = FreeTier::settings();
        abort_unless($s['enabled'], 403, 'Los servidores gratis están desactivados ahora mismo.');
        if ($panel->storeBlocked()) {
            return back()->withErrors(['claim' => 'La tienda está en mantenimiento. Inténtalo cuando termine.']);
        }

        $data = $request->validate([
            'egg' => ['required', 'string', 'max:255'],
            'ram_mb' => ['required', 'integer'],
            'cpu_pct' => ['required', 'integer'],
            'disk_gb' => ['required', 'integer'],
            'days' => ['required', 'integer', Rule::in($s['durations'])],
            'server_name' => ['required', 'string', 'min:3', 'max:40'],
        ]);
        $user = $request->user();

        $option = FreeTier::option($data['egg']);
        if (!$option) {
            return back()->withErrors(['claim' => 'Ese servicio no está disponible gratis.']);
        }
        $ram = $this->clampStep($data['ram_mb'], $s['min_ram_mb'], $option['max']['ram_mb'], 128);
        $cpu = $this->clampStep($data['cpu_pct'], $s['min_cpu_pct'], $option['max']['cpu_pct'], 5);
        $disk = $this->clampStep($data['disk_gb'], $s['min_disk_gb'], $option['max']['disk_gb'], 1);

        $active = Order::where('user_id', $user->id)->where('is_free', true)->where('status', 'active')->count();
        if ($active >= $s['per_user']) {
            return back()->withErrors(['claim' => 'Ya tienes el máximo de servidores gratuitos activos. Para tener más, compra un plan en la tienda.']);
        }
        if ($full = FreeTier::capacityError($ram)) {
            return back()->withErrors(['claim' => $full]);
        }

        $daily = FreeTier::dailyCost($ram, $cpu, $disk);
        $total = $daily * $data['days'];
        if (!$this->coins->apply($user, -$total, 'free_server', "{$data['egg']} · {$data['days']} días")) {
            return back()->withErrors(['claim' => "Te faltan monedas: necesitas {$total}."]);
        }

        $order = Order::create([
            'user_id' => $user->id,
            'plan_id' => null,
            'server_name' => $data['server_name'],
            'status' => 'active',
            'is_free' => true,
            'category' => $option['category'],
            'egg' => $option['egg'],
            'ram_mb' => $ram,
            'cpu_pct' => $cpu,
            'storage_gb' => $disk,
            'coin_daily' => $daily,
            'price' => 0,
            'billing_cycle' => 'daily',
            'renews_at' => now()->addDays($data['days']),
        ]);
        FreeTier::flush();

        $ok = $panel->provision($order);

        return redirect()->route('coins.index')->with('success', $ok
            ? "¡Servidor gratuito «{$order->server_name}» creado! Dura {$data['days']} días; renuévalo con monedas o pásate a un plan de pago."
            : "Servidor gratuito «{$order->server_name}» en preparación. Aparecerá en el panel en unos minutos.");
    }

    public function renew(Request $request, Order $order): RedirectResponse
    {
        abort_unless($order->user_id === $request->user()->id && $order->is_free && $order->status === 'active', 403);
        $s = FreeTier::settings();
        $data = $request->validate(['days' => ['required', 'integer', Rule::in($s['durations'])]]);

        if ($order->renews_at && $order->renews_at->gt(now()->addDays(3))) {
            return back()->withErrors(['renew' => 'Solo puedes renovar cuando le queden menos de 3 días.']);
        }
        $daily = $order->coin_daily ?: FreeTier::dailyCost((int) $order->ram_mb, (int) $order->cpu_pct, (int) $order->storage_gb);
        $total = $daily * $data['days'];
        if (!$this->coins->apply($request->user(), -$total, 'free_renew', $order->server_name)) {
            return back()->withErrors(['renew' => "Te faltan monedas: necesitas {$total}."]);
        }

        $base = $order->renews_at && $order->renews_at->isFuture() ? $order->renews_at : now();
        $order->update(['renews_at' => $base->copy()->addDays($data['days'])]);

        return back()->with('success', "Renovado hasta el {$order->renews_at->format('d/m/Y H:i')}.");
    }

    /** Añade el icono de cada egg (del catálogo del panel, el mismo que usa la tienda). */
    private function withIcons(\Illuminate\Support\Collection $options, PanelService $panel): \Illuminate\Support\Collection
    {
        $icons = collect($panel->eggCatalog())->filter(fn ($egg) => !empty($egg['icon']) && !empty($egg['name']))
            ->mapWithKeys(fn ($egg) => [mb_strtolower($egg['name']) => $egg['icon']]);

        return $options->map(fn ($o) => [...$o, 'icon' => $icons->get(mb_strtolower($o['egg']))]);
    }

    private function clampStep(int $value, int $min, int $max, int $step): int
    {
        return (int) max($min, min($max, floor($value / $step) * $step));
    }

    private function adsToday(User $user): int
    {
        return GameSession::where('user_id', $user->id)->where('game', 'ad')->whereNotNull('finished_at')->where('started_at', '>=', now()->startOfDay())->count();
    }

    /** La racha visible: se pierde si ayer no se recogió. */
    public function currentStreak(User $user): int
    {
        if (!$user->last_checkin) {
            return 0;
        }

        return $user->last_checkin->isToday() || $user->last_checkin->isYesterday() ? (int) $user->streak_days : 0;
    }

    public function ensureReferralCode(User $user): void
    {
        if ($user->referral_code) {
            return;
        }
        do {
            $code = strtoupper(Str::random(8));
        } while (User::where('referral_code', $code)->exists());
        $user->forceFill(['referral_code' => $code])->save();
    }
}
