<?php

namespace App\Services;

use App\Models\CoinTransaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CoinService
{
    /** Suma (o resta, si es negativo) monedas de forma atómica. Devuelve false si no hay saldo. */
    public function apply(User $user, int $amount, string $reason, ?string $detail = null): bool
    {
        return DB::transaction(function () use ($user, $amount, $reason, $detail) {
            $locked = User::whereKey($user->id)->lockForUpdate()->first();
            if ($locked->coins + $amount < 0) {
                return false;
            }
            $locked->increment('coins', $amount);
            CoinTransaction::create(['user_id' => $user->id, 'amount' => $amount, 'reason' => $reason, 'detail' => $detail]);
            $user->coins = $locked->coins;

            return true;
        });
    }

    /** Monedas ganadas hoy (juegos + anuncios), para el tope diario. */
    public function earnedToday(User $user): int
    {
        return (int) CoinTransaction::where('user_id', $user->id)
            ->whereIn('reason', ['game', 'ad'])
            ->where('created_at', '>=', now()->startOfDay())
            ->sum('amount');
    }
}
