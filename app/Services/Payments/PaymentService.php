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

    /** Campos de cada método: [clave => [etiqueta, secreto?, obligatorio?]] */
    public const FIELDS = [
        'transfer' => ['iban' => ['IBAN', false, true], 'holder' => ['Titular', false, true], 'bank' => ['Banco', false, false], 'bic' => ['BIC / SWIFT', false, false]],
        'bizum' => ['phone' => ['Teléfono', false, true], 'holder' => ['Nombre que verá el cliente', false, false]],
        'crypto' => ['api_key' => ['API key', true, true], 'ipn_secret' => ['IPN secret', true, true], 'sandbox' => ['Modo pruebas (sandbox)', false, false]],
        'paypal' => ['client_id' => ['Client ID', false, true], 'secret' => ['Secret', true, true], 'sandbox' => ['Modo pruebas (sandbox)', false, false]],
    ];

    /** Clave de config/payments.php de cada método (para leer el .env como respaldo). */
    private const ENV_KEYS = ['transfer' => 'transfer', 'bizum' => 'bizum', 'crypto' => 'nowpayments', 'paypal' => 'paypal'];

    /**
     * Ajustes efectivos de un método: lo guardado en Admin → Métodos de pago o,
     * si no se ha guardado nunca, lo del .env. Incluye 'enabled'.
     */
    public static function settings(string $method): array
    {
        static $rows = null;
        $rows ??= \Illuminate\Support\Facades\Schema::hasTable('payment_settings')
            ? \App\Models\PaymentSetting::all()->keyBy('method')
            : collect();

        $env = config('payments.' . self::ENV_KEYS[$method], []);
        if ($row = $rows->get($method)) {
            return ['enabled' => $row->enabled] + ($row->data ?? []) + array_map(fn () => null, $env);
        }
        $required = array_keys(array_filter(self::FIELDS[$method], fn ($f) => $f[2]));

        return ['enabled' => collect($required)->every(fn ($k) => !empty($env[$k]))] + $env;
    }

    /** ¿El método tiene todos sus campos obligatorios? */
    public static function complete(string $method, array $settings): bool
    {
        foreach (self::FIELDS[$method] as $key => [, , $required]) {
            if ($required && blank($settings[$key] ?? null)) {
                return false;
            }
        }

        return true;
    }

    /** Métodos disponibles (activados y completos) para mostrar al cliente. */
    public static function methods(): array
    {
        $c = [];
        foreach (array_keys(self::FIELDS) as $m) {
            $s = self::settings($m);
            $c[$m] = !empty($s['enabled']) && self::complete($m, $s) ? $s : null;
        }
        $methods = [];
        if ($t = $c['transfer']) {
            $methods[] = ['key' => 'transfer', 'label' => 'Transferencia bancaria', 'auto' => false, 'details' => array_filter([
                'IBAN' => $t['iban'] ?? null, 'Titular' => $t['holder'] ?? null, 'Banco' => $t['bank'] ?? null, 'BIC' => $t['bic'] ?? null,
            ])];
        }
        if ($b = $c['bizum']) {
            $methods[] = ['key' => 'bizum', 'label' => 'Bizum', 'auto' => false, 'details' => array_filter([
                'Teléfono' => $b['phone'] ?? null, 'Titular' => $b['holder'] ?? null,
            ])];
        }
        if ($c['crypto']) {
            $methods[] = ['key' => 'crypto', 'label' => 'Criptomonedas', 'auto' => true, 'details' => []];
        }
        if ($c['paypal']) {
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
                ? "Pago recibido. Ya tienes el rango «{$order->plan->name}» en el panel hasta el {$order->renews_at?->format('d/m/Y H:i')}."
                : "Pago recibido. El rango «{$order->plan->name}» se activará en el panel en unos minutos.";
        }

        return $this->panel->provision($order)
            ? "Pago recibido. Servidor «{$order->server_name}» creado en el panel."
            : "Pago recibido. El servidor «{$order->server_name}» se está preparando en el panel.";
    }
}
