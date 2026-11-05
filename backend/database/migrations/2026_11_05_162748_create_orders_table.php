<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained()
                ->restrictOnDelete();

            $table->string('status')->default('awaiting_payment');

            $table->decimal('total', 10, 2);

        
            $table->string('shipping_name');
            $table->string('shipping_phone');
            $table->string('shipping_postal_code');
            $table->string('shipping_address');
            $table->string('shipping_number');
            $table->string('shipping_complement')->nullable();
            $table->string('shipping_neighborhood');
            $table->string('shipping_city');
            $table->string('shipping_state', 2);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};