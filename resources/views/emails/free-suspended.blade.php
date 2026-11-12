<x-mail::message kicker="Servidor gratis">
# Tu servidor gratuito se ha suspendido

Hola, {{ $user->name }}. El servidor gratuito **{{ $order->server_name }}** ha caducado sin renovarse y se ha suspendido.

Puedes conseguir otro servidor gratuito con monedas cuando quieras, o pasarte a un plan de pago para no depender de las renovaciones.

<x-mail::button :url="route('coins.index')">
Ir a monedas
</x-mail::button>
</x-mail::message>
