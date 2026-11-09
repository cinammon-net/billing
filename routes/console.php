<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();

// Servidores gratuitos de monedas: se suspenden al caducar (lo lanza el timer cinammon-billing-coins).
\Illuminate\Support\Facades\Schedule::command('coins:expire-free')->everyTenMinutes();
