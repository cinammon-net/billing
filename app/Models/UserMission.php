<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** Misión ya cobrada por un usuario (cada misión se cobra una sola vez). */
class UserMission extends Model
{
    protected $fillable = ['user_id', 'mission'];
}
