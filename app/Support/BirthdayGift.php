<?php

namespace App\Support;

use App\Models\Order;
use App\Models\User;
use App\Services\CoinService;
use Illuminate\Support\Facades\DB;

/**
 * Set de regalo de cumpleaños (lo pide el panel el día del cumpleaños, una vez al año):
 * monedas, un descuento de un solo uso durante unos días y días extra en los servicios de pago.
 * Los importes los decide el panel (vip = rango VIP o staff); aquí además cuenta tener un plan de pago.
 */
class BirthdayGift
{
    public const COINS = ['normal' => 200, 'vip' => 400];
    public const DISCOUNT = ['normal' => 25, 'vip' => 30];
    public const DISCOUNT_DAYS = 7;
    public const EXTRA_DAYS = 3;

    public static function grant(User $user, int $year, bool $vip): array
    {
        return DB::transaction(function () use ($user, $year, $vip) {
            $locked = User::whereKey($user->id)->lockForUpdate()->first();
            if ((int) $locked->birthday_gift_year === $year && $locked->birthday_gifts) {
                return json_decode($locked->birthday_gifts, true) ?: [];
            }

            $orders = Order::with('plan')->where('user_id', $user->id)->where('status', 'active')
                ->where('is_free', false)->whereNotNull('renews_at')->orderBy('renews_at')->limit(5)->lockForUpdate()->get();
            $tier = ($vip || $orders->isNotEmpty()) ? 'vip' : 'normal';

            app(CoinService::class)->apply($locked, self::COINS[$tier], 'birthday', "Regalo de cumpleaños {$year}");

            $extended = [];
            foreach ($orders as $order) {
                $base = $order->renews_at->isFuture() ? $order->renews_at : now();
                $order->update(['renews_at' => $base->copy()->addDays(self::EXTRA_DAYS)]);
                $extended[] = $order->server_name;
            }

            $until = now()->addDays(self::DISCOUNT_DAYS)->endOfDay();
            $gifts = [
                'coins' => self::COINS[$tier],
                'discount' => self::DISCOUNT[$tier],
                'discount_days' => self::DISCOUNT_DAYS,
                'discount_until' => $until->toIso8601String(),
                'extra_days' => self::EXTRA_DAYS,
                'extended' => $extended,
                'vip' => $tier === 'vip',
            ];
            $locked->forceFill([
                'birthday_gift_year' => $year,
                'birthday_gifts' => json_encode($gifts),
                'birthday_discount_percent' => self::DISCOUNT[$tier],
                'birthday_discount_until' => $until,
            ])->save();

            return $gifts;
        });
    }

    /** Descuento de cumpleaños vigente (0 si no tiene). */
    public static function discountFor(?User $user): int
    {
        if (! $user || ! $user->birthday_discount_percent || ! $user->birthday_discount_until) {
            return 0;
        }

        return \Illuminate\Support\Carbon::parse($user->birthday_discount_until)->isFuture() ? (int) $user->birthday_discount_percent : 0;
    }

    /** Gasta el descuento (un solo uso). */
    public static function consume(User $user): void
    {
        $user->forceFill(['birthday_discount_percent' => null, 'birthday_discount_until' => null])->save();
    }

    public static function forPage(?User $user): ?array
    {
        $pct = self::discountFor($user);

        return $pct ? ['percent' => $pct, 'until' => \Illuminate\Support\Carbon::parse($user->birthday_discount_until)->toIso8601String()] : null;
    }
}
