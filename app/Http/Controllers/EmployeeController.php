<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\View;

class EmployeeController extends Controller
{
    public function index() {
        $employees = DB::table('employees')
            ->join('companies', 'employees.company_id', '=', 'companies.id')
            ->select('employees.*', 'companies.company_name')
            ->get();
        return View::make('employees.index')->with('employees', $employees);
    }
}
