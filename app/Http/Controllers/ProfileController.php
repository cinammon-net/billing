<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\Invoice;
use App\Models\Order;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();

        $pendingSecret = null;
        if ($user->two_factor_secret && $user->two_factor_confirmed_at === null) {
            $pendingSecret = \Illuminate\Support\Facades\Crypt::decryptString($user->two_factor_secret);
        }

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => session('status'),
            'sessions' => $this->sessions($request),
            'loginHistory' => DB::table('login_logs')
                ->where('user_id', $user->id)
                ->orderByDesc('id')
                ->limit(10)
                ->get()
                ->map(fn ($log) => [
                    'id' => $log->id,
                    'ip_address' => $log->ip_address,
                    'user_agent' => $this->formatAgent((string) $log->user_agent),
                    'created_at' => date('d/m/Y H:i', strtotime($log->created_at)),
                ])
                ->values()
                ->all(),
            'twoFactor' => [
                'enabled' => $user->two_factor_confirmed_at !== null,
                'pendingSecret' => $pendingSecret,
                'otpauthUrl' => $pendingSecret ? \App\Services\Totp::otpauthUrl($pendingSecret, $user->email) : null,
                'recoveryCodes' => session('recoveryCodes'),
            ],
            'billingDetails' => [
                'company' => $user->company,
                'tax_id' => $user->tax_id,
                'address' => $user->address,
                'city' => $user->city,
                'postal_code' => $user->postal_code,
                'country' => $user->country,
            ],
            'billing' => [
                'activeServices' => Order::where('user_id', $user->id)->where('status', 'active')->count(),
                'invoices' => Invoice::where('user_id', $user->id)->count(),
                'totalSpent' => (float) Invoice::where('user_id', $user->id)->where('status', 'paid')->sum('amount'),
                'memberSince' => $user->created_at?->format('d/m/Y'),
            ],
        ]);
    }

    /**
     * Actualiza los datos de facturación del usuario.
     */
    public function updateBillingDetails(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'company' => ['nullable', 'string', 'max:255'],
            'tax_id' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:100'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'country' => ['nullable', 'string', 'max:100'],
        ]);

        $request->user()->update($validated);

        return back()->with('status', 'billing-details-updated');
    }

    /**
     * Cierra todas las sesiones excepto la actual.
     */
    public function logoutOtherSessions(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        Auth::logoutOtherDevices($request->input('password'));

        DB::table('sessions')
            ->where('user_id', $request->user()->id)
            ->where('id', '!=', $request->session()->getId())
            ->delete();

        return back()->with('status', 'other-sessions-closed');
    }

    private function sessions(Request $request): array
    {
        return DB::table('sessions')
            ->where('user_id', $request->user()->id)
            ->orderByDesc('last_activity')
            ->get()
            ->map(fn ($session) => [
                'id' => substr((string) $session->id, 0, 8),
                'ip_address' => $session->ip_address,
                'user_agent' => $this->formatAgent((string) $session->user_agent),
                'last_activity' => date('d/m/Y H:i', (int) $session->last_activity),
                'is_current' => $session->id === $request->session()->getId(),
            ])
            ->values()
            ->all();
    }

    private function formatAgent(string $agent): string
    {
        $browser = match (true) {
            str_contains($agent, 'Edg/') => 'Edge',
            str_contains($agent, 'OPR/') => 'Opera',
            str_contains($agent, 'Chrome/') => 'Chrome',
            str_contains($agent, 'Safari/') => 'Safari',
            str_contains($agent, 'Firefox/') => 'Firefox',
            default => 'Navegador desconocido',
        };

        $os = match (true) {
            str_contains($agent, 'Windows') => 'Windows',
            str_contains($agent, 'Mac OS X') => 'macOS',
            str_contains($agent, 'Android') => 'Android',
            str_contains($agent, 'iPhone'), str_contains($agent, 'iPad') => 'iOS',
            str_contains($agent, 'Linux') => 'Linux',
            default => 'SO desconocido',
        };

        return "{$browser} · {$os}";
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
