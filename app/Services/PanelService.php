<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Cliente de la API del panel de Cinammon: aprovisiona y cancela
 * los servidores asociados a los pedidos de billing.
 */
class PanelService
{
    private string $baseUrl;
    private string $token;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('billing.panel_url'), '/');
        $this->token = (string) config('billing.panel_token');
    }

    /**
     * Crea el servidor en el panel para un pedido. Devuelve true si se aprovisionó.
     */
    public function provision(Order $order): bool
    {
        $order->loadMissing(['user', 'plan']);

        try {
            $response = Http::withHeaders(['X-Billing-Token' => $this->token])
                ->acceptJson()
                ->timeout(60)
                ->post("{$this->baseUrl}/api/billing/provision", [
                    'external_id' => "billing-{$order->id}",
                    'email' => $order->user->email,
                    'user_name' => $order->user->name,
                    'server_name' => $order->server_name,
                    'category' => $order->plan->category,
                    'memory_mb' => $order->plan->ram_mb,
                    'disk_mb' => $order->plan->storage_gb * 1024,
                    'cpu_pct' => $order->plan->cpu_pct,
                ]);

            if (!$response->successful()) {
                Log::warning("PanelService: aprovisionamiento fallido para pedido {$order->id}: {$response->status()} {$response->body()}");

                return false;
            }

            $data = $response->json();

            $order->update([
                'panel_server_id' => $data['id'] ?? null,
                'panel_server_uuid' => $data['uuid'] ?? null,
                'server_address' => isset($data['allocation']['ip'], $data['allocation']['port'])
                    ? "{$data['allocation']['ip']}:{$data['allocation']['port']}"
                    : null,
            ]);

            return true;
        } catch (\Throwable $e) {
            Log::error("PanelService: error aprovisionando pedido {$order->id}: {$e->getMessage()}");

            return false;
        }
    }

    /**
     * Desactiva el servidor del panel asociado a un pedido cancelado.
     */
    public function cancel(Order $order): bool
    {
        try {
            $response = Http::withHeaders(['X-Billing-Token' => $this->token])
                ->acceptJson()
                ->timeout(15)
                ->post("{$this->baseUrl}/api/billing/servers/billing-{$order->id}/cancel");

            return $response->successful();
        } catch (\Throwable $e) {
            Log::error("PanelService: error cancelando pedido {$order->id}: {$e->getMessage()}");

            return false;
        }
    }
}
