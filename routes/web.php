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

    // Destino opcional desde el panel (lista cerrada, nunca una URL libre).
    return $request->query('to') === 'coins' ? redirect()->route('coins.index') : redirect()->route('dashboard');
})->name('sso');

// Tienda (pública)
Route::get('/store', [StoreController::class, 'index'])->name('store');
Route::get('/store/free', [StoreController::class, 'free'])->name('store.free');
Route::get('/store/{category}', [StoreController::class, 'category'])->name('store.category');

// Calendario de Adviento y eventos especiales (visible públicamente; abrir casilla requiere cuenta)
Route::get('/advent', [\App\Http\Controllers\AdventController::class, 'index'])->name('advent.index');

// API pública: catálogo de planes (lo consume la landing del panel)
Route::get('/api/plans', function () {
    return response()->json([
        'categories' => collect(StoreController::CATEGORIES)->map(function ($meta, $key) {
            return [
                'key' => $key,
                ...$meta,
                'plans' => \App\Models\Plan::where('category', $key)->whereNull('coin_cost')->orderBy('sort')->get(),
            ];
        })->filter(fn ($category) => $category['plans']->isNotEmpty())->values(),
    ]);
})->name('api.plans');

// API pública: métodos de pago activos, solo el nombre (sin IBAN, teléfono ni claves). La usa el bot de Discord.
Route::get('/api/payment-methods', fn () => response()->json([
    'methods' => array_map(fn ($m) => ['key' => $m['key'], 'label' => $m['label'], 'auto' => $m['auto']], \App\Services\Payments\PaymentService::methods()),
    'currency' => config('payments.currency'),
    'coins' => true,
]))->middleware('throttle:60,1')->name('api.payment-methods');

// Bot de Discord (vía panel, token compartido X-Billing-Token): monedas, racha, invitaciones y facturas
Route::post('/api/panel/bot/account', [\App\Http\Controllers\PanelBotController::class, 'account'])->middleware('throttle:120,1');
Route::post('/api/panel/bot/checkin', [\App\Http\Controllers\PanelBotController::class, 'checkin'])->middleware('throttle:60,1');
Route::post('/api/panel/bot/birthday', [\App\Http\Controllers\PanelBotController::class, 'birthday'])->middleware('throttle:60,1');
Route::post('/api/panel/bot/referral', [\App\Http\Controllers\PanelBotController::class, 'referral'])->middleware('throttle:60,1');
Route::post('/api/panel/bot/feed', [\App\Http\Controllers\PanelBotController::class, 'feed'])->middleware('throttle:60,1');

// Invitaciones: /r/CODIGO guarda quién invita y lleva a los servidores gratis
Route::get('/r/{code}', [\App\Http\Controllers\CoinsController::class, 'referral'])->where('code', '[A-Za-z0-9]{4,12}')->middleware('throttle:60,1')->name('referral');

// Contador público de servidores gratis (lo muestran la tienda y la portada del panel)
Route::get('/api/free-stats', fn () => response()->json(\App\Support\FreeTier::publicStats()))->middleware('throttle:120,1')->name('api.free-stats');

// Ambientación de temporada + promoción vigente por país (la consume el panel)
Route::get('/api/season', [\App\Http\Controllers\SeasonController::class, 'show'])->middleware('throttle:120,1')->name('api.season');
Route::get('/api/season-favicon/{site}.png', [\App\Http\Controllers\SeasonController::class, 'favicon'])->middleware('throttle:240,1')->where('site', '[a-z]+')->name('api.season.favicon');

// Área de clientes
Route::middleware(['auth', 'verified'])->group(function () {
    // Monedas: anuncios con recompensa, racha diaria, misiones e invitaciones → servidor gratis
    Route::get('/coins', [\App\Http\Controllers\CoinsController::class, 'index'])->name('coins.index');
    Route::post('/coins/checkin', [\App\Http\Controllers\CoinsController::class, 'checkin'])->middleware('throttle:10,1')->name('coins.checkin');
    Route::post('/coins/missions/{mission}', [\App\Http\Controllers\CoinsController::class, 'mission'])->middleware('throttle:20,1')->name('coins.mission');
    Route::post('/coins/ads/start', [\App\Http\Controllers\CoinsController::class, 'startAd'])->middleware('throttle:10,1')->name('coins.ads.start');
    Route::post('/coins/ads/complete', [\App\Http\Controllers\CoinsController::class, 'completeAd'])->middleware('throttle:10,1')->name('coins.ads.complete');
    Route::post('/coins/free-server', [\App\Http\Controllers\CoinsController::class, 'claim'])->middleware('throttle:5,1')->name('coins.claim');
    Route::post('/coins/free-server/{order}/renew', [\App\Http\Controllers\CoinsController::class, 'renew'])->middleware('throttle:10,1')->name('coins.renew');
    Route::post('/advent/{day}/claim', [\App\Http\Controllers\AdventController::class, 'claim'])->whereNumber('day')->middleware('throttle:15,1')->name('advent.claim');
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
    Route::get('/promotions', [\App\Http\Controllers\Admin\PromotionController::class, 'index'])->name('promotions.index');
    Route::get('/free', [\App\Http\Controllers\Admin\FreeTierController::class, 'index'])->name('free.index');
    Route::put('/free', [\App\Http\Controllers\Admin\FreeTierController::class, 'update'])->name('free.update');
    Route::post('/free/{order}/suspend', [\App\Http\Controllers\Admin\FreeTierController::class, 'suspend'])->name('free.suspend');
    Route::put('/promotions/{promotion}', [\App\Http\Controllers\Admin\PromotionController::class, 'update'])->name('promotions.update');
    Route::put('/advent', [\App\Http\Controllers\AdventController::class, 'updateSettings'])->name('advent.update');
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
