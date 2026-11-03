<?php

return [
    // URL pública del panel de Cinammon al que se liga billing
    'panel_url' => env('PANEL_URL', 'http://localhost:8000'),

    // Token compartido con el panel para aprovisionar servidores
    'panel_token' => env('PANEL_API_TOKEN'),

    // Dominio dedicado de la tienda (vacío = la tienda vive en /store del dominio principal).
    // Con él, store.cinammon.net sirve solo la tienda y billing.cinammon.net el área de clientes.
    'store_host' => env('BILLING_STORE_HOST', ''),

    // Correos (separados por comas) con acceso al administrador de precios
    'admin_emails' => array_values(array_filter(array_map(
        fn ($email) => strtolower(trim($email)),
        explode(',', (string) env('BILLING_ADMIN_EMAILS', ''))
    ))),
];
