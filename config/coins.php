<?php

return [
    // Tope de monedas que se pueden ganar al día (juegos + anuncios).
    'daily_cap' => (int) env('COINS_DAILY_CAP', 150),

    // Minijuegos: duración mínima real (segundos) para que la partida cuente, y monedas máximas por partida.
    'games' => [
        'reflex' => ['label' => 'Caza de núcleos', 'min_seconds' => 28, 'max_seconds' => 120, 'max_score' => 90, 'max_coins' => 15],
        'memory' => ['label' => 'Memoria', 'min_seconds' => 15, 'max_seconds' => 600, 'max_score' => 8, 'max_coins' => 12],
    ],
    // Partidas con recompensa por hora (anti-farmeo).
    'games_per_hour' => (int) env('COINS_GAMES_PER_HOUR', 20),

    // Anuncios con recompensa: desactivados hasta conectar una red publicitaria.
    'ads' => [
        'enabled' => (bool) env('ADS_ENABLED', false),
        'provider' => env('ADS_PROVIDER', 'gpt'), // gpt = Google Ad Manager (anuncios con recompensa)
        'gpt_unit' => env('ADS_GPT_REWARDED_UNIT'), // p. ej. /1234567/cinammon_rewarded
        'reward' => (int) env('ADS_REWARD', 10),
        'per_day' => (int) env('ADS_PER_DAY', 5),
        'min_seconds' => 15,
    ],

    // Servidores gratuitos: uno activo por usuario.
    'free_servers_per_user' => 1,
];
