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
        $price = $plan->priceFor($cycle);

        if ($price === null) {
            return back()->withErrors(['billing_cycle' => 'Este plan no está disponible con ese período de facturación.']);
        }

        if ($plan->isRank()) {
            // Un rango no crea servidor: el pedido lleva el nombre del rango.
            $validated['server_name'] = 'Rango '.$plan->name;
        } elseif (blank($validated['server_name'] ?? null)) {
            return back()->withErrors(['server_name' => 'Pon un nombre para tu servidor.']);
        }

        // Descuento: el mayor entre la promoción del festivo (país del visitante) y el VIP (solo servidores).
        $discount = \App\Services\SeasonService::bestDiscount(
            $seasons->forRequest($request)['discount'],
            $plan->isRank() ? 0 : Plan::vipDiscountFor($request->user()),
            $plan->isRank(),
        );
        // Regalo de cumpleaños: un solo uso, solo si mejora el descuento que ya tenía.
        $birthday = \App\Support\BirthdayGift::discountFor($request->user());
        $usedBirthday = $birthday > $discount;
        $discount = max($discount, $birthday);
        if ($discount > 0) {
            $price = round($price * (100 - $discount) / 100, Plan::CYCLES[$cycle]['decimals']);
        }
        if ($usedBirthday) {
            \App\Support\BirthdayGift::consume($request->user());
        }

        $order = Order::create([
            'user_id' => $request->user()->id,
            'plan_id' => $plan->id,
            'server_name' => $validated['server_name'],
            'status' => 'pending',
            'price' => $price,
            'billing_cycle' => $cycle,
        ]);

        $invoice = Invoice::create([
            'user_id' => $request->user()->id,
            'order_id' => $order->id,
            'number' => sprintf('CIN-%s-%04d', now()->format('Ym'), $order->id),
            'amount' => $price,
            'status' => 'pending',
            'due_at' => now()->addDays(7),
        ]);

        \App\Mail\BillingMail::deliver($request->user()->email, "Pedido creado · factura {$invoice->number}", 'invoice-created', [
            'user' => $request->user(),
            'invoice' => $invoice,
            'isRank' => $plan->isRank(),
            'what' => $plan->isRank() ? "Rango {$plan->name}" : "{$plan->name} · {$validated['server_name']}",
        ], "invoice-{$invoice->number}");

        return redirect()->route('dashboard')->with(
            'success',
            $plan->isRank()
                ? "Pedido del rango «{$plan->name}» creado. Paga la factura para activarlo en el panel."
                : "Pedido «{$validated['server_name']}» creado. Paga la factura para activar tu servidor."
        );
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
