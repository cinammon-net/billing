<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Datos de la tienda para el bot de Discord. Solo lo llama el panel (con el token
 * compartido X-Billing-Token), que antes comprueba qué cuenta tiene vinculado ese Discord.
 */
class PanelBotController extends Controller
{
    public function account(Request $request, CoinsController $coins): JsonResponse
    {
        $user = $this->user($request);
        if (! $user) {
            return response()->json(['error' => 'not_found'], 404);
        }
        $coins->ensureReferralCode($user);

        return response()->json([
            'coins' => (int) $user->coins,
            'streak' => $coins->currentStreak($user),
            'checkin_done' => $user->last_checkin?->isToday() ?? false,
            'referral' => [
                'url' => route('referral', $user->referral_code),
                'invited' => User::where('referred_by', $user->id)->count(),
                'active' => User::where('referred_by', $user->id)->where('referral_stage', '>', 0)->count(),
            ],
            'invoices' => Invoice::where('user_id', $user->id)->latest()->limit(8)->get()->map(fn (Invoice $i) => [
                'id' => $i->id,
                'number' => $i->number,
                'amount' => $i->amount,
                'status' => $i->status,
                'due_at' => $i->due_at?->toIso8601String(),
                'url' => $i->status === 'paid' ? route('dashboard') : route('checkout.show', $i),
            ]),
            'orders' => Order::where('user_id', $user->id)->whereNotIn('status', ['cancelled'])->latest()->limit(15)->get()->map(fn (Order $o) => [
                'id' => $o->id,
                'name' => $o->server_name,
                'status' => $o->status,
                'price' => $o->price,
                'cycle' => $o->billing_cycle,
                'renews_at' => $o->renews_at?->toIso8601String(),
                'free' => (bool) $o->is_free,
                'panel_server_id' => $o->panel_server_id,
            ]),
            'urls' => ['coins' => route('coins.index'), 'store' => url('/store'), 'invoices' => route('dashboard')],
        ]);
    }

    public function checkin(Request $request, CoinsController $coins): JsonResponse
    {
        $user = $this->user($request);
        if (! $user) {
            return response()->json(['error' => 'not_found'], 404);
        }
        [$ok, $message] = $coins->claimCheckin($user);

        return response()->json(['ok' => $ok, 'message' => $message, 'coins' => (int) $user->fresh()->coins]);
    }

    private function user(Request $request): ?User
    {
        $token = (string) config('billing.panel_token');
        abort_if($token === '' || ! hash_equals($token, (string) $request->header('X-Billing-Token')), 401);
        $email = strtolower(trim((string) $request->input('email')));

        return $email === '' ? null : User::whereRaw('LOWER(email) = ?', [$email])->first();
    }
}
