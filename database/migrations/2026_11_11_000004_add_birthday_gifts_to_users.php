<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'birthday_gift_year')) {
                $table->unsignedSmallInteger('birthday_gift_year')->nullable();
                $table->json('birthday_gifts')->nullable();
                $table->unsignedTinyInteger('birthday_discount_percent')->nullable();
                $table->timestamp('birthday_discount_until')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['birthday_gift_year', 'birthday_gifts', 'birthday_discount_percent', 'birthday_discount_until']);
        });
    }
};
