<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
                // Foto de perfil del panel (la tienda no guarda fotos propias)
                'avatar' => fn () => $request->user() ? app(\App\Services\PanelService::class)->avatarFor($request->user()->email) : null,
            ],
            'panelUrl' => config('billing.panel_url'),
            'billingUrl' => config('app.url'),
            'billingCycles' => \App\Models\Plan::cycleMeta(),
            // Descuento por rango VIP activo (se aplica a los servidores)
            'vipDiscount' => fn () => \App\Models\Plan::vipDiscountFor($request->user()),
            // Regalo de cumpleaños: descuento de un solo uso durante unos días
            'birthdayDiscount' => fn () => \App\Support\BirthdayGift::forPage($request->user()),
            'vipRanks' => fn () => \App\Models\Plan::activeRanksFor($request->user()),
            // Ambientación de temporada y descuento del festivo para el país del visitante
            'season' => fn () => app(\App\Services\SeasonService::class)->forRequest($request),
            'coins' => fn () => $request->user()?->coins,
            // Aviso de mantenimiento anunciado desde el panel
            'maintenance' => fn () => app(\App\Services\PanelService::class)->maintenance(),
            // Anuncios (ofertas, novedades, eventos) publicados desde el panel para la tienda
            'announcements' => fn () => app(\App\Services\PanelService::class)->announcements(),
            // Resumen del Calendario de Adviento / Regalos (si está activo)
            'adventSummary' => fn () => \App\Support\Advent::summary(),
            'flash' => [
                'success' => $request->session()->get('success'),
            ],
        ];
    }
}
