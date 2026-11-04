<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Services\Payments\NowPayments;
use App\Services\Payments\PaymentService;
use App\Services\Payments\PayPal;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    public function __construct(private readonly PaymentService $payments)
    {
    }

    private function own(Request $request, Invoice $invoice): void
    {
        abort_unless($invoice->user_id === $request->user()->id, 403);
    }

    /** Página de pago de una factura: el cliente elige método. */
    public function show(Request $request, Invoice $invoice): Response|RedirectResponse
    {
        $this->own($request, $invoice);
        if ($invoice->status === 'paid') {
            return redirect()->route('dashboard')->with('success', 'Esta factura ya está pagada.');
        }
        $invoice->load('order.plan:id,name,category,role');

        return Inertia::render('Checkout', [
            'invoice' => [
                'id' => $invoice->id,
                'number' => $invoice->number,
                'amount' => $invoice->amount,
                'status' => $invoice->status,
                'payment_method' => $invoice->payment_method,
                'payer_note' => $invoice->payer_note,
                'admin_note' => $invoice->admin_note,
                'concept' => $invoice->order?->server_name,
                'plan' => $invoice->order?->plan?->name,
            ],
            'methods' => PaymentService::methods(),
            'currency' => config('payments.currency'),
            'canSimulate' => (bool) $request->user()->is_admin,
            'returnStatus' => $request->query('status'),
        ]);
    }

    /** Transferencia o Bizum: el cliente avisa de que ha pagado y queda pendiente de confirmar. */
    public function manual(Request $request, Invoice $invoice): RedirectResponse
    {
        $this->own($request, $invoice);
        $data = $request->validate([
            'method' => ['required', Rule::in(['transfer', 'bizum'])],
            'payer_note' => ['required', 'string', 'max:255'],
        ]);
        abort_unless(PaymentService::enabled($data['method']), 404);
        abort_if($invoice->status === 'paid', 409, 'La factura ya está pagada.');

        $invoice->update(['status' => 'awaiting', 'payment_method' => $data['method'], 'payer_note' => $data['payer_note'], 'admin_note' => null]);

        return redirect()->route('dashboard')->with('success', "Aviso de pago recibido para {$invoice->number}. Activaremos tu servicio en cuanto confirmemos el ingreso.");
    }

    public function crypto(Request $request, Invoice $invoice, NowPayments $now): RedirectResponse|\Symfony\Component\HttpFoundation\Response
    {
        $this->own($request, $invoice);
        abort_unless(PaymentService::enabled('crypto'), 404);
        abort_if($invoice->status === 'paid', 409, 'La factura ya está pagada.');

        try {
            [$id, $url] = $now->createInvoice($invoice);
        } catch (\Throwable $e) {
            Log::warning('NOWPayments: ' . $e->getMessage(), ['invoice' => $invoice->number]);

            return back()->withErrors(['payment' => 'No se pudo iniciar el pago con cripto. Inténtalo de nuevo en unos minutos.']);
        }
        $invoice->update(['payment_method' => 'crypto', 'payment_reference' => $id]);

        return Inertia::location($url);
    }

    public function paypal(Request $request, Invoice $invoice, PayPal $paypal): RedirectResponse|\Symfony\Component\HttpFoundation\Response
    {
        $this->own($request, $invoice);
        abort_unless(PaymentService::enabled('paypal'), 404);
        abort_if($invoice->status === 'paid', 409, 'La factura ya está pagada.');

        try {
            [$orderId, $url] = $paypal->createOrder($invoice);
        } catch (\Throwable $e) {
            Log::warning('PayPal: ' . $e->getMessage(), ['invoice' => $invoice->number]);

            return back()->withErrors(['payment' => 'No se pudo iniciar el pago con PayPal. Inténtalo de nuevo en unos minutos.']);
        }
        $invoice->update(['payment_method' => 'paypal', 'payment_reference' => $orderId]);

        return Inertia::location($url);
    }

    /** Vuelta de PayPal tras aprobar: se captura el pago y se activa el pedido. */
    public function paypalReturn(Request $request, PayPal $paypal): RedirectResponse
    {
        $orderId = (string) $request->query('token');
        $invoice = Invoice::where('payment_method', 'paypal')->where('payment_reference', $orderId)->first();
        abort_unless($invoice && $invoice->user_id === $request->user()->id, 404);

        if ($invoice->status === 'paid') {
            return redirect()->route('dashboard')->with('success', 'Esta factura ya está pagada.');
        }

        $capture = $paypal->capture($orderId);
        $amount = (float) data_get($capture, 'purchase_units.0.payments.captures.0.amount.value', 0);
        $currency = strtoupper((string) data_get($capture, 'purchase_units.0.payments.captures.0.amount.currency_code'));

        if (!$capture || $currency !== strtoupper(config('payments.currency')) || $amount + 0.001 < $invoice->amount) {
            Log::warning('PayPal: captura no válida', ['invoice' => $invoice->number, 'order' => $orderId, 'amount' => $amount, 'currency' => $currency]);

            return redirect()->route('checkout.show', $invoice)->withErrors(['payment' => 'PayPal no confirmó el pago. No se te ha cobrado; puedes intentarlo de nuevo.']);
        }

        $captureId = (string) data_get($capture, 'purchase_units.0.payments.captures.0.id', $orderId);

        return redirect()->route('dashboard')->with('success', $this->payments->markPaid($invoice, 'paypal', $captureId));
    }

    /** Pago simulado: solo admins (pruebas y regalos). */
    public function simulate(Request $request, Invoice $invoice): RedirectResponse
    {
        abort_unless($request->user()->is_admin, 403);
        $this->own($request, $invoice);

        return redirect()->route('dashboard')->with('success', '[Simulado] ' . $this->payments->markPaid($invoice, 'simulated', 'admin:' . $request->user()->id));
    }
}
