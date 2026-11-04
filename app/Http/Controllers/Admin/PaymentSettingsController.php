<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaymentSetting;
use App\Services\Payments\PaymentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/** Admin → Métodos de pago: activar métodos y guardar sus datos (cifrados). */
class PaymentSettingsController extends Controller
{
    public function index(): Response
    {
        $methods = [];
        $fieldsOut = [];
        foreach (PaymentService::FIELDS as $method => $fields) {
            $s = PaymentService::settings($method);
            $values = [];
            foreach ($fields as $key => [$label, $secret]) {
                // Los secretos nunca vuelven al navegador: solo si están puestos.
                $values[$key] = $secret ? null : ($s[$key] ?? null);
                $fieldsOut[$method][] = ['key' => $key, 'label' => $label, 'secret' => $secret, 'required' => $fields[$key][2], 'set' => filled($s[$key] ?? null), 'boolean' => $key === 'sandbox'];
            }
            $methods[] = [
                'key' => $method,
                'enabled' => (bool) ($s['enabled'] ?? false),
                'complete' => PaymentService::complete($method, $s),
                'values' => $values,
                'fields' => $fieldsOut[$method],
            ];
        }

        return Inertia::render('Admin/PaymentSettings', [
            'methods' => $methods,
            'webhookUrl' => route('webhooks.nowpayments'),
            'paypalReturnUrl' => route('payments.paypal.return'),
        ]);
    }

    public function update(Request $request, string $method): RedirectResponse
    {
        abort_unless(isset(PaymentService::FIELDS[$method]), 404);
        $fields = PaymentService::FIELDS[$method];

        $rules = ['enabled' => ['boolean']];
        foreach ($fields as $key => [, $secret]) {
            $rules["values.{$key}"] = $key === 'sandbox' ? ['nullable', 'boolean'] : ['nullable', 'string', 'max:500'];
        }
        if ($method === 'transfer') {
            $rules['values.iban'][] = 'regex:/^[A-Z]{2}[0-9]{2}[A-Z0-9 ]{10,40}$/i';
        }
        if ($method === 'bizum') {
            $rules['values.phone'][] = 'regex:/^\+?[0-9 ]{9,15}$/';
        }
        $data = $request->validate($rules, [
            'values.iban.regex' => 'El IBAN no tiene un formato válido (ej.: ES12 3456 7890 1234 5678 9012).',
            'values.phone.regex' => 'El teléfono no es válido.',
        ]);

        $current = PaymentService::settings($method);
        $values = [];
        foreach ($fields as $key => [, $secret]) {
            $new = $data['values'][$key] ?? null;
            if ($key === 'sandbox') {
                $values[$key] = (bool) $new;
            } elseif ($secret && blank($new)) {
                $values[$key] = $current[$key] ?? null; // vacío = conservar el secreto guardado
            } else {
                $values[$key] = is_string($new) ? trim($new) : $new;
            }
        }
        if ($method === 'transfer' && $values['iban']) {
            $values['iban'] = strtoupper(trim(chunk_split(preg_replace('/\s+/', '', $values['iban']), 4, ' ')));
        }

        $enabled = (bool) ($data['enabled'] ?? false);
        if ($enabled && !PaymentService::complete($method, $values)) {
            return back()->withErrors(['values' => 'Rellena los campos obligatorios antes de activar este método.']);
        }

        PaymentSetting::updateOrCreate(['method' => $method], ['enabled' => $enabled, 'data' => $values]);

        return back()->with('success', 'Método de pago guardado.');
    }
}
