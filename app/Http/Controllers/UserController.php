<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\Redirect;

class UserController extends Controller
{
    public function loginForm() {
        if (isset($_SESSION['user'])) {
            return redirect('/');
        }
        return View::make('login');
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|exists:users|max:255',
            'password' => 'required|min:6',
        ]);

        if ($validator->fails()) {
            return Redirect::back()->with(['errors' => $validator->messages()->all()]);
        }

        $user = User::where('email', $request->email)->first();

        if ($user && Hash::check($request->password, $user->password)) {

            $_SESSION['user']['username'] = $user->name;
            $_SESSION['user']['id'] = $user->id;
            $_SESSION['user']['email'] = $user->email;

            return redirect('/');
        } else {
            return Redirect::back()->with(['errors' => ['Password is incorrect']]);
        }
    }

    public function logout()
    {
        if (isset($_SESSION['user'])) {
            unset($_SESSION['user']);
            return redirect('/login');
        } else {
            return redirect('/');
        }
    }
}
