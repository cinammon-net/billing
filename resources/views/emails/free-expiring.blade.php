<x-mail::message kicker="Servidor gratis">
# Tu servidor gratuito caduca pronto

Hola, {{ $user->name }}. Tu servidor gratuito **{{ $order->server_name }}** caduca el **{{ $order->renews_at->format('d/m/Y \a \l\a\s H:i') }}**.

Si quieres conservarlo, renuévalo con monedas antes de esa hora. Si no, se suspenderá automáticamente.

<x-mail::button :url="route('coins.index')">
Renovar con monedas
</x-mail::button>
</x-mail::message>
