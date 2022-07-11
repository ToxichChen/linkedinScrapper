<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class EmployeeJob extends Model
{
    use HasFactory;

    public static function getPastCompanies()
    {
        return DB::table('employee_jobs')
            ->distinct()
            ->get('company');
    }

}
