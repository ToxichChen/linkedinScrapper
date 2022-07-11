<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Employee;
use App\Models\EmployeeEducation;
use App\Models\EmployeeInfo;
use App\Models\EmployeeJob;
use App\Models\EmployeeSkill;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\View;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        if ($request->all() == null) {
            $employees = DB::table('employees')
                ->join('companies', 'employees.company_id', '=', 'companies.id')
                ->select('employees.*', 'companies.company_name')
                ->get();
        } else {
            $employees = Employee::getEmployeesByFilter($request->all());
        }

        $pastJobs = EmployeeJob::getPastCompanies();
        $locations = Employee::getLocations();
        $educations = EmployeeEducation::getEducations();
        $titles = Employee::getTitles();
        $companies = Company::all();

        return View::make('employees.index')->with(
            [
                'employees'     => $employees,
                'pastJobs'      => $pastJobs,
                'locations'     => $locations,
                'educations'    => $educations,
                'titles'        => $titles,
                'companies'     => $companies
            ]
        );
    }

    public function show($id)
    {
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
