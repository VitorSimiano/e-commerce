<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;

class AuthController extends Controller
{
    public function __construct(
        private AuthService $authService
    ) {}

    public function register(RegisterRequest $request)
    {
        $data = $request->validated();
        $cartToken = Arr::pull($data, 'cart_token');  

        $result = $this->authService->register($data, $cartToken, $request);

        return (new UserResource($result['user']))
            ->additional(['cart_merge' => $result['cart_merge']])
            ->response()
            ->setStatusCode(201)
            ->header('Cache-Control', 'no-store');
    }

    public function login(LoginRequest $request)
    {
        $credentials = $request->validated();
        
        $cartToken = Arr::pull($credentials, 'cart_token');

        $result = $this->authService->login($credentials, $cartToken, $request);

        return (new UserResource($result['user']))
            ->additional(['cart_merge' => $result['cart_merge']])
            ->response()
            ->header('Cache-Control', 'no-store');
    }

    public function me(Request $request)
    {
        return new UserResource($request->user());
    }

    public function logout(Request $request)
    {
        $this->authService->logout($request);

        return response()->noContent();
    }
}