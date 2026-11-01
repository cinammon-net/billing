<?php

namespace App\Http\Controllers;

use App\Services\Totp;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Str;

class TwoFactorController extends Controller
{
    /**
     * Genera un secreto pendiente de confirmación.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        abort_if($user->two_factor_confirmed_at !== null, 400, '2FA ya está activado');

        $user->forceFill([
            'two_factor_secret' => Crypt::encryptString(Totp::generateSecret()),
            'two_factor_confirmed_at' => null,
        ])->save();

        return back();
    }

    /**
     * Confirma el 2FA verificando un código del autenticador.
     */
    public function confirm(Request $request): RedirectResponse
    {
        $request->validate(['code' => ['required', 'string']]);

        $user = $request->user();
        abort_unless($user->two_factor_secret, 400);

        $secret = Crypt::decryptString($user->two_factor_secret);

        if (!Totp::verify($secret, $request->input('code'))) {
            return back()->withErrors(['code' => 'El código no es válido. Inténtalo de nuevo.']);
        }

        $recoveryCodes = collect(range(1, 8))
            ->map(fn () => Str::upper(Str::random(5)) . '-' . Str::upper(Str::random(5)))
            ->all();

        $user->forceFill([
            'two_factor_recovery_codes' => Crypt::encryptString(json_encode($recoveryCodes)),
            'two_factor_confirmed_at' => now(),
        ])->save();

        return back()->with('recoveryCodes', $recoveryCodes);
    }

    /**
     * Desactiva el 2FA con confirmación de contraseña.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate(['password' => ['required', 'current_password']]);

        $request->user()->forceFill([
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ])->save();

        return back();
    }
}
