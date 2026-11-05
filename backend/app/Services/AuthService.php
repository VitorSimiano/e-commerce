<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function __construct(
        private CartService $cartService
    ) {}

    public function register(array $data, ?string $cartToken, Request $request): array
    {
        $user = User::create($data);   

        Auth::guard('web')->login($user);
        $request->session()->regenerate();   

        return [
            'user'       => $user,
            'cart_merge' => $this->cartService->mergeGuestCart($user, $cartToken),
        ];
    }

    public function login(array $credentials, ?string $cartToken, Request $request): array
    {
        if (! Auth::guard('web')->attempt($credentials)) {
            
            throw ValidationException::withMessages([
                'email' => ['These credentials do not match our records.'],
            ]);
        }

        $request->session()->regenerate();

        $user = Auth::guard('web')->user();

        return [
            'user'       => $user,
            'cart_merge' => $this->cartService->mergeGuestCart($user, $cartToken),
        ];
    }

    public function logout(Request $request): void
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();
    }
}