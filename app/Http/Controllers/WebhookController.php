<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Services\Payments\NowPayments;
use App\Services\Payments\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    /** Notificación IPN de NOWPayments (firmada con el IPN secret). */
    public function nowpayments(Request $request, NowPayments $now, PaymentService $payments): JsonResponse
    {
        $data = $now->verify($request->getContent(), $request->header('x-nowpayments-sig'));
        if (!$data) {
            Log::warning('NOWPayments IPN: firma no válida', ['ip' => $request->ip()]);

            return response()->json(['ok' => false], 401);
        }

        $invoice = Invoice::where('number', (string) ($data['order_id'] ?? ''))->first();
        if (!$invoice) {
            return response()->json(['ok' => false, 'error' => 'unknown invoice'], 404);
        }

        $status = $data['payment_status'] ?? '';
        $amount = (float) ($data['price_amount'] ?? 0);
        $currency = strtoupper((string) ($data['price_currency'] ?? ''));
        Log::info("NOWPayments IPN {$invoice->number}: {$status}");

        if (in_array($status, ['finished', 'confirmed'], true)) {
            if ($currency !== strtoupper(config('payments.currency')) || $amount + 0.001 < $invoice->amount) {
                Log::warning('NOWPayments IPN: importe o moneda no coinciden', ['invoice' => $invoice->number, 'amount' => $amount, 'currency' => $currency]);

                return response()->json(['ok' => false, 'error' => 'amount mismatch'], 422);
            }
            $payments->markPaid($invoice, 'crypto', (string) ($data['payment_id'] ?? $invoice->payment_reference));
        }

        return response()->json(['ok' => true]);
    }
}
