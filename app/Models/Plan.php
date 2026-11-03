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
        'category', 'name', 'slug', 'ram_mb', 'cpu_pct', 'storage_gb',
        'price', 'cycle_prices', 'popular', 'features', 'sort',
    ];

    protected $casts = [
        'features' => 'array',
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

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
