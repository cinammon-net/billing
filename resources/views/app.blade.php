<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Cinammon') }}</title>

        <!-- Fonts -->
        @php
            // Logo según el subdominio (cinammon.panel, .demo, .store, .billing); el dominio principal usa el original (.net).
            $cinSub = explode('.', request()->getHost())[0];
            $cinLogo = in_array($cinSub, ['panel', 'demo', 'store', 'billing'], true) ? "/logos/cinammon-{$cinSub}.png" : '/favicon.ico';
        @endphp
        @php
            // Favicon ya coloreado con la temporada/festivo del visitante (Safari no acepta cambiarlo por JS).
            $cinFavSite = in_array($cinSub, ['panel', 'demo', 'store', 'billing'], true) ? $cinSub : 'net';
            $cinSeasonCtx = app(\App\Services\SeasonService::class)->forRequest(request());
            $cinFavKey = $cinSeasonCtx['holiday']['key'] ?? $cinSeasonCtx['season']['key'] ?? 'default';
            $cinFavUrl = "/api/season-favicon/{$cinFavSite}.png?s={$cinFavKey}&d=".now()->format('Ymd');
        @endphp
        <link rel="icon" type="image/png" href="{{ $cinFavUrl }}" />
        <link rel="apple-touch-icon" href="{{ $cinFavUrl }}" />
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;800&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead

        <!-- Ambientación de temporada / festivos según el país del visitante -->
        <script>window.__SEASON__ = @json(app(\App\Services\SeasonService::class)->forRequest(request()));</script>
        <script src="/season/season.js?v=21" defer></script>
    </head>
    <body class="font-sans antialiased bg-black text-white">
        @include('partials.loader', ['a' => 'oklch(var(--tw-c-pink-500, 0.656 0.241 354))', 'b' => 'oklch(var(--tw-c-neon, 0.828 0.189 85))', 'logo' => $cinLogo])
        @inertia
    </body>
</html>
