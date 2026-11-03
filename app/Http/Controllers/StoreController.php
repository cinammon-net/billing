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
        'survival' => [
            'title' => 'Supervivencia',
            'tagline' => 'Rust, ARK, Palworld, 7 Days to Die, Conan Exiles, DayZ, Project Zomboid y Enshrouded.',
        ],
        'shooters' => [
            'title' => 'Shooters / FPS',
            'tagline' => 'Counter-Strike 2, CS:GO, Team Fortress 2, Insurgency: Sandstorm, Left 4 Dead 2 y Killing Floor 2.',
        ],
        'sandbox' => [
            'title' => 'Sandbox y Creativos',
            'tagline' => "Garry's Mod, Factorio, Mindustry, Core Keeper, Don't Starve Together y Eco.",
        ],
        'simulation' => [
            'title' => 'Simuladores',
            'tagline' => 'Assetto Corsa, Euro Truck Simulator 2 y American Truck Simulator.',
        ],
        'voice' => [
            'title' => 'Servidores de Voz',
            'tagline' => 'TeamSpeak 3, TeaSpeak y Lavalink para tu comunidad.',
        ],
        'bots' => [
            'title' => 'Hosting de Bots',
            'tagline' => 'Bots de Discord, Twitch y TeamSpeak siempre online.',
        ],
        'web' => [
            'title' => 'Hosting Web',
            'tagline' => 'Alojamiento para tu web, blog o tienda online con PHP y bases de datos.',
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
            })->filter(fn ($category) => $category['from'] !== null)->values(),
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
