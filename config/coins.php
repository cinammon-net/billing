<?php

// Las cantidades (premios, topes, precios en monedas…) se editan en /admin/free (App\Support\FreeTier).
return [
    // Anuncios con recompensa (Google Ad Manager). Se activan al poner la unidad en el .env.
    'ads' => [
        'enabled' => (bool) env('ADS_ENABLED', false),
        'provider' => env('ADS_PROVIDER', 'gpt'),
        'gpt_unit' => env('ADS_GPT_REWARDED_UNIT'), // p. ej. /1234567/cinammon_rewarded
        'min_seconds' => 15,
    ],
];
