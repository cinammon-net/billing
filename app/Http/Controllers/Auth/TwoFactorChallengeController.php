<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Totp;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Crypt;
use Inertia\Inertia;
use Inertia\Response;

class TwoFactorChallengeController extends Controller
{
    public function create(Request $request): Response|RedirectResponse
    {
        if (!$request->session()->has('two_factor:user_id')) {
            return redirect()->route('login');
        }

        return Inertia::render('Auth/TwoFactorChallenge');
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate(['code' => ['required', 'string']]);

        $userId = $request->session()->get('two_factor:user_id');
        $remember = (bool) $request->session()->get('two_factor:remember', false);

        if (!$userId || !($user = User::find($userId))) {
            return redirect()->route('login');
        }

        $code = trim((string) $request->input('code'));

        if (!$this->validCode($user, $code)) {
            return back()->withErrors(['code' => 'Código inválido. Prueba con otro o usa un código de recuperación.']);
        }

        $request->session()->forget(['two_factor:user_id', 'two_factor:remember']);

        Auth::login($user, $remember);
        $request->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }

    private function validCode(User $user, string $code): bool
    {
        $secret = Crypt::decryptString($user->two_factor_secret);

        if (Totp::verify($secret, $code)) {
            return true;
        }

        // Códigos de recuperación (un solo uso)
        $codes = json_decode(Crypt::decryptString($user->two_factor_recovery_codes ?? Crypt::encryptString('[]')), true) ?: [];
        $normalized = strtoupper($code);

        if (in_array($normalized, $codes, true)) {
            $user->forceFill([
                'two_factor_recovery_codes' => Crypt::encryptString(json_encode(array_values(array_diff($codes, [$normalized])))),
            ])->save();

            return true;
        }

        return false;
    }
}
