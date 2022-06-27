<?php

namespace App\Http\Controllers;

use App\Models\EmployeeEducation;
use App\Models\EmployeeInfo;
use App\Models\EmployeeJob;
use App\Models\EmployeeSkill;
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

    public function show($id) {
        $employee = EmployeeInfo::where('employee_id', $id)->first();
        if ($employee == null) {
            return redirect('/');
        }
        $employeeSkills = EmployeeSkill::where('employee_id', $id)->get();
        $employeeEducations = EmployeeEducation::where('employee_id', $id)->get();
        $employeeJobs = EmployeeJob::where('employee_id', $id)->get();

        return View::make('employees.show')->with(
            [
                'employee' => $employee,
                'employeeJobs' => $employeeJobs,
                'employeeSkills' => $employeeSkills,
                'employeeEducations' => $employeeEducations,
            ]
        );
    }
}
