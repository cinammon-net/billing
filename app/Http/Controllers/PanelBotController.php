<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Order;
use App\Models\User;
use App\Services\CoinService;
use App\Support\FreeTier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Datos de la tienda para el bot de Discord. Solo lo llama el panel (con el token
 * compartido X-Billing-Token), que antes comprueba qué cuenta tiene vinculado ese Discord.
 */
class PanelBotController extends Controller
{
    public function account(Request $request, CoinsController $coins): JsonResponse
    {
        $user = $this->user($request);
        if (! $user) {
            return response()->json(['error' => 'not_found'], 404);
        }
        $coins->ensureReferralCode($user);

        return response()->json([
            'coins' => (int) $user->coins,
            'streak' => $coins->currentStreak($user),
            'checkin_done' => $user->last_checkin?->isToday() ?? false,
            'referral' => [
                'url' => route('referral', $user->referral_code),
                'invited' => User::where('referred_by', $user->id)->count(),
                'active' => User::where('referred_by', $user->id)->where('referral_stage', '>', 0)->count(),
                'rewards' => [
                    'active' => (int) FreeTier::settings()['referral_active'],
                    'purchase' => (int) FreeTier::settings()['referral_purchase'],
                    'welcome' => (int) FreeTier::settings()['referral_welcome'],
                ],
            ],
            'invoices' => Invoice::where('user_id', $user->id)->latest()->limit(8)->get()->map(fn (Invoice $i) => [
                'id' => $i->id,
                'number' => $i->number,
                'amount' => $i->amount,
                'status' => $i->status,
                'due_at' => $i->due_at?->toIso8601String(),
                'url' => $i->status === 'paid' ? route('dashboard') : route('checkout.show', $i),
            ]),
            'orders' => Order::where('user_id', $user->id)->whereNotIn('status', ['cancelled'])->latest()->limit(15)->get()->map(fn (Order $o) => [
                'id' => $o->id,
                'name' => $o->server_name,
                'status' => $o->status,
                'price' => $o->price,
                'cycle' => $o->billing_cycle,
                'renews_at' => $o->renews_at?->toIso8601String(),
                'free' => (bool) $o->is_free,
                'panel_server_id' => $o->panel_server_id,
            ]),
            'urls' => ['coins' => route('coins.index'), 'store' => url('/store'), 'invoices' => route('dashboard')],
        ]);
    }

    /** Set de regalo de cumpleaños (una vez por año; si se repite, devuelve el mismo). */
    public function birthday(Request $request): JsonResponse
    {
        $user = $this->user($request);
        if (! $user) {
            return response()->json(['error' => 'not_found'], 404);
        }
        $data = $request->validate(['year' => 'required|integer|min:2024|max:2100', 'vip' => 'boolean']);

        return response()->json(['gifts' => \App\Support\BirthdayGift::grant($user, (int) $data['year'], (bool) ($data['vip'] ?? false))]);
    }

    /**
     * Invitación de Discord → referido de la tienda. El bot sabe quién trajo a alguien al Discord;
     * cuando esa persona vincula su cuenta, se apunta como referido de quien la invitó, con las
     * mismas reglas y premios que el enlace /r/CODIGO.
     *
     * Solo cuenta si la cuenta de la tienda se creó después de entrar al Discord (si ya era
     * cliente, no la trajo esa invitación) y si aún no tenía a nadie como referidor.
     */
    public function referral(Request $request, CoinService $coins): JsonResponse
    {
        $user = $this->user($request);
        if (! $user) {
            return response()->json(['error' => 'not_found'], 404);
        }
        $data = $request->validate(['inviter_email' => 'required|email', 'joined_at' => 'required|date']);
        $inviter = User::whereRaw('LOWER(email) = ?', [strtolower(trim($data['inviter_email']))])->first();
        if (! $inviter) {
            return response()->json(['error' => 'inviter_not_found'], 404);
        }
        if ($inviter->id === $user->id) {
            return response()->json(['status' => 'self']);
        }
        if ($user->referred_by) {
            return response()->json(['status' => $user->referred_by === $inviter->id ? 'already' : 'other']);
        }
        if ($user->created_at && $user->created_at->lt(\Illuminate\Support\Carbon::parse($data['joined_at'])->subDay())) {
            return response()->json(['status' => 'existing_customer']);
        }
        if (User::whereKey($user->id)->whereNull('referred_by')->update(['referred_by' => $inviter->id]) === 0) {
            return response()->json(['status' => 'other']);
        }
        $user->referred_by = $inviter->id;
        // Si ya había ganado monedas suficientes, se activa ya (premios de invitación)
        $coins->maybeActivateReferral($user);

        return response()->json(['status' => 'linked', 'inviter' => $inviter->name]);
    }

    public function checkin(Request $request, CoinsController $coins): JsonResponse
    {
        $user = $this->user($request);
        if (! $user) {
            return response()->json(['error' => 'not_found'], 404);
        }
        [$ok, $message] = $coins->claimCheckin($user);

        return response()->json(['ok' => $ok, 'message' => $message, 'coins' => (int) $user->fresh()->coins]);
    }

    /**
     * Actividad de la tienda de los últimos 7 días para el canal #compras de Discord:
     * servidores gratuitos (al crearse el pedido) y pagos confirmados (compras y renovaciones).
     * El correo solo lo usa el panel para saber el Discord vinculado; no se publica.
     */
    public function feed(Request $request): JsonResponse
    {
        $token = (string) config('billing.panel_token');
        abort_if($token === '' || ! hash_equals($token, (string) $request->header('X-Billing-Token')), 401);
        $since = now()->subDays(7);
        $plan = fn (?Order $o) => [
            'plan' => $o?->plan?->name,
            'category' => $o?->category ?? $o?->plan?->category,
            'ram_mb' => $o ? (int) ($o->ram_mb ?? $o->plan?->ram_mb) : null,
            'cycle' => $o?->billing_cycle,
        ];

        $free = Order::with('plan:id,name,category,ram_mb', 'user:id,name,email')
            ->where('is_free', true)->where('created_at', '>=', $since)
            ->latest()->limit(30)->get()
            ->map(fn (Order $o) => [
                'key' => 'free:'.$o->id,
                'type' => 'free',
                'at' => $o->created_at?->toIso8601String(),
                'user' => $o->user?->name,
                'email' => $o->user?->email,
                ...$plan($o),
            ]);

        $paid = Invoice::with('order.plan:id,name,category,ram_mb', 'user:id,name,email')
            ->where('status', 'paid')->whereNotNull('paid_at')->where('paid_at', '>=', $since)
            ->latest('paid_at')->limit(30)->get()
            ->map(function (Invoice $i) use ($plan) {
                $first = ! $i->order_id || ! Invoice::where('order_id', $i->order_id)->where('status', 'paid')
                    ->where('id', '<', $i->id)->exists();

                return [
                    'key' => 'paid:'.$i->id,
                    'type' => $first ? 'purchase' : 'renewal',
                    'at' => $i->paid_at?->toIso8601String(),
                    'user' => $i->user?->name,
                    'email' => $i->user?->email,
                    'amount' => $i->amount,
                    ...$plan($i->order),
                ];
            });

        return response()->json(['events' => $free->concat($paid)->sortBy('at')->values()]);
    }

    /** Precio de un plan para el bot: todos los períodos con el descuento que le toca a esa persona. */
    public function quote(Request $request, \App\Services\SeasonService $seasons): JsonResponse
    {
        $user = $this->user($request);
        if (! $user) {
            return response()->json(['error' => 'no_store_account'], 404);
        }
        $plan = \App\Models\Plan::whereNull('coin_cost')->find((int) $request->input('plan_id'));
        if (! $plan) {
            return response()->json(['error' => 'plan_not_found'], 404);
        }
        $season = $seasons->context(\App\Support\Seasons::countryFrom(null));
        $cycles = [];
        $months = ['daily' => 1 / 30, 'weekly' => 0.25, 'monthly' => 1, 'quarterly' => 3, 'semiannual' => 6, 'yearly' => 12];
        foreach (\App\Models\Plan::CYCLES as $key => $meta) {
            $q = \App\Support\StoreOrder::quote($user, $plan, $key, $season);
            if ($q !== null && $key !== 'hourly') {
                $cycles[] = ['key' => $key, 'label' => $meta['label'], 'months' => $months[$key] ?? 1] + $q;
            }
        }

        return response()->json([
            'plan' => [
                'id' => $plan->id, 'name' => $plan->name, 'category' => $plan->category, 'rank' => $plan->isRank(),
                'ram_mb' => $plan->ram_mb, 'cpu_pct' => $plan->cpu_pct, 'storage_gb' => $plan->storage_gb, 'monthly' => (float) $plan->price,
            ],
            'cycles' => $cycles,
            'store_blocked' => app(\App\Services\PanelService::class)->storeBlocked(),
        ]);
    }

    /** Crea el pedido desde Discord y devuelve el enlace de pago (el mismo checkout de la web). */
    public function order(Request $request, \App\Services\SeasonService $seasons): JsonResponse
    {
        $user = $this->user($request);
        if (! $user) {
            return response()->json(['error' => 'no_store_account'], 404);
        }
        if (app(\App\Services\PanelService::class)->storeBlocked()) {
            return response()->json(['error' => 'store_blocked', 'message' => 'La tienda está en mantenimiento ahora mismo. Prueba cuando termine.'], 423);
        }
        $data = $request->validate([
            'plan_id' => ['required', 'integer'],
            'cycle' => ['required', \Illuminate\Validation\Rule::in(array_keys(\App\Models\Plan::CYCLES))],
            'name' => ['nullable', 'string', 'max:60'],
        ]);
        $plan = \App\Models\Plan::whereNull('coin_cost')->find($data['plan_id']);
        if (! $plan) {
            return response()->json(['error' => 'plan_not_found'], 404);
        }
        $name = $plan->isRank() ? 'Rango '.$plan->name : trim((string) ($data['name'] ?? ''));
        if ($name === '') {
            return response()->json(['error' => 'name_required', 'message' => 'Pon un nombre para tu servidor.'], 422);
        }
        $quote = \App\Support\StoreOrder::quote($user, $plan, $data['cycle'], $seasons->context(\App\Support\Seasons::countryFrom(null)));
        if ($quote === null) {
            return response()->json(['error' => 'cycle_unavailable', 'message' => 'Este plan no está disponible con ese período.'], 422);
        }
        $invoice = \App\Support\StoreOrder::place($user, $plan, $data['cycle'], $name, $quote);

        return response()->json([
            'number' => $invoice->number,
            'amount' => (float) $invoice->amount,
            'name' => $name,
            'checkout_url' => route('checkout.show', $invoice),
        ]);
    }

    private function user(Request $request): ?User
    {
        $token = (string) config('billing.panel_token');
        abort_if($token === '' || ! hash_equals($token, (string) $request->header('X-Billing-Token')), 401);
        $email = strtolower(trim((string) $request->input('email')));

        return $email === '' ? null : User::whereRaw('LOWER(email) = ?', [$email])->first();
    }
}
