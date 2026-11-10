<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Cache;
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

    /** Cliente HTTP hacia el panel; si hay certificado propio configurado, se verifica contra él. */
    private function http(): \Illuminate\Http\Client\PendingRequest
    {
        $ca = (string) config('billing.panel_ca_bundle');

        return $ca !== '' && is_readable($ca) ? Http::withOptions(['verify' => $ca]) : Http::withOptions([]);
    }

    /**
     * Catálogo público de eggs del panel (nombre, categoría, icono).
     * Se cachea 1 h; si el panel no responde devuelve [] y lo reintenta en 5 min.
     *
     * @return array<int, array{name: string, category: ?string, icon: ?string}>
     */
    public function eggCatalog(): array
    {
        if (is_array($cached = Cache::get('panel:egg-catalog'))) {
            return $cached;
        }

        try {
            $response = $this->http()->timeout(4)->acceptJson()->get($this->baseUrl.'/api/eggs/catalog');
            $data = $response->successful() ? $response->json('data') : null;
        } catch (\Throwable $e) {
            $data = null;
        }

        if (!is_array($data)) {
            Cache::put('panel:egg-catalog', [], now()->addMinutes(5));

            return [];
        }

        Cache::put('panel:egg-catalog', $data, now()->addHour());

        return $data;
    }

    /**
     * Mantenimiento activo o próximo anunciado en el panel (o null). Cacheado 30 s;
     * si el panel no responde se asume que no hay mantenimiento.
     */
    public function maintenance(): ?array
    {
        return Cache::remember('panel:maintenance', 30, function () {
            try {
                $response = $this->http()->timeout(3)->acceptJson()->get($this->baseUrl.'/api/maintenance');

                return $response->successful() && is_array($response->json('data')) ? $response->json('data') : null;
            } catch (\Throwable $e) {
                return null;
            }
        });
    }

    /** ¿La tienda está bloqueada ahora mismo por un mantenimiento? */
    public function storeBlocked(): bool
    {
        $m = $this->maintenance();

        return $m !== null && !empty($m['active']) && !empty($m['block_access']) && in_array('store', $m['scope'] ?? [], true);
    }

    /** Concede en el panel el rol del rango comprado, hasta la fecha de renovación del pedido. */
    public function grantRole(Order $order): bool
    {
        $order->loadMissing(['user', 'plan']);

        try {
            $response = $this->http()->withHeaders(['X-Billing-Token' => $this->token])
                ->acceptJson()
                ->timeout(30)
                ->post("{$this->baseUrl}/api/billing/roles/grant", [
                    'external_id' => "billing-rank-{$order->id}",
                    'email' => $order->user->email,
                    'user_name' => $order->user->name,
                    'role' => $order->plan->role,
                    'perks' => collect($order->plan->perks ?? [])->except('color')->all(),
                    'expires_at' => $order->renews_at?->toIso8601String(),
                ]);

            if (!$response->successful()) {
                Log::warning('Billing grantRole: el panel respondió '.$response->status(), ['order' => $order->id, 'body' => $response->body()]);
            }

            return $response->successful();
        } catch (\Throwable $e) {
            Log::warning('Billing grantRole: '.$e->getMessage(), ['order' => $order->id]);

            return false;
        }
    }

    public function revokeRole(Order $order): bool
    {
        try {
            return $this->http()->withHeaders(['X-Billing-Token' => $this->token])->acceptJson()->timeout(30)
                ->post("{$this->baseUrl}/api/billing/roles/billing-rank-{$order->id}/revoke")
                ->successful();
        } catch (\Throwable $e) {
            Log::warning('Billing revokeRole: '.$e->getMessage(), ['order' => $order->id]);

            return false;
        }
    }

    /**
     * Foto de perfil que tiene en el panel la persona con ese email (o null). Se guarda una hora en caché
     * para no preguntar al panel en cada página.
     */
    public function avatarFor(?string $email): ?string
    {
        $email = strtolower(trim((string) $email));
        if ($email === '' || !$this->token) {
            return null;
        }

        return \Illuminate\Support\Facades\Cache::remember('panel_avatar:'.sha1($email), 3600, function () use ($email) {
            try {
                $response = $this->http()->withHeaders(['X-Billing-Token' => $this->token])->acceptJson()->timeout(4)
                    ->get("{$this->baseUrl}/api/billing/avatar", ['email' => $email]);
                $url = $response->successful() ? $response->json('avatar') : null;

                return is_string($url) && preg_match('#^https://#i', $url) ? $url : null;
            } catch (\Throwable) {
                return null;
            }
        });
    }

    /**
     * Crea el servidor en el panel para un pedido. Devuelve true si se aprovisionó.
     */
    public function provision(Order $order): bool
    {
        $order->loadMissing(['user', 'plan']);

        try {
            $response = $this->http()->withHeaders(['X-Billing-Token' => $this->token])
                ->acceptJson()
                ->timeout(60)
                ->post("{$this->baseUrl}/api/billing/provision", [
                    'external_id' => "billing-{$order->id}",
                    'email' => $order->user->email,
                    'user_name' => $order->user->name,
                    'server_name' => $order->server_name,
                    'category' => $order->plan->category,
                    'egg' => $order->plan->egg,
                    'memory_mb' => $order->plan->ram_mb,
                    'disk_mb' => $order->plan->storage_gb * 1024,
                    'cpu_pct' => $order->plan->cpu_pct,
                    // Los gratuitos (monedas) no tienen dominio propio en el panel.
                    'paid' => (float) $order->price > 0,
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
            $response = $this->http()->withHeaders(['X-Billing-Token' => $this->token])
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
