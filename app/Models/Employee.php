<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Employee extends Model
{
    use HasFactory;

    public static function getEmployeesByFilter($filters)
    {
        $employees = DB::table('employees')
            ->join('companies', 'employees.company_id', '=', 'companies.id')
            ->select('employees.*', 'companies.company_name')
            ->get();
        $query = '  SELECT DISTINCT employees.*, companies.company_name FROM employees
                    JOIN companies on employees.company_id = companies.id
										LEFT JOIN employee_educations on employees.id = employee_educations.employee_id
										LEFT JOIN employee_jobs on employees.id = employee_jobs.employee_id
                    WHERE ';
        if ($filters['company'] != '') {
            $query .= 'employees.company_id = ' . $filters['company'] . ' AND ';
        }
        if ($filters['title'] != '') {
            $query .= 'employees.title LIKE "%' . $filters['title'] . '%" AND ';
        }
        if ($filters['education'] != '') {
            $query .= 'employees.education LIKE "%' . $filters['education'] . '%" AND ';
        }
        if ($filters['location'] != '') {
            $query .= 'employees.location LIKE "%' . $filters['location'] . '%" AND ';
        }
        if ($filters['past_company'] != '') {
            $query .= 'employee_jobs.company LIKE "%' . $filters['past_company'] . '%" AND ';
        }

        $query .= 'employees.linkedin_url != ""';

        return DB::select($query);
    }

    public static function getLocations()
    {
        return DB::table('employees')
            ->distinct()
            ->get('location');
    }

    public static function getTitles()
    {
        return DB::table('employees')
            ->distinct()
            ->get('title');
    }

}
