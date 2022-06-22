<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('crypto_companies', function (Blueprint $table) {
            $table->id();
            $table->string('fund_raising_round');
            $table->string('date');
            $table->string('amount');
            $table->string('investors');
            $table->string('website');
            $table->string('founder');
            $table->string('category');
            $table->string('subcategories');
            $table->string('description');
            $table->string('stages');
            $table->string('valuation');
            $table->string('project');
            $table->string('announcement');
            $table->timestamp('created_at')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamp('updated_at')->default(DB::raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('crypto_companies');
    }
};
