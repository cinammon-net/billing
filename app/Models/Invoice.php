<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Invoice extends Model
{
    protected $fillable = [
        'user_id', 'order_id', 'number', 'amount', 'status', 'due_at',
        'payment_method', 'payment_reference', 'payer_note', 'admin_note', 'paid_at',
    ];

    protected $casts = [
        'amount' => 'float',
        'due_at' => 'datetime',
        'paid_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
