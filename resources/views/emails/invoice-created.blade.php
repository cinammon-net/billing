<x-mail::message>
# Tu pedido está creado

Hola, {{ $user->name }}. Hemos registrado tu pedido **{{ $what }}**.

<x-mail::table>
| Factura | Importe | Vence |
|:--|:--|:--|
| {{ $invoice->number }} | {{ \App\Mail\BillingMail::money($invoice->amount) }} | {{ $invoice->due_at?->format('d/m/Y') }} |
</x-mail::table>

Cuando se confirme el pago, {{ $isRank ? 'el rango se activará en el panel' : 'tu servidor se creará en el panel' }} automáticamente.

<x-mail::button :url="route('checkout.show', $invoice)">
Pagar la factura
</x-mail::button>

<span class="muted">Si no pagas antes del vencimiento, el pedido se queda pendiente y no se cobra nada.</span>
</x-mail::message>
