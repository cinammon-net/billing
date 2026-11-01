<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use Inertia\Inertia;
use Inertia\Response;

class StoreController extends Controller
{
    public const CATEGORIES = [
        'minecraft' => [
            'title' => 'Minecraft Hosting',
            'tagline' => 'Java y Bedrock. Paper, Fabric, Forge, Purpur y más.',
        ],
        'games' => [
            'title' => 'Servidores de Juegos',
            'tagline' => 'Palworld, Rust, CS2, ARK, Valheim y +50 juegos más.',
        ],
        'bots' => [
            'title' => 'Hosting de Bots',
            'tagline' => 'Bots de Discord, Twitch y TeamSpeak siempre online.',
        ],
        'databases' => [
            'title' => 'Bases de Datos',
            'tagline' => 'Redis, MariaDB, PostgreSQL y MongoDB gestionados.',
        ],
    ];

    public function index(): Response
    {
        return Inertia::render('Store/Index', [
            'categories' => collect(self::CATEGORIES)->map(function ($meta, $key) {
                $cheapest = Plan::where('category', $key)->orderBy('price')->first();

                return [
                    'key' => $key,
                    ...$meta,
                    'from' => $cheapest?->price,
                ];
            })->values(),
        ]);
    }

    public function category(string $category): Response
    {
        abort_unless(array_key_exists($category, self::CATEGORIES), 404);

        return Inertia::render('Store/Category', [
            'category' => ['key' => $category, ...self::CATEGORIES[$category]],
            'plans' => Plan::where('category', $category)->orderBy('sort')->get(),
        ]);
    }
}
