@php
    // Favicon del subdominio (cinammon.store / .billing; el resto, .net) con los colores de la temporada del visitante.
    $favSub = explode('.', request()->getHost())[0];
    $favSite = in_array($favSub, ['panel', 'demo', 'store', 'billing'], true) ? $favSub : 'net';
    try {
        $favCtx = app(\App\Services\SeasonService::class)->forRequest(request());
        $favKey = $favCtx['holiday']['key'] ?? $favCtx['season']['key'] ?? 'default';
    } catch (\Throwable) {
        $favKey = 'default';
    }
    $favHref = "/api/season-favicon/{$favSite}.png?s={$favKey}&d=".now()->format('Ymd');
@endphp
<link rel="icon" type="image/png" href="{{ $favHref }}" />
<link rel="apple-touch-icon" href="{{ $favHref }}" />
