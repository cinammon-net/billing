<?php

/*
| Métodos de pago. Cada uno solo aparece en la tienda si está configurado en el .env.
*/
return [
    // Transferencia bancaria (manual: el admin confirma la recepción)
    'transfer' => [
        'iban' => env('PAY_TRANSFER_IBAN'),
        'holder' => env('PAY_TRANSFER_HOLDER'),
        'bank' => env('PAY_TRANSFER_BANK'),
        'bic' => env('PAY_TRANSFER_BIC'),
    ],

    // Bizum (manual: el admin confirma la recepción)
    'bizum' => [
        'phone' => env('PAY_BIZUM_PHONE'),
        'holder' => env('PAY_BIZUM_HOLDER'),
    ],

    // Cripto con NOWPayments (automático por IPN)
    'nowpayments' => [
        'api_key' => env('NOWPAYMENTS_API_KEY'),
        'ipn_secret' => env('NOWPAYMENTS_IPN_SECRET'),
        'sandbox' => (bool) env('NOWPAYMENTS_SANDBOX', false),
    ],

    // PayPal (automático: se captura al volver del checkout)
    'paypal' => [
        'client_id' => env('PAYPAL_CLIENT_ID'),
        'secret' => env('PAYPAL_SECRET'),
        'sandbox' => (bool) env('PAYPAL_SANDBOX', false),
    ],

    'currency' => env('PAY_CURRENCY', 'EUR'),
];
