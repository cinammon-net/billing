<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Order;
use App\Models\Plan;
use App\Services\PanelService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    public function __construct(private readonly PanelService $panel)
    {
    }

    public function store(Request $request): RedirectResponse
    {
        if ($this->panel->storeBlocked()) {
            return back()->withErrors(['plan_id' => 'La tienda está en mantenimiento: no se aceptan pedidos nuevos ahora mismo. Inténtalo cuando termine.']);
        }

        $validated = $request->validate([
            'plan_id' => ['required', 'exists:plans,id'],
            'server_name' => ['required', 'string', 'max:60'],
            'billing_cycle' => ['nullable', Rule::in(array_keys(Plan::CYCLES))],
        ]);

        $plan = Plan::findOrFail($validated['plan_id']);
        $cycle = $validated['billing_cycle'] ?? 'monthly';
        $price = $plan->priceFor($cycle);

        if ($price === null) {
            return back()->withErrors(['billing_cycle' => 'Este plan no está disponible con ese período de facturación.']);
        }

        $order = Order::create([
            'user_id' => $request->user()->id,
            'plan_id' => $plan->id,
            'server_name' => $validated['server_name'],
            'status' => 'pending',
            'price' => $price,
            'billing_cycle' => $cycle,
        ]);

        Invoice::create([
            'user_id' => $request->user()->id,
            'order_id' => $order->id,
            'number' => sprintf('CIN-%s-%04d', now()->format('Ym'), $order->id),
            'amount' => $price,
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
        $order->update(['status' => 'active', 'renews_at' => $order->nextRenewal()]);

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

        $deletionDate = now()->addDays(7)->format('d/m/Y');

        return redirect()->route('dashboard')
            ->with(
                'warning',
                "⚠️ Servicio «{$order->server_name}» cancelado. Los servidores han sido detenidos de inmediato. Tienes hasta el {$deletionDate} (7 días) para descargar tus respaldos antes de su eliminación permanente."
            );
    }
}
