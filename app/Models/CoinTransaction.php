<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CoinTransaction extends Model
{
    protected $fillable = ['user_id', 'amount', 'reason', 'detail'];

    protected $casts = ['amount' => 'integer'];
}
