<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Promotion extends Model
{
    protected $fillable = ['key', 'name', 'percent', 'enabled'];

    protected $casts = ['percent' => 'integer', 'enabled' => 'boolean'];
}
