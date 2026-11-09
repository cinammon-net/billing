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
}
