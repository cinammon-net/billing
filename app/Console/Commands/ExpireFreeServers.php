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
            ->whereHas('plan', fn ($q) => $q->whereNotNull('coin_cost'))
            ->get();

        foreach ($expired as $order) {
            $panel->cancel($order);
            $order->update(['status' => 'suspended']);
            $this->info("Suspendido servidor gratuito #{$order->id} «{$order->server_name}»");
        }

        $this->info("{$expired->count()} servidor(es) gratuito(s) caducado(s).");

        return self::SUCCESS;
    }
}
