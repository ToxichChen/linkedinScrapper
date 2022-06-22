<?php

namespace App\Http\Controllers;

use App\Models\CryptoCompany;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\View;

class CryptoCompanyController extends Controller
{
    public function index()
    {
        $companies = CryptoCompany::all();
        return View::make('crypto_companies.index')->with('companies', $companies);
    }}
