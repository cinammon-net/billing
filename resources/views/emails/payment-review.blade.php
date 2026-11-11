<x-mail::message>
# Pago pendiente de revisar

**{{ $user->name }}** ({{ $user->email }}) dice haber pagado la factura **{{ $invoice->number }}** por {{ $method }}.

<x-mail::table>
| Importe | Concepto |
|:--|:--|
| {{ \App\Mail\BillingMail::money($invoice->amount) }} | {{ $what }} |
</x-mail::table>

<x-mail::panel>
**Nota del cliente:** {{ $invoice->payer_note }}
</x-mail::panel>

<x-mail::button :url="route('admin.payments.index')">
Revisar pagos
</x-mail::button>
</x-mail::message>
