<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Services\PanelService;
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
        'roleplay' => [
            'title' => 'Roleplay y GTA',
            'tagline' => 'FiveM, RedM, alt:V, Multi Theft Auto y SA-MP para tu comunidad de rol.',
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

    /**
     * Eggs del panel que se muestran (con su icono) en cada categoría de la tienda:
     * una lista de nombres en orden y/o la categoría del panel de la que completar.
     */
    private const CATEGORY_EGGS = [
        'minecraft' => ['names' => ['Paper', 'Purpur', 'Fabric', 'Forge Minecraft', 'NeoForge', 'Velocity', 'Vanilla Minecraft', 'Vanilla Bedrock', 'Spigot', 'Quilt', 'Mohist', 'Feed the Beast'], 'panel' => 'minecraft'],
        'survival' => ['names' => ['Rust Autowipe', 'Ark: Survival Evolved', 'ARK: Survival Ascended', 'Palworld', '7 Days To Die', 'Conan Exiles', 'DayZ (Experimental)', 'Project Zomboid', 'Enshrouded', 'V Rising', 'Sons Of The Forest', 'The Forest']],
        'shooters' => ['names' => ['Counter-Strike 2', 'Counter-Strike: Source', 'Team Fortress 2 Classic', 'Insurgency: Sandstorm', 'Left 4 Dead 2', 'Killing Floor 2', 'Squad', 'Arma 3']],
        'sandbox' => ['names' => ['Factorio', 'Mindustry', 'Core Keeper', "Don't Starve Together", 'Eco', 'Satisfactory', 'Space Engineers', 'tshock']],
        'simulation' => ['names' => ['Assetto Corsa', 'Euro Truck Simulator 2 Dedicated server', 'American Truck Simulator Dedicated Server', 'Stormworks: Build and Rescue']],
        'roleplay' => ['names' => ['FiveM', 'RedM', 'alt:V', 'Multi Theft Auto', 'SA-MP']],
        'voice' => ['panel' => 'voice'],
        'bots' => ['panel' => 'bots'],
        'web' => ['panel' => 'web'],
        'databases' => ['panel' => 'database'],
    ];

    public function __construct(private readonly PanelService $panel)
    {
    }

    public function index(): Response
    {
        $catalog = $this->panel->eggCatalog();

        return Inertia::render('Store/Index', [
            'categories' => collect(self::CATEGORIES)->map(function ($meta, $key) use ($catalog) {
                $cheapest = Plan::where('category', $key)->orderBy('price')->first();

                return [
                    'key' => $key,
                    ...$meta,
                    'from' => $cheapest?->price,
                    'plans_count' => Plan::where('category', $key)->count(),
                    'eggs' => $this->eggsFor($key, $catalog),
                ];
            })->filter(fn ($category) => $category['from'] !== null)->values(),
        ]);
    }

    public function category(string $category): Response
    {
        abort_unless(array_key_exists($category, self::CATEGORIES), 404);

        $catalog = $this->panel->eggCatalog();
        $icons = collect($catalog)->filter(fn ($egg) => !empty($egg['icon']))
            ->mapWithKeys(fn ($egg) => [mb_strtolower($egg['name']) => $egg['icon']]);

        $plans = Plan::where('category', $category)->orderBy('sort')->get()
            ->each(fn (Plan $plan) => $plan->setAttribute('icon', $plan->egg ? $icons->get(mb_strtolower($plan->egg)) : null));

        return Inertia::render('Store/Category', [
            'category' => [
                'key' => $category,
                ...self::CATEGORIES[$category],
                // Con planes por juego cada tarjeta ya lleva su icono: no se repite la fila.
                'eggs' => $plans->whereNotNull('egg')->isEmpty() ? $this->eggsFor($category, $catalog, 24) : [],
            ],
            'plans' => $plans,
        ]);
    }

    /**
     * Eggs con icono de una categoría de la tienda, sin repetir icono.
     *
     * @return array<int, array{name: string, icon: string}>
     */
    private function eggsFor(string $key, array $catalog, int $limit = 8): array
    {
        $rule = self::CATEGORY_EGGS[$key] ?? [];
        $withIcon = collect($catalog)->filter(fn ($egg) => !empty($egg['icon']) && !empty($egg['name']));
        $byName = $withIcon->keyBy(fn ($egg) => mb_strtolower($egg['name']));

        $picked = collect($rule['names'] ?? [])
            ->map(fn ($name) => $byName->get(mb_strtolower($name)))
            ->filter();

        if (!empty($rule['panel'])) {
            $picked = $picked->concat($withIcon->where('category', $rule['panel']));
        }

        return $picked
            ->unique('icon')
            ->take($limit)
            ->map(fn ($egg) => ['name' => $egg['name'], 'icon' => $egg['icon']])
            ->values()
            ->all();
    }
}
