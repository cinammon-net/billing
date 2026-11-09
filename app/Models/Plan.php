<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends Model
{
    /**
     * Períodos de facturación. El mensual vive en `price`; el resto en `cycle_prices`.
     * `factor` es el multiplicador sobre el precio mensual usado al autocalcular.
     */
    public const CYCLES = [
        'hourly' => ['label' => 'Hora', 'unit' => 'hora', 'factor' => 1 / 720, 'decimals' => 4, 'add' => ['addHours', 1]],
        'daily' => ['label' => 'Día', 'unit' => 'día', 'factor' => 1 / 30, 'decimals' => 2, 'add' => ['addDays', 1]],
        'weekly' => ['label' => 'Semana', 'unit' => 'semana', 'factor' => 0.25, 'decimals' => 2, 'add' => ['addWeeks', 1]],
        'monthly' => ['label' => 'Mes', 'unit' => 'mes', 'factor' => 1, 'decimals' => 2, 'add' => ['addMonthsNoOverflow', 1]],
        'quarterly' => ['label' => 'Trimestre', 'unit' => 'trimestre', 'factor' => 2.85, 'decimals' => 2, 'add' => ['addMonthsNoOverflow', 3]],
        'semiannual' => ['label' => 'Semestre', 'unit' => 'semestre', 'factor' => 5.4, 'decimals' => 2, 'add' => ['addMonthsNoOverflow', 6]],
        'yearly' => ['label' => 'Año', 'unit' => 'año', 'factor' => 9.6, 'decimals' => 2, 'add' => ['addYearsNoOverflow', 1]],
    ];

    protected $fillable = [
        'category', 'egg', 'role', 'name', 'slug', 'ram_mb', 'cpu_pct', 'storage_gb',
        'price', 'coin_cost', 'coin_renew_cost', 'coin_days', 'cycle_prices', 'popular', 'features', 'perks', 'addons', 'sort',
    ];

    protected $casts = [
        'features' => 'array',
        'addons' => 'array',
        'perks' => 'array',
        'cycle_prices' => 'array',
        'popular' => 'boolean',
        'price' => 'float',
    ];

    protected $appends = ['prices'];

    /** Lista ordenada de períodos para el frontend. */
    public static function cycleMeta(): array
    {
        return collect(self::CYCLES)->map(fn ($cycle, $key) => [
            'key' => $key,
            'label' => $cycle['label'],
            'unit' => $cycle['unit'],
            'factor' => $cycle['factor'],
            'decimals' => $cycle['decimals'],
        ])->values()->all();
    }

    public static function defaultPrice(float $monthly, string $cycle): float
    {
        $decimals = self::CYCLES[$cycle]['decimals'];

        return max(round($monthly * self::CYCLES[$cycle]['factor'], $decimals), 10 ** -$decimals);
    }

    /** Precios por período calculados a partir del mensual (sin incluir el mensual). */
    public static function defaultCyclePrices(float $monthly): array
    {
        return collect(self::CYCLES)
            ->except('monthly')
            ->map(fn ($cycle, $key) => self::defaultPrice($monthly, $key))
            ->all();
    }

    public function priceFor(string $cycle): ?float
    {
        if ($cycle === 'monthly') {
            return $this->price;
        }

        $price = ($this->cycle_prices ?? [])[$cycle] ?? null;

        return $price === null ? null : (float) $price;
    }

    /** Precios disponibles por período (solo los que el plan ofrece). */
    public function getPricesAttribute(): array
    {
        $prices = [];
        foreach (array_keys(self::CYCLES) as $cycle) {
            $price = $this->priceFor($cycle);
            if ($price !== null) {
                $prices[$cycle] = $price;
            }
        }

        return $prices;
    }

    /** ¿Es un rango VIP (concede un rol en el panel) en vez de un servidor? */
    public function isRank(): bool
    {
        return $this->role !== null;
    }

    /**
     * Precios por período de un rango: sin «por hora» y con los períodos cortos más
     * caros en proporción (un rango por un día no debe salir casi gratis).
     */
    public static function rankCyclePrices(float $monthly): array
    {
        $factors = ['daily' => 0.12, 'weekly' => 0.4, 'quarterly' => 2.85, 'semiannual' => 5.4, 'yearly' => 9.6];

        return array_map(fn ($f) => round($monthly * $f, 2), $factors);
    }

    /** Mejor descuento VIP (%) del usuario por sus rangos activos. */
    public static function vipDiscountFor(?\App\Models\User $user): int
    {
        if (!$user) {
            return 0;
        }

        return (int) Order::query()
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->where(fn ($q) => $q->whereNull('renews_at')->orWhere('renews_at', '>', now()))
            ->whereHas('plan', fn ($q) => $q->whereNotNull('role'))
            ->with('plan:id,perks')
            ->get()
            ->max(fn (Order $o) => (int) ($o->plan->perks['discount'] ?? 0));
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
