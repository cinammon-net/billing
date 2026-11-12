<x-mail::message kicker="Pago">
# No hemos podido confirmar tu pago

Hola, {{ $user->name }}. Hemos revisado el aviso de pago de la factura **{{ $invoice->number }}** ({{ \App\Mail\BillingMail::money($invoice->amount) }}) y no hemos podido confirmarlo.

<x-mail::panel>
**Motivo:** {{ $reason }}
</x-mail::panel>

La factura vuelve a estar pendiente. Puedes revisarla y avisarnos de nuevo cuando esté resuelto.

<x-mail::button :url="route('checkout.show', $invoice)">
Ver la factura
</x-mail::button>
</x-mail::message>
