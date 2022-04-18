<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\View;
use App\Models\Company;

class CompanyController extends Controller
{
    public function index()
    {
        $companies = Company::all();
        return View::make('companies.index')->with('companies', $companies);
    }
}
