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

    public function store(Request $request, \App\Services\SeasonService $seasons): RedirectResponse
    {
        if ($this->panel->storeBlocked()) {
            return back()->withErrors(['plan_id' => 'La tienda está en mantenimiento: no se aceptan pedidos nuevos ahora mismo. Inténtalo cuando termine.']);
        }

        $validated = $request->validate([
            'plan_id' => ['required', 'exists:plans,id'],
            'server_name' => ['nullable', 'string', 'max:60'],
            'billing_cycle' => ['nullable', Rule::in(array_keys(Plan::CYCLES))],
        ]);

        $plan = Plan::findOrFail($validated['plan_id']);
        if ($plan->coin_cost !== null) {
            // Los planes gratuitos solo se consiguen con monedas.
            return redirect()->route('coins.index');
        }
        $cycle = $validated['billing_cycle'] ?? 'monthly';
        if ($plan->priceFor($cycle) === null) {
            return back()->withErrors(['billing_cycle' => 'Este plan no está disponible con ese período de facturación.']);
        }

        if ($plan->isRank()) {
            // Un rango no crea servidor: el pedido lleva el nombre del rango.
            $validated['server_name'] = 'Rango '.$plan->name;
        } elseif (blank($validated['server_name'] ?? null)) {
            return back()->withErrors(['server_name' => 'Pon un nombre para tu servidor.']);
        }

        $quote = \App\Support\StoreOrder::quote($request->user(), $plan, $cycle, $seasons->forRequest($request));
        $invoice = \App\Support\StoreOrder::place($request->user(), $plan, $cycle, $validated['server_name'], $quote);

        // Del billete se pasa directo al pago: nada de buscar la factura en el dashboard.
        return redirect()->route('checkout.show', $invoice)->with(
            'success',
            $plan->isRank()
                ? "Billete reservado: rango «{$plan->name}». Elige cómo pagar y se activa en el panel."
                : "Billete reservado: «{$validated['server_name']}». Elige cómo pagar y lo desplegamos."
        );
    }

    /**
     * Vuelve al plan que se estaba eligiendo antes de iniciar sesión o registrarse
     * (la ruta exige sesión, así que Laravel la guarda como destino "intended").
     */
    public function resume(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'plan' => ['required', 'integer', 'exists:plans,id'],
            'cycle' => ['nullable', Rule::in(array_keys(Plan::CYCLES))],
            'name' => ['nullable', 'string', 'max:60'],
        ]);
        $plan = Plan::findOrFail($data['plan']);
        if ($plan->coin_cost !== null) {
            return redirect()->route('coins.index');
        }

        return redirect()->route('store.category', array_filter([
            'category' => $plan->category,
            'plan' => $plan->id,
            'cycle' => $data['cycle'] ?? null,
            'name' => $data['name'] ?? null,
        ]));
    }

    public function cancel(Request $request, Order $order): RedirectResponse
    {
        abort_unless($order->user_id === $request->user()->id, 403);

        $order->update(['status' => 'cancelled']);

        if ($order->plan?->isRank()) {
            $this->panel->revokeRole($order);

            return redirect()->route('dashboard')->with('warning', "Rango «{$order->plan->name}» cancelado. Sus ventajas se han retirado del panel.");
        }

        $this->panel->cancel($order);

        $deletionDate = now()->addDays(7)->format('d/m/Y');

        return redirect()->route('dashboard')
            ->with(
                'warning',
                "Servicio «{$order->server_name}» cancelado. Los servidores han sido detenidos de inmediato. Tienes hasta el {$deletionDate} (7 días) para descargar tus respaldos antes de su eliminación permanente."
            );
    }
}
