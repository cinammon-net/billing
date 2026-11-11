<?php

namespace App\Services;

use App\Models\Promotion;
use App\Support\Seasons;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

/**
 * Ambientación + promoción vigente para un país. Lo usan la tienda, el checkout,
 * la API pública /api/season (que consume el panel) y el script de decoración.
 */
class SeasonService
{
    public function countryFor(Request $request): string
    {
        return Seasons::countryFrom($request->header('CF-IPCountry'));
    }

    /**
     * @return array{country: string, season: ?array, holiday: ?array, discount: int, promotion: ?string, store_url: string}
     */
    public function context(string $country, ?CarbonImmutable $date = null): array
    {
        $date ??= CarbonImmutable::now(config('billing.season_timezone', 'Europe/Madrid'));
        $seasonKey = Seasons::season($country, $date);
        $holidays = Seasons::activeHolidays($country, $date);
        $promotions = $this->promotions();

        // Festivo a mostrar: el de más prioridad. Descuento: el mayor de los festivos activos.
        $holiday = $holidays[0] ?? null;
        $discount = 0;
        $promotion = null;
        foreach ($holidays as $h) {
            // Si aún no existe la fila de new_years_eve, hereda el descuento de new_year
            $p = $promotions[$h['promotion']] ?? ($h['promotion'] === 'new_years_eve' ? ($promotions['new_year'] ?? null) : null);
            if ($p && $p['enabled'] && $p['percent'] > $discount) {
                $discount = $p['percent'];
                $promotion = $h['name'];
            }
        }

        return [
            'country' => $country,
            'season' => $seasonKey ? ['key' => $seasonKey, ...Seasons::SEASONS[$seasonKey]] : null,
            'holiday' => $holiday ? collect($holiday)->only(['key', 'name', 'emoji', 'theme', 'ends'])->all() : null,
            'discount' => $discount,
            'promotion' => $promotion,
            'store_url' => config('billing.store_host')
                ? 'https://'.config('billing.store_host').'/store'
                : rtrim((string) config('app.url'), '/').'/store',
        ];
    }

    public function forRequest(Request $request): array
    {
        return $this->context($this->countryFor($request));
    }

    /** Descuento final de un plan: promoción del festivo y, en servidores, el VIP (se aplica el mayor, no se suman). */
    public static function bestDiscount(int $promo, int $vip, bool $isRank): int
    {
        return $isRank ? $promo : max($promo, $vip);
    }

    /** @return array<string, array{percent: int, enabled: bool}> */
    private function promotions(): array
    {
        return Cache::remember('billing:promotions', 300, fn () => Promotion::all()
            ->mapWithKeys(fn (Promotion $p) => [$p->key => ['percent' => $p->percent, 'enabled' => $p->enabled]])
            ->all());
    }

    public static function flush(): void
    {
        Cache::forget('billing:promotions');
    }
}
