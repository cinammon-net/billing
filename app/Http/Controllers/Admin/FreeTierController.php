<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\StoreController;
use App\Models\CoinTransaction;
use App\Models\Order;
use App\Models\Setting;
use App\Models\User;
use App\Services\PanelService;
use App\Support\FreeTier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/** Administración de los servidores gratis: límites, precios en monedas, premios y quién los tiene. */
class FreeTierController extends Controller
{
    public function index(): Response
    {
        $free = Order::where('is_free', true);

        return Inertia::render('Admin/Free', [
            'settings' => FreeTier::settings(),
            'categories' => collect(StoreController::CATEGORIES)->except('ranks')->map(fn ($c) => $c['title']),
            'usage' => FreeTier::usage(),
            'stats' => [
                ...FreeTier::publicStats(),
                'suspended' => (clone $free)->where('status', 'suspended')->count(),
                // De quienes tuvieron un gratuito, cuántos han acabado pagando algo
                'converted' => User::whereIn('id', (clone $free)->select('user_id'))
                    ->whereHas('orders', fn ($q) => $q->where('is_free', false)->where('price', '>', 0)->where('status', 'active'))->count(),
                'coins_in_circulation' => (int) User::sum('coins'),
                'coins_earned_week' => (int) CoinTransaction::where('amount', '>', 0)->where('created_at', '>=', now()->subWeek())->sum('amount'),
                'referred_users' => User::whereNotNull('referred_by')->count(),
            ],
            'servers' => Order::where('is_free', true)->whereIn('status', ['active', 'suspended'])
                ->with('user:id,name,email')
                ->orderByRaw("status = 'active' desc")->orderBy('renews_at')
                ->limit(200)
                ->get(['id', 'user_id', 'server_name', 'status', 'egg', 'category', 'ram_mb', 'cpu_pct', 'storage_gb', 'renews_at', 'created_at']),
            'options' => FreeTier::options()->count(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $keys = array_keys(StoreController::CATEGORIES);
        $int = fn ($min, $max) => ['required', 'integer', "min:{$min}", "max:{$max}"];

        $data = $request->validate([
            'enabled' => ['required', 'boolean'],
            'disabled_categories' => ['array'],
            'disabled_categories.*' => [Rule::in($keys)],
            'paid_ratio' => ['required', 'numeric', 'min:0.1', 'max:0.9'],
            'max_ram_mb' => $int(256, 16384), 'max_cpu_pct' => $int(25, 400), 'max_disk_gb' => $int(1, 200),
            'min_ram_mb' => $int(128, 4096), 'min_cpu_pct' => $int(5, 100), 'min_disk_gb' => $int(1, 20),
            'coins_base_day' => $int(0, 10000), 'coins_ram_gb_day' => $int(0, 10000), 'coins_cpu_day' => $int(0, 10000), 'coins_disk_gb_day' => $int(0, 10000),
            'durations' => ['required', 'array', 'min:1', 'max:6'],
            'durations.*' => ['integer', 'min:1', 'max:60'],
            'per_user' => $int(0, 10),
            'max_active' => $int(0, 10000), 'max_total_ram_mb' => $int(0, 1048576),
            'daily_cap' => $int(0, 100000), 'ad_reward' => $int(0, 10000), 'ads_per_day' => $int(0, 100),
            'checkin' => ['required', 'array', 'size:7'],
            'checkin.*' => ['integer', 'min:0', 'max:10000'],
            'coins_per_euro' => $int(0, 10000),
            'referral_active' => $int(0, 100000), 'referral_welcome' => $int(0, 100000), 'referral_purchase' => $int(0, 100000),
            'referral_active_threshold' => $int(0, 100000),
        ]);
        if ($data['min_ram_mb'] > $data['max_ram_mb'] || $data['min_cpu_pct'] > $data['max_cpu_pct'] || $data['min_disk_gb'] > $data['max_disk_gb']) {
            return back()->withErrors(['limits' => 'Los mínimos no pueden ser mayores que los máximos.']);
        }
        $data['durations'] = collect($data['durations'])->map(fn ($d) => (int) $d)->unique()->sort()->values()->all();
        $data['checkin'] = array_map('intval', $data['checkin']);
        $data['paid_ratio'] = round((float) $data['paid_ratio'], 2);

        Setting::put('free_tier', $data);
        FreeTier::flush();

        return back()->with('success', 'Ajustes de servidores gratis guardados.');
    }

    /** Detener a mano un gratuito (por abuso o para liberar sitio a los de pago). */
    public function suspend(Order $order, PanelService $panel): RedirectResponse
    {
        abort_unless($order->is_free && $order->status === 'active', 422);
        $panel->cancel($order);
        $order->update(['status' => 'suspended']);
        FreeTier::flush();

        return back()->with('success', "Servidor gratuito «{$order->server_name}» detenido.");
    }
}
