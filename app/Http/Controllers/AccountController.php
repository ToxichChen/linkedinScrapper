<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Account;
use Illuminate\Support\Facades\View;

class AccountController extends Controller
{
    public function index()
    {
        $accounts = Account::all();
        return View::make('accounts.index')->with('accounts', $accounts);
    }
}
