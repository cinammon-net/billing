<?php

namespace App\Providers;

use App\Listeners\RecordLogin;
use Illuminate\Auth\Events\Login;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Contraseñas sencillas (4+ caracteres, sin exigir mayúsculas ni símbolos); siempre se guardan cifradas con bcrypt.
        \Illuminate\Validation\Rules\Password::defaults(fn () => \Illuminate\Validation\Rules\Password::min(4));

        Event::listen(Login::class, RecordLogin::class);

        // Mailer "cloudflare" (MAIL_MAILER=cloudflare): envía a través del Worker cinammon-mail.
        \Illuminate\Support\Facades\Mail::extend('cloudflare', fn () => new \App\Mail\Transport\CloudflareTransport(
            (string) config('services.cloudflare_mail.url'),
            (string) config('services.cloudflare_mail.secret'),
            'billing',
        ));

        // "He olvidado mi contraseña" en español y con la marca.
        \Illuminate\Auth\Notifications\ResetPassword::toMailUsing(fn ($user, string $token) => \App\Mail\ResetPasswordMail::build($user, $token));
    }
}
