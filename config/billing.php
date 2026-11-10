<?php

return [
    // URL pública del panel de Cinammon al que se liga billing
    'panel_url' => env('PANEL_URL', 'http://localhost:8000'),

    // Token compartido con el panel para aprovisionar servidores
    'panel_token' => env('PANEL_API_TOKEN'),

    // Certificado del panel que se acepta al llamarlo desde este mismo servidor
    // (en el VPS panel.cinammon.net resuelve a 127.0.0.1, que sirve un certificado
    // de origen autofirmado). Vacío = verificación TLS normal.
    'panel_ca_bundle' => env('PANEL_CA_BUNDLE'),

    // Dominio dedicado de la tienda (vacío = la tienda vive en /store del dominio principal).
    // Con él, store.cinammon.net sirve solo la tienda y billing.cinammon.net el área de clientes.
    'store_host' => env('BILLING_STORE_HOST', ''),

    // Correos (separados por comas) con acceso al administrador de precios
    'admin_emails' => array_values(array_filter(array_map(
        fn ($email) => strtolower(trim($email)),
        explode(',', (string) env('BILLING_ADMIN_EMAILS', ''))
    ))),
];
