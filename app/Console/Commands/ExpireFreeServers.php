<?php

namespace App\Console\Commands;

use App\Models\Order;
use App\Services\PanelService;
use Illuminate\Console\Command;

class ExpireFreeServers extends Command
{
    protected $signature = 'coins:expire-free';

    protected $description = 'Suspende los servidores gratuitos (de monedas) que no se han renovado a tiempo';

    public function handle(PanelService $panel): int
    {
        $expired = Order::where('status', 'active')
            ->whereNotNull('renews_at')->where('renews_at', '<', now())
            ->where('is_free', true)
            ->get();

        foreach ($expired as $order) {
            $panel->cancel($order);
            $order->update(['status' => 'suspended']);
            \App\Support\FreeTier::flush();
            \App\Mail\BillingMail::deliver($order->user?->email, "Servidor gratuito suspendido · {$order->server_name}", 'free-suspended',
                ['user' => $order->user, 'order' => $order], "free-suspended-{$order->id}-{$order->renews_at?->timestamp}");
            $this->info("Suspendido servidor gratuito #{$order->id} «{$order->server_name}»");
        }

        $this->info("{$expired->count()} servidor(es) gratuito(s) caducado(s).");

        // Aviso un día antes de caducar (una sola vez por cada fecha de renovación).
        $soon = Order::with('user')->where('status', 'active')->where('is_free', true)
            ->whereNotNull('renews_at')->whereBetween('renews_at', [now(), now()->addDay()])
            ->get();
        foreach ($soon as $order) {
            $key = "free-expiring-{$order->id}-{$order->renews_at->timestamp}";
            if (\Illuminate\Support\Facades\Cache::add("mail:{$key}", true, now()->addDays(3))) {
                \App\Mail\BillingMail::deliver($order->user?->email, "Tu servidor gratuito caduca pronto · {$order->server_name}", 'free-expiring',
                    ['user' => $order->user, 'order' => $order], $key);
            }
        }

        return self::SUCCESS;
    }
}
