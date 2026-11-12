<x-mail::message kicker="Pago confirmado">
# Pago recibido

Hola, {{ $user->name }}. Hemos recibido el pago de la factura **{{ $invoice->number }}**.

<x-mail::table>
| Concepto | Importe | Método |
|:--|:--|:--|
| {{ $what }} | {{ \App\Mail\BillingMail::money($invoice->amount) }} | {{ $method }} |
</x-mail::table>

{{ $result }}

@if ($order->renews_at)
Próxima renovación: **{{ $order->renews_at->format('d/m/Y') }}**.
@endif

<x-mail::button :url="$panelUrl">
Ir al panel
</x-mail::button>

Gracias por confiar en Cinammon Network.
</x-mail::message>
