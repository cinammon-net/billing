<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StoreController;
use Illuminate\Support\Facades\Route;

// Tienda principal de Cinammon Billing
Route::get('/', [StoreController::class, 'index'])->name('home');

// 🔐 Single Sign-On (SSO): Acceso directo y autenticado desde Cinammon Panel
Route::get('/sso', function (\Illuminate\Http\Request $request) {
    $encoded = (string) $request->query('data');
    $sig = (string) $request->query('sig');
    $secret = (string) config('billing.panel_token');

    if (!$encoded || !$sig || !$secret) {
        return redirect()->route('login');
    }

    $expectedSig = hash_hmac('sha256', $encoded, $secret);
    if (!hash_equals($expectedSig, $sig)) {
        abort(401, 'Firma de autenticación SSO inválida');
    }

    $payload = json_decode(base64_decode($encoded), true);
    if (!$payload || !isset($payload['email'], $payload['exp']) || $payload['exp'] < time()) {
        abort(401, 'Sesión SSO expirada. Por favor vuelve a acceder desde el panel.');
    }

    $user = \App\Models\User::firstOrCreate(
        ['email' => $payload['email']],
        [
            'name' => $payload['name'] ?? 'Usuario',
            'password' => \Illuminate\Support\Facades\Hash::make(\Illuminate\Support\Str::random(32)),
            'email_verified_at' => now(),
        ]
    );

    \Illuminate\Support\Facades\Auth::login($user, true);
    $request->session()->regenerate();

    return redirect()->route('dashboard');
})->name('sso');

// Tienda (pública)
Route::get('/store', [StoreController::class, 'index'])->name('store');
Route::get('/store/{category}', [StoreController::class, 'category'])->name('store.category');

// API pública: catálogo de planes (lo consume la landing del panel)
Route::get('/api/plans', function () {
    return response()->json([
        'categories' => collect(StoreController::CATEGORIES)->map(function ($meta, $key) {
            return [
                'key' => $key,
                ...$meta,
                'plans' => \App\Models\Plan::where('category', $key)->orderBy('sort')->get(),
            ];
        })->filter(fn ($category) => $category['plans']->isNotEmpty())->values(),
    ]);
})->name('api.plans');

// Área de clientes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::post('/orders', [OrderController::class, 'store'])->name('orders.store');
    Route::post('/orders/{order}/cancel', [OrderController::class, 'cancel'])->name('orders.cancel');
    // Pago de facturas: el cliente elige método en la página de checkout
    Route::get('/invoices/{invoice}/pay', [\App\Http\Controllers\CheckoutController::class, 'show'])->name('checkout.show');
    Route::post('/invoices/{invoice}/pay/manual', [\App\Http\Controllers\CheckoutController::class, 'manual'])->middleware('throttle:10,1')->name('checkout.manual');
    Route::post('/invoices/{invoice}/pay/crypto', [\App\Http\Controllers\CheckoutController::class, 'crypto'])->middleware('throttle:10,1')->name('checkout.crypto');
    Route::post('/invoices/{invoice}/pay/paypal', [\App\Http\Controllers\CheckoutController::class, 'paypal'])->middleware('throttle:10,1')->name('checkout.paypal');
    Route::post('/invoices/{invoice}/pay/simulate', [\App\Http\Controllers\CheckoutController::class, 'simulate'])->name('checkout.simulate');
    Route::get('/payments/paypal/return', [\App\Http\Controllers\CheckoutController::class, 'paypalReturn'])->name('payments.paypal.return');
});

// Administración de planes y precios
Route::middleware(['auth', 'verified', 'billing.admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/plans', [\App\Http\Controllers\Admin\PlanController::class, 'index'])->name('plans.index');
    Route::post('/plans', [\App\Http\Controllers\Admin\PlanController::class, 'store'])->name('plans.store');
    Route::put('/plans/{plan}', [\App\Http\Controllers\Admin\PlanController::class, 'update'])->name('plans.update');
    Route::patch('/plans/{plan}/price', [\App\Http\Controllers\Admin\PlanController::class, 'updatePrice'])->name('plans.price');
    Route::delete('/plans/{plan}', [\App\Http\Controllers\Admin\PlanController::class, 'destroy'])->name('plans.destroy');
    Route::get('/payment-methods', [\App\Http\Controllers\Admin\PaymentSettingsController::class, 'index'])->name('payment-methods.index');
    Route::put('/payment-methods/{method}', [\App\Http\Controllers\Admin\PaymentSettingsController::class, 'update'])->name('payment-methods.update');
    Route::get('/payments', [\App\Http\Controllers\Admin\PaymentController::class, 'index'])->name('payments.index');
    Route::post('/payments/{invoice}/confirm', [\App\Http\Controllers\Admin\PaymentController::class, 'confirm'])->name('payments.confirm');
    Route::post('/payments/{invoice}/reject', [\App\Http\Controllers\Admin\PaymentController::class, 'reject'])->name('payments.reject');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::post('/profile/logout-other-sessions', [ProfileController::class, 'logoutOtherSessions'])->name('profile.logout-other-sessions');
    Route::patch('/profile/billing-details', [ProfileController::class, 'updateBillingDetails'])->name('profile.billing-details');

    Route::post('/profile/two-factor', [\App\Http\Controllers\TwoFactorController::class, 'store'])->name('two-factor.enable');
    Route::post('/profile/two-factor/confirm', [\App\Http\Controllers\TwoFactorController::class, 'confirm'])->name('two-factor.confirm');
    Route::delete('/profile/two-factor', [\App\Http\Controllers\TwoFactorController::class, 'destroy'])->name('two-factor.disable');
});

require __DIR__.'/auth.php';

Route::get('/dev-autologin', function (\Illuminate\Http\Request $request) {
    if (!app()->environment('local')) {
        abort(403);
    }
    $user = \App\Models\User::first();
    if ($user) {
        \Illuminate\Support\Facades\Auth::login($user, true);
        $request->session()->regenerate();
    }
    $to = $request->query('to', '/dashboard');
    return redirect($to);
});

// Notificaciones de pasarelas de pago (sin sesión ni CSRF; se verifican por firma)
Route::post('/webhooks/nowpayments', [\App\Http\Controllers\WebhookController::class, 'nowpayments'])->middleware('throttle:60,1')->name('webhooks.nowpayments');
