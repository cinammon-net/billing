<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Services\Payments\PaymentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** Confirmación de pagos manuales (transferencia y Bizum) y últimos pagos recibidos. */
class PaymentController extends Controller
{
    public function index(): Response
    {
        $map = fn (Invoice $i) => [
            'id' => $i->id,
            'number' => $i->number,
            'amount' => $i->amount,
            'status' => $i->status,
            'method' => $i->payment_method,
            'payer_note' => $i->payer_note,
            'admin_note' => $i->admin_note,
            'reference' => $i->payment_reference,
            'concept' => $i->order?->server_name,
            'user' => $i->user?->only(['name', 'email']),
            'updated_at' => $i->updated_at?->toIso8601String(),
            'paid_at' => $i->paid_at?->toIso8601String(),
        ];

        return Inertia::render('Admin/Payments', [
            'awaiting' => Invoice::with(['user:id,name,email', 'order:id,server_name'])->where('status', 'awaiting')->oldest('updated_at')->get()->map($map),
            'recent' => Invoice::with(['user:id,name,email', 'order:id,server_name'])->where('status', 'paid')->latest('paid_at')->limit(30)->get()->map($map),
            'methods' => PaymentService::methods(),
        ]);
    }

    public function confirm(Invoice $invoice, PaymentService $payments): RedirectResponse
    {
        abort_unless(in_array($invoice->status, ['awaiting', 'pending'], true), 409);

        return back()->with('success', "{$invoice->number}: " . $payments->markPaid($invoice, $invoice->payment_method ?: 'transfer', 'confirmado por admin'));
    }

    public function reject(Request $request, Invoice $invoice): RedirectResponse
    {
        $data = $request->validate(['admin_note' => ['required', 'string', 'max:255']]);
        abort_unless($invoice->status === 'awaiting', 409);
        $invoice->update(['status' => 'pending', 'admin_note' => $data['admin_note']]);

        \App\Mail\BillingMail::deliver($invoice->user?->email, "Pago no confirmado · {$invoice->number}", 'payment-rejected', [
            'user' => $invoice->user,
            'invoice' => $invoice,
            'reason' => $data['admin_note'],
        ], 'rejected-'.$invoice->number.'-'.now()->timestamp);

        return back()->with('success', "{$invoice->number} devuelta a pendiente: el cliente verá el motivo.");
    }
}
