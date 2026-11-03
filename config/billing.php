<?php

return [
    // URL pública del panel de Cinammon al que se liga billing
    'panel_url' => env('PANEL_URL', 'http://localhost:8000'),

    // Token compartido con el panel para aprovisionar servidores
    'panel_token' => env('PANEL_API_TOKEN'),

    // Correos (separados por comas) con acceso al administrador de precios
    'admin_emails' => array_values(array_filter(array_map(
        fn ($email) => strtolower(trim($email)),
        explode(',', (string) env('BILLING_ADMIN_EMAILS', ''))
    ))),
];
