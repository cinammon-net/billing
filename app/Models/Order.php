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
    ];

    protected $casts = [
        'price' => 'float',
        'renews_at' => 'datetime',
    ];

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
