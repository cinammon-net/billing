<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StoreController;
use Illuminate\Support\Facades\Route;

// La web principal es el panel: billing solo es el área de clientes.
Route::get('/', fn () => redirect()->away(config('billing.panel_url')));

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
        })->values(),
    ]);
})->name('api.plans');

// Área de clientes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::post('/orders', [OrderController::class, 'store'])->name('orders.store');
    Route::post('/orders/{order}/cancel', [OrderController::class, 'cancel'])->name('orders.cancel');
    Route::post('/invoices/{invoice}/pay', [OrderController::class, 'pay'])->name('invoices.pay');
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
