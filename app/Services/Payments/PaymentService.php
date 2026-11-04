<?php

namespace App\Services\Payments;

use App\Models\Invoice;
use App\Services\PanelService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Punto único para marcar una factura como pagada y activar su pedido
 * (crear el servidor en el panel o conceder el rango), venga del método que venga.
 */
class PaymentService
{
    public function __construct(private readonly PanelService $panel)
    {
    }

    /** Métodos disponibles (configurados) para mostrar al cliente. */
    public static function methods(): array
    {
        $c = config('payments');
        $methods = [];
        if (!empty($c['transfer']['iban'])) {
            $methods[] = ['key' => 'transfer', 'label' => 'Transferencia bancaria', 'auto' => false, 'details' => array_filter([
                'IBAN' => $c['transfer']['iban'], 'Titular' => $c['transfer']['holder'], 'Banco' => $c['transfer']['bank'], 'BIC' => $c['transfer']['bic'],
            ])];
        }
        if (!empty($c['bizum']['phone'])) {
            $methods[] = ['key' => 'bizum', 'label' => 'Bizum', 'auto' => false, 'details' => array_filter([
                'Teléfono' => $c['bizum']['phone'], 'Titular' => $c['bizum']['holder'],
            ])];
        }
        if (!empty($c['nowpayments']['api_key']) && !empty($c['nowpayments']['ipn_secret'])) {
            $methods[] = ['key' => 'crypto', 'label' => 'Criptomonedas', 'auto' => true, 'details' => []];
        }
        if (!empty($c['paypal']['client_id']) && !empty($c['paypal']['secret'])) {
            $methods[] = ['key' => 'paypal', 'label' => 'PayPal', 'auto' => true, 'details' => []];
        }

        return $methods;
    }

    public static function enabled(string $key): bool
    {
        return in_array($key, array_column(self::methods(), 'key'), true);
    }

    /**
     * Marca la factura como pagada y activa el pedido. Idempotente: si ya estaba
     * pagada no hace nada. Devuelve el mensaje para el cliente.
     */
    public function markPaid(Invoice $invoice, string $method, ?string $reference = null): string
    {
        $fresh = DB::transaction(function () use ($invoice, $method, $reference) {
            $locked = Invoice::whereKey($invoice->id)->lockForUpdate()->first();
            if ($locked->status === 'paid') {
                return false;
            }
            $locked->update([
                'status' => 'paid',
                'payment_method' => $method,
                'payment_reference' => $reference ?? $locked->payment_reference,
                'paid_at' => now(),
                'admin_note' => null,
            ]);

            return true;
        });

        $order = $invoice->order()->with('plan')->first();
        if (!$fresh) {
            return 'Esta factura ya estaba pagada.';
        }

        $order->update(['status' => 'active', 'renews_at' => $order->nextRenewal()]);
        Log::info("Pago recibido: factura {$invoice->number} por {$method}", ['reference' => $reference]);

        if ($order->plan->isRank()) {
            return $this->panel->grantRole($order)
                ? "Pago recibido. Ya tienes el rango «{$order->plan->name}» en el panel hasta el {$order->renews_at?->format('d/m/Y H:i')}. ✨"
                : "Pago recibido. El rango «{$order->plan->name}» se activará en el panel en unos minutos.";
        }

        return $this->panel->provision($order)
            ? "Pago recibido. Servidor «{$order->server_name}» creado en el panel. 🚀"
            : "Pago recibido. El servidor «{$order->server_name}» se está preparando en el panel.";
    }
}
