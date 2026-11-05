<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AddCartItemRequest;
use App\Http\Requests\UpdateCartItemRequest;
use App\Http\Resources\CartResource;
use App\Models\User;
use App\Services\CartService;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function __construct(
        private CartService $cartService
    ) {}

    public function show(Request $request)
    {
        $cart = $this->cartService->getCart($this->currentUser($request), $this->cartToken($request));

        return new CartResource($cart);
    }

    public function addItem(AddCartItemRequest $request)
    {
        $data = $request->validated();

        $cart = $this->cartService->addItem(
            $this->currentUser($request),
            $this->cartToken($request),
            $data['product_variant_id'],
            $data['quantity']
        );

        return new CartResource($cart);
    }

    public function updateItem(UpdateCartItemRequest $request, int $id)
    {
        $cart = $this->cartService->updateItem(
            $this->currentUser($request),
            $this->cartToken($request),
            $id,
            $request->validated()['quantity']
        );

        return new CartResource($cart);
    }

    public function removeItem(Request $request, int $id)
    {
        $cart = $this->cartService->removeItem(
            $this->currentUser($request),
            $this->cartToken($request),
            $id
        );

        return new CartResource($cart);
    }

    private function currentUser(Request $request): ?User
{
    return $request->user('sanctum');
}

    private function cartToken(Request $request): ?string
    {
        return $request->header('X-Cart-Token');
    }
}
