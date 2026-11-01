<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('category')->index();
            $table->string('name');
            $table->string('slug')->unique();
            $table->unsignedInteger('ram_mb');
            $table->unsignedInteger('cpu_pct');
            $table->unsignedInteger('storage_gb');
            $table->decimal('price', 8, 2);
            $table->boolean('popular')->default(false);
            $table->json('features')->nullable();
            $table->unsignedInteger('sort')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};
