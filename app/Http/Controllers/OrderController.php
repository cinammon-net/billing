<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Order;
use App\Models\Plan;
use App\Services\PanelService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(private readonly PanelService $panel)
    {
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'plan_id' => ['required', 'exists:plans,id'],
            'server_name' => ['required', 'string', 'max:60'],
        ]);

        $plan = Plan::findOrFail($validated['plan_id']);

        $order = Order::create([
            'user_id' => $request->user()->id,
            'plan_id' => $plan->id,
            'server_name' => $validated['server_name'],
            'status' => 'pending',
            'price' => $plan->price,
        ]);

        Invoice::create([
            'user_id' => $request->user()->id,
            'order_id' => $order->id,
            'number' => sprintf('CIN-%s-%04d', now()->format('Ym'), $order->id),
            'amount' => $plan->price,
            'status' => 'pending',
            'due_at' => now()->addDays(7),
        ]);

        return redirect()->route('dashboard')->with(
            'success',
            "Pedido «{$validated['server_name']}» creado. Paga la factura para activar tu servidor."
        );
    }

    /**
     * Paga una factura pendiente y aprovisiona el servidor del pedido.
     */
    public function pay(Request $request, Invoice $invoice): RedirectResponse
    {
        abort_unless($invoice->user_id === $request->user()->id, 403);

        if ($invoice->status === 'paid') {
            return redirect()->route('dashboard')->with('success', 'Esta factura ya está pagada.');
        }

        // Pago simulado: aquí iría la pasarela real (Stripe, PayPal…)
        $invoice->update(['status' => 'paid', 'due_at' => now()]);

        $order = $invoice->order;
        $order->update(['status' => 'active', 'renews_at' => now()->addMonth()]);

        $provisioned = $this->panel->provision($order);

        return redirect()->route('dashboard')->with(
            'success',
            $provisioned
                ? "Pago recibido. Servidor «{$order->server_name}» creado en el panel. 🚀"
                : "Pago recibido. El servidor «{$order->server_name}» se está preparando en el panel."
        );
    }

    public function cancel(Request $request, Order $order): RedirectResponse
    {
        abort_unless($order->user_id === $request->user()->id, 403);

        $order->update(['status' => 'cancelled']);
        $this->panel->cancel($order);

        return redirect()->route('dashboard')
            ->with('success', "Servicio «{$order->server_name}» cancelado.");
    }
}
