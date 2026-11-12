<?php

namespace App\Support;

use App\Mail\BillingMail;
use App\Models\Invoice;
use App\Models\Order;
use App\Models\Plan;
use App\Models\User;
use App\Services\SeasonService;

/**
 * Cálculo de precio y creación de pedido + factura. Lo comparten la tienda web
 * (OrderController) y la compra desde Discord (PanelBotController), así el precio
 * y los descuentos son siempre los mismos en los dos sitios.
 */
class StoreOrder
{
    /**
     * Precio final de un plan para un usuario: se aplica solo el mayor descuento
     * (promoción del festivo, VIP en servidores o regalo de cumpleaños).
     *
     * @return array{base: float, price: float, discount: int, reason: ?string, birthday: bool}|null
     */
    public static function quote(?User $user, Plan $plan, string $cycle, array $season): ?array
    {
        $base = $plan->priceFor($cycle);
        if ($base === null) {
            return null;
        }
        $promo = (int) ($season['discount'] ?? 0);
        $vip = $plan->isRank() ? 0 : Plan::vipDiscountFor($user);
        $discount = SeasonService::bestDiscount($promo, $vip, $plan->isRank());
        $reason = $discount <= 0 ? null : ($discount === $promo && $promo > 0 ? ($season['promotion'] ?? 'Oferta') : 'VIP');
        $birthday = BirthdayGift::discountFor($user);
        $usedBirthday = $birthday > $discount;
        if ($usedBirthday) {
            $discount = $birthday;
            $reason = 'Cumpleaños';
        }
        $price = $discount > 0 ? round($base * (100 - $discount) / 100, Plan::CYCLES[$cycle]['decimals']) : $base;

        return ['base' => (float) $base, 'price' => (float) $price, 'discount' => $discount, 'reason' => $reason, 'birthday' => $usedBirthday];
    }

    /** Crea el pedido pendiente y su factura, y manda el correo. */
    public static function place(User $user, Plan $plan, string $cycle, string $serverName, array $quote): Invoice
    {
        if ($quote['birthday']) {
            BirthdayGift::consume($user);
        }

        $order = Order::create([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'server_name' => $serverName,
            'status' => 'pending',
            'price' => $quote['price'],
            'billing_cycle' => $cycle,
        ]);

        $invoice = Invoice::create([
            'user_id' => $user->id,
            'order_id' => $order->id,
            'number' => sprintf('CIN-%s-%04d', now()->format('Ym'), $order->id),
            'amount' => $quote['price'],
            'status' => 'pending',
            'due_at' => now()->addDays(7),
        ]);

        BillingMail::deliver($user->email, "Pedido creado · factura {$invoice->number}", 'invoice-created', [
            'user' => $user,
            'invoice' => $invoice,
            'isRank' => $plan->isRank(),
            'what' => $plan->isRank() ? "Rango {$plan->name}" : "{$plan->name} · {$serverName}",
        ], "invoice-{$invoice->number}");

        return $invoice;
    }
}
