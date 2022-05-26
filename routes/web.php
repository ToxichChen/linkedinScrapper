<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\CreatedQueryController;
/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

//Route::get('/', function () {
//    return view('welcome');
//});

Route::get('/', [EmployeeController::class, 'index'])->name('index');
Route::get('/accounts', [AccountController::class, 'index'])->name('accounts.index');
Route::get('/companies', [CompanyController::class, 'index'])->name('companies.index');
Route::prefix('/created_queries')->group(function () {
    Route::get('/', [CreatedQueryController::class, 'index'])->name('created_queries.index');
    Route::get('/create_form', [CreatedQueryController::class, 'createForm'])->name('created_queries.create_form');
    Route::post('/create', [CreatedQueryController::class, 'create'])->name('created_queries.create');
});



