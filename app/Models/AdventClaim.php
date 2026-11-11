<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdventClaim extends Model
{
    protected $fillable = ['user_id', 'edition', 'day', 'coins', 'bonus_coins'];

    protected $casts = [
        'day' => 'integer',
        'coins' => 'integer',
        'bonus_coins' => 'integer',
    ];
}
