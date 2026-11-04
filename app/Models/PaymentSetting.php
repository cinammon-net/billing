<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentSetting extends Model
{
    protected $fillable = ['method', 'enabled', 'data'];

    // Todo el contenido (IBAN, claves de API…) se guarda cifrado con APP_KEY.
    protected $casts = ['enabled' => 'boolean', 'data' => 'encrypted:array'];
}
