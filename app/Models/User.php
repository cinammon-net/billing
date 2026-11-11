<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'company',
        'tax_id',
        'address',
        'city',
        'postal_code',
        'country',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected $appends = ['is_admin'];

    public function orders(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Order::class);
    }

    protected static function booted(): void
    {
        // Invitaciones: si llegó con un enlace /r/CODIGO, se apunta quién le invitó.
        static::creating(function (User $user) {
            if ($user->referred_by || app()->runningInConsole()) {
                return;
            }
            $code = (string) request()->cookie('cin_ref');
            if ($code !== '' && ($inviter = static::where('referral_code', strtoupper($code))->first())) {
                $user->referred_by = $inviter->id;
            }
        });
    }

    public function getIsAdminAttribute(): bool
    {
        return in_array(strtolower((string) $this->email), config('billing.admin_emails', []), true);
    }

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'last_checkin' => 'date',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }
}
