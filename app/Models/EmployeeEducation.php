<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class EmployeeEducation extends Model
{
    use HasFactory;

    protected $table = 'employee_educations';

    public static function getEducations()
    {
        return DB::table('employee_educations')
            ->distinct()
            ->get('school');
    }
}
