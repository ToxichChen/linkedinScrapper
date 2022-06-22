<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\CreatedQueryController;
use App\Http\Controllers\CryptoCompanyController;
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
Route::prefix('/created_queries')->group(function () {
    Route::get('/', [CreatedQueryController::class, 'index'])->name('created_queries.index');
    Route::get('/create_form', [CreatedQueryController::class, 'createForm'])->name('created_queries.create_form');
    Route::post('/create', [CreatedQueryController::class, 'create'])->name('created_queries.create');
    Route::get('/edit/{id}', [CreatedQueryController::class, 'edit'])->name('created_queries.edit');
    Route::post('/update/{id}', [CreatedQueryController::class, 'update'])->name('created_queries.update');
    Route::get('/delete/{id}', [CreatedQueryController::class, 'delete'])->name('created_queries.delete');
});

Route::prefix('/companies')->group(function () {
    Route::get('/', [CompanyController::class, 'index'])->name('companies.index');
    Route::get('/create_form', [CompanyController::class, 'createForm'])->name('companies.create_form');
    Route::post('/create', [CompanyController::class, 'create'])->name('companies.create');
});

Route::prefix('/crypto_companies')->group(function () {
    Route::get('/', [CryptoCompanyController::class, 'index'])->name('crypto_companies.index');
});
