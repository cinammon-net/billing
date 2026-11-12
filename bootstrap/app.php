<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            \App\Http\Middleware\SplitStoreDomain::class,
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        // XSRF-TOKEN solo para la tienda, no para todo .cinammon.net (chocaba con la del panel: error 419)
        $middleware->web(replace: [\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class => \App\Http\Middleware\HostOnlyCsrfCookie::class]);

        // Las pasarelas no envían token CSRF: se valida la firma en el controlador.
        $middleware->validateCsrfTokens(except: ['webhooks/*', 'api/panel/bot/*', 'api/panel/mails', 'api/panel/mails/*']);

        $middleware->alias([
            'billing.admin' => \App\Http\Middleware\EnsureBillingAdmin::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
