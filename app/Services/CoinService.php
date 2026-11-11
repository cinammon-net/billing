<?php

namespace App\Services;

use App\Models\CoinTransaction;
use App\Models\User;
use App\Support\FreeTier;
use Illuminate\Support\Facades\DB;

class CoinService
{
    /** Motivos que cuentan como «monedas ganadas por actividad» (para activar una invitación). */
    private const EARNED = ['ad', 'checkin', 'mission', 'advent'];

    /** Suma (o resta, si es negativo) monedas de forma atómica. Devuelve false si no hay saldo. */
    public function apply(User $user, int $amount, string $reason, ?string $detail = null): bool
    {
        $ok = DB::transaction(function () use ($user, $amount, $reason, $detail) {
            $locked = User::whereKey($user->id)->lockForUpdate()->first();
            if ($locked->coins + $amount < 0) {
                return false;
            }
            $locked->increment('coins', $amount);
            CoinTransaction::create(['user_id' => $user->id, 'amount' => $amount, 'reason' => $reason, 'detail' => $detail]);
            $user->coins = $locked->coins;

            return true;
        });

        if ($ok && $amount > 0 && in_array($reason, self::EARNED, true)) {
            $this->maybeActivateReferral($user);
        }

        return $ok;
    }

    /** Monedas ganadas hoy con anuncios, para el tope diario. */
    public function earnedToday(User $user): int
    {
        return (int) CoinTransaction::where('user_id', $user->id)
            ->where('reason', 'ad')
            ->where('created_at', '>=', now()->startOfDay())
            ->sum('amount');
    }

    /**
     * Invitaciones: cuando el invitado ya ha ganado unas monedas por su cuenta (es una persona
     * real usando la tienda), premia a los dos. Así crear cuentas falsas no sale a cuenta.
     */
    public function maybeActivateReferral(User $user): void
    {
        $s = FreeTier::settings();
        if (!$user->referred_by || $user->referral_stage > 0) {
            return;
        }
        $earned = (int) CoinTransaction::where('user_id', $user->id)->whereIn('reason', self::EARNED)->where('amount', '>', 0)->sum('amount');
        if ($earned < $s['referral_active_threshold']) {
            return;
        }
        if (User::whereKey($user->id)->where('referral_stage', 0)->update(['referral_stage' => 1]) === 0) {
            return; // otra petición ya lo premió
        }
        $user->referral_stage = 1;
        if ($inviter = User::find($user->referred_by)) {
            $this->apply($inviter, (int) $s['referral_active'], 'referral', "Se unió {$user->name}");
        }
        $this->apply($user, (int) $s['referral_welcome'], 'referral', 'Bienvenida por invitación');
    }

    /** Tras un pago real: monedas de regalo para el comprador y premio a quien le invitó (solo la primera compra). */
    public function rewardPurchase(User $user, float $amountPaid, string $what): void
    {
        $s = FreeTier::settings();
        $gift = (int) floor($amountPaid * $s['coins_per_euro']);
        if ($gift > 0) {
            $this->apply($user, $gift, 'purchase', $what);
        }

        if ($user->referred_by && $user->referral_stage < 2
            && User::whereKey($user->id)->where('referral_stage', '<', 2)->update(['referral_stage' => 2]) > 0) {
            if ($inviter = User::find($user->referred_by)) {
                $this->apply($inviter, (int) $s['referral_purchase'], 'referral', "{$user->name} hizo su primera compra");
            }
        }
    }
}
