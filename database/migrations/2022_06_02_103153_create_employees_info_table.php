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
        Schema::create('employees_info', function (Blueprint $table) {
            $table->id();
            $table->integer('employee_id');
            $table->string('profile')->default('');
            $table->string('email')->default('');
            $table->text('description')->default('');
            $table->string('headline')->default('');
            $table->string('location')->default('');
            $table->string('img_url')->default('');
            $table->string('first_name')->default('');
            $table->string('last_name')->default('');
            $table->string('full_name')->default('');
            $table->integer('subscribers')->default(0);
            $table->string('linkedin_user_id')->default('');
            $table->string('company')->default('');
            $table->integer('company_id');
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
        Schema::dropIfExists('employees_info');
    }
};
