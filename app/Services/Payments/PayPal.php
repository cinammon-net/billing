<?php

namespace App\Services\Payments;

use App\Models\Invoice;
use Illuminate\Support\Facades\Http;

/** PayPal Checkout (Orders API v2): crear pedido, redirigir y capturar al volver. */
class PayPal
{
    private function base(): string
    {
        return config('payments.paypal.sandbox') ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com';
    }

    private function token(): string
    {
        return (string) Http::asForm()->timeout(20)
            ->withBasicAuth(config('payments.paypal.client_id'), config('payments.paypal.secret'))
            ->post($this->base() . '/v1/oauth2/token', ['grant_type' => 'client_credentials'])
            ->throw()->json('access_token');
    }

    /** Devuelve [order id, url de aprobación]. */
    public function createOrder(Invoice $invoice): array
    {
        $response = Http::withToken($this->token())->acceptJson()->timeout(20)
            ->post($this->base() . '/v2/checkout/orders', [
                'intent' => 'CAPTURE',
                'purchase_units' => [[
                    'reference_id' => $invoice->number,
                    'custom_id' => (string) $invoice->id,
                    'description' => 'Cinammon · factura ' . $invoice->number,
                    'amount' => ['currency_code' => strtoupper(config('payments.currency')), 'value' => number_format($invoice->amount, 2, '.', '')],
                ]],
                'application_context' => [
                    'brand_name' => 'Cinammon',
                    'user_action' => 'PAY_NOW',
                    'shipping_preference' => 'NO_SHIPPING',
                    'return_url' => route('payments.paypal.return'),
                    'cancel_url' => route('checkout.show', $invoice) . '?status=cancelled',
                ],
            ])->throw();

        $approve = collect($response->json('links'))->firstWhere('rel', 'approve')['href'] ?? null;

        return [(string) $response->json('id'), (string) $approve];
    }

    /** Captura el pago. Devuelve los datos si quedó COMPLETED, o null. */
    public function capture(string $orderId): ?array
    {
        $response = Http::withToken($this->token())->acceptJson()->timeout(20)
            ->withBody('{}', 'application/json')
            ->post($this->base() . "/v2/checkout/orders/{$orderId}/capture");

        $data = $response->json();

        return ($data['status'] ?? null) === 'COMPLETED' ? $data : null;
    }
}
