<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('advent_claims', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            // Clave de la edición (p. ej. "2026-christmas" o "2026-special") para que cada año/evento sea independiente
            $table->string('edition', 40);
            $table->unsignedTinyInteger('day'); // 1..24
            $table->unsignedInteger('coins');
            $table->unsignedInteger('bonus_coins')->default(0);
            $table->timestamps();

            $table->unique(['user_id', 'edition', 'day']);
            $table->index(['user_id', 'edition']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('advent_claims');
    }
};
