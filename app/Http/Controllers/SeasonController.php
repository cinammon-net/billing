<?php

namespace App\Http\Controllers;

use App\Services\SeasonService;
use App\Support\Seasons;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SeasonController extends Controller
{
    /** API pública: ambientación y promoción vigentes para un país (la usa el panel). */
    public function show(Request $request, SeasonService $seasons): JsonResponse
    {
        $country = $request->filled('country')
            ? Seasons::countryFrom($request->query('country'))
            : $seasons->countryFor($request);

        // Datos públicos: el panel y la portada la piden desde el navegador (otro dominio).
        return response()->json($seasons->context($country))
            ->header('Cache-Control', 'private, max-age=300')
            ->header('Access-Control-Allow-Origin', '*')
            ->header('Vary', 'CF-IPCountry');
    }

    /** Subdominios con logo propio (public/season/fav/{sitio}.png y {sitio}-{tema}.png). */
    private const FAVICON_SITES = ['net', 'panel', 'store', 'billing', 'demo', 'nodo', 'wings', 'admin', 'mail', 'database'];

    /** Temas con colores propios (los mismos que PALETTES en season.js). */
    private const PALETTES = ['christmas', 'new_years_eve', 'new_year', 'reyes', 'valentine', 'carnival', 'easter', 'halloween', 'muertos', 'thanksgiving',
        'black_friday', 'gamer_day', 'star_wars', 'book_day', 'san_juan', 'winter', 'spring', 'summer', 'autumn'];

    /**
     * Favicon del subdominio con los colores de la temporada o festivo del visitante.
     * Safari no hace caso de los favicons que cambia JavaScript, así que se sirve ya coloreado.
     */
    public function favicon(Request $request, SeasonService $seasons, string $site)
    {
        abort_unless(in_array($site, self::FAVICON_SITES, true), 404);
        $context = $seasons->forRequest($request);
        // Igual que season.js: si hay festivo manda el festivo (y si no tiene colores, el logo original).
        $key = $context['holiday']
            ? (in_array($context['holiday']['key'] ?? '', self::PALETTES, true) ? $context['holiday']['key'] : null)
            : ($context['season']['key'] ?? null);
        if ($key === 'new_years_eve') {
            $key = 'new_year';
        }
        $dir = public_path('season/fav/');
        $file = $key && is_file($dir.$site.'-'.$key.'.png') ? $dir.$site.'-'.$key.'.png' : $dir.$site.'.png';

        $response = response()->file($file, [
            'Content-Type' => 'image/png',
            'Vary' => 'CF-IPCountry',
            'Access-Control-Allow-Origin' => '*',
            'Cross-Origin-Resource-Policy' => 'cross-origin',
        ]);
        // BinaryFileResponse pisa Cache-Control con public si se pasa en el array; lo fijamos aquí para que Cloudflare no mezcle países ni temporadas.
        $response->headers->set('Cache-Control', 'private, no-cache, max-age=0, must-revalidate');

        return $response;
    }
}
