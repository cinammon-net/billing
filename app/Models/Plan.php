<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends Model
{
    protected $fillable = [
        'category', 'name', 'slug', 'ram_mb', 'cpu_pct', 'storage_gb',
        'price', 'popular', 'features', 'sort',
    ];

    protected $casts = [
        'features' => 'array',
        'popular' => 'boolean',
        'price' => 'float',
    ];

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
