<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    // Correo saliente: se manda al Worker cinammon-mail (mail/), que envía con Cloudflare Email Sending.
    'cloudflare_mail' => [
        'url' => env('CLOUDFLARE_MAIL_URL'), // https://cinammon-mail.<subdominio>.workers.dev/relay/send (no *.cinammon.net: en el VPS apunta a 127.0.0.1)
        'secret' => env('CLOUDFLARE_MAIL_SECRET'),
        // Buzón del equipo: recibe los avisos de tickets y pagos, y es el "Responder a" de los correos.
        'support' => env('MAIL_SUPPORT_ADDRESS', 'soporte@cinammon.net'),
    ],
];
