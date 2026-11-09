<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GameSession extends Model
{
    protected $fillable = ['user_id', 'game', 'token', 'started_at', 'finished_at', 'score', 'coins'];

    protected $casts = ['started_at' => 'datetime', 'finished_at' => 'datetime'];
}
