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

    public function createForm()
    {
        return View::make('companies.create');
    }

    public function create(Request $request)
    {
        $validated = $request->validate([
            'company_name' => 'required',
            'company_url' => 'required',
            'company_sales_nav_id' => 'required',
            'employees' => 'required|numeric'
        ]);

        $company= new Company();
        $company->company_name = $validated['company_name'];
        $company->company_url = $validated['company_url'];
        $company->company_sales_nav_id = $validated['company_sales_nav_id'];
        $company->employees = $validated['employees'];
        $company->save();

        return redirect('/companies');
    }
}
