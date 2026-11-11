<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'user_id', 'plan_id', 'server_name', 'status', 'price', 'billing_cycle', 'renews_at',
        'panel_server_id', 'panel_server_uuid', 'server_address',
        'is_free', 'category', 'egg', 'ram_mb', 'cpu_pct', 'storage_gb', 'coin_daily',
    ];

    protected $casts = [
        'price' => 'float',
        'renews_at' => 'datetime',
        'is_free' => 'boolean',
    ];

    /** Recursos del servidor: los del pedido (gratuitos) o los del plan. */
    public function resources(): array
    {
        return [
            'category' => $this->category ?? $this->plan?->category,
            'egg' => $this->egg ?? $this->plan?->egg,
            'ram_mb' => (int) ($this->ram_mb ?? $this->plan?->ram_mb),
            'cpu_pct' => (int) ($this->cpu_pct ?? $this->plan?->cpu_pct),
            'storage_gb' => (int) ($this->storage_gb ?? $this->plan?->storage_gb),
        ];
    }

    /** Fecha de la próxima renovación según el período contratado. */
    public function nextRenewal(): \Illuminate\Support\Carbon
    {
        [$method, $amount] = Plan::CYCLES[$this->billing_cycle ?? 'monthly']['add'] ?? Plan::CYCLES['monthly']['add'];

        return now()->{$method}($amount);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }
}
