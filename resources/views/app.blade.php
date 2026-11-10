<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Cinammon') }}</title>

        <!-- Fonts -->
        <link rel="icon" href="/favicon.ico" />
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
        <script src="/season/season.js?v=8" defer></script>
    </head>
    <body class="font-sans antialiased bg-black text-white">
        @inertia
    </body>
</html>
