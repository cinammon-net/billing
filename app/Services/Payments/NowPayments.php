<?php

namespace App\Services\Payments;

use App\Models\Invoice;
use Illuminate\Support\Facades\Http;

/** Pasarela de criptomonedas NOWPayments (https://nowpayments.io). */
class NowPayments
{
    private function cfg(string $key): mixed
    {
        return PaymentService::settings('crypto')[$key] ?? null;
    }

    private function base(): string
    {
        return $this->cfg('sandbox') ? 'https://api-sandbox.nowpayments.io/v1' : 'https://api.nowpayments.io/v1';
    }

    /** Crea una factura de pago y devuelve [id, url de pago]. */
    public function createInvoice(Invoice $invoice): array
    {
        $response = Http::withHeaders(['x-api-key' => $this->cfg('api_key')])
            ->acceptJson()->timeout(20)
            ->post($this->base() . '/invoice', [
                'price_amount' => round($invoice->amount, 2),
                'price_currency' => strtolower(config('payments.currency')),
                'order_id' => $invoice->number,
                'order_description' => 'Cinammon · factura ' . $invoice->number,
                'ipn_callback_url' => route('webhooks.nowpayments'),
                'success_url' => route('checkout.show', $invoice) . '?status=success',
                'cancel_url' => route('checkout.show', $invoice) . '?status=cancelled',
            ])->throw();

        return [(string) $response->json('id'), (string) $response->json('invoice_url')];
    }

    /**
     * Verifica la firma de la notificación IPN: HMAC-SHA512 del JSON con las
     * claves ordenadas, usando el IPN secret.
     */
    public function verify(string $rawBody, ?string $signature): ?array
    {
        $data = json_decode($rawBody, true);
        if (!is_array($data) || !$signature) {
            return null;
        }
        $sorted = self::ksortRecursive($data);
        $expected = hash_hmac('sha512', json_encode($sorted, JSON_UNESCAPED_SLASHES), (string) $this->cfg('ipn_secret'));

        return hash_equals($expected, strtolower($signature)) ? $data : null;
    }

    private static function ksortRecursive(array $data): array
    {
        ksort($data);
        foreach ($data as $k => $v) {
            if (is_array($v)) {
                $data[$k] = self::ksortRecursive($v);
            }
        }

        return $data;
    }
}
