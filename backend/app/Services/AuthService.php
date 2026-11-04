<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function register(array $data, Request $request): User
    {
        $user = User::create($data);   // the "hashed" cast stores the password hashed

        Auth::guard('web')->login($user);
        $request->session()->regenerate();   // new session id after authenticating

        return $user;
    }

    public function login(array $credentials, Request $request): User
    {
        if (! Auth::guard('web')->attempt($credentials)) {
            throw ValidationException::withMessages([
                'email' => ['These credentials do not match our records.'],
            ]);
        }

        $request->session()->regenerate();

        return Auth::guard('web')->user();
    }

    public function logout(Request $request): void
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();
    }
}
