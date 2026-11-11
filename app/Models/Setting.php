<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

/** Ajustes clave → valor (JSON) editables desde la administración. */
class Setting extends Model
{
    protected $primaryKey = 'key';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = ['key', 'value'];
    protected $casts = ['value' => 'array'];

    public static function get(string $key, array $default = []): array
    {
        return Cache::remember("setting:{$key}", 300, function () use ($key, $default) {
            try {
                return static::find($key)?->value ?? $default;
            } catch (\Throwable) {
                return $default;
            }
        });
    }

    public static function put(string $key, array $value): void
    {
        static::updateOrCreate(['key' => $key], ['value' => $value]);
        Cache::forget("setting:{$key}");
    }
}
