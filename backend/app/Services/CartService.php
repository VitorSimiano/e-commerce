<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CartService
{
    public function getCart(?User $user, ?string $token): Cart
    {
        $cart = $this->findCart($user, $token);

        return $this->present($cart ?? new Cart());
    }

    public function addItem(?User $user, ?string $token, int $variantId, int $quantity): Cart
    {
        $variant = ProductVariant::with('product')->findOrFail($variantId);

        if (! $variant->product->is_active || $variant->stock < 1) {
            throw ValidationException::withMessages([
                'product_variant_id' => ['This item is not available.'],
            ]);
        }

     
        $cart = DB::transaction(function () use ($user, $token, $variant, $quantity) {
            $cart = $this->findOrCreateCart($user, $token);

            $item = $cart->items()->where('product_variant_id', $variant->id)->first();
            $newQuantity = ($item?->quantity ?? 0) + $quantity;

            if ($newQuantity > $variant->stock) {
                throw ValidationException::withMessages([
                    'quantity' => ["Only {$variant->stock} unit(s) available in this size."],
                ]);
            }

            if ($item) {
                $item->update(['quantity' => $newQuantity]);   
            } else {
                $cart->items()->create([
                    'product_variant_id' => $variant->id,
                    'quantity'           => $newQuantity,
                ]);
            }

            return $cart;
        });

        return $this->present($cart);
    }

    public function updateItem(?User $user, ?string $token, int $itemId, int $quantity): Cart
    {
        $cart = $this->findCart($user, $token);

        if (! $cart) {
            abort(404, 'Cart not found.');
        }

        $item = $cart->items()->with('variant')->findOrFail($itemId);

        if ($quantity === 0) {
            $item->delete();
        } else {
            if ($quantity > $item->variant->stock) {
                throw ValidationException::withMessages([
                    'quantity' => ["Only {$item->variant->stock} unit(s) available in this size."],
                ]);
            }

            $item->update(['quantity' => $quantity]);
        }

        return $this->present($cart);
    }

    public function removeItem(?User $user, ?string $token, int $itemId): Cart
    {
        $cart = $this->findCart($user, $token);

        if (! $cart) {
            abort(404, 'Cart not found.');
        }

        $cart->items()->findOrFail($itemId)->delete();

        return $this->present($cart);
    }

    private function findCart(?User $user, ?string $token): ?Cart
    {
        if ($user) {
            return Cart::where('user_id', $user->id)->first();
        }

        if (! $token) {
            return null;
        }


        return Cart::where('token', $token)->whereNull('user_id')->first();
    }

    private function findOrCreateCart(?User $user, ?string $token): Cart
    {
        $cart = $this->findCart($user, $token);

        if ($cart) {
            return $cart;
        }

        if ($user) {
            return Cart::create(['user_id' => $user->id]);
        }

      
        return Cart::create(['token' => Str::random(64)]);
    }


    private function present(Cart $cart): Cart
    {
        if ($cart->exists) {
            $cart->load('items.variant.product');
        } else {
            $cart->setRelation('items', new Collection());
        }

        $total = '0.00';
        $totalItems = 0;

        foreach ($cart->items as $item) {
            $price = $item->variant->product->price;                 
            $subtotal = bcmul($price, (string) $item->quantity, 2);   

            $item->setAttribute('unit_price', $price);
            $item->setAttribute('subtotal', $subtotal);
            $item->setAttribute(
                'available',
                $item->variant->product->is_active && $item->variant->stock >= $item->quantity
            );

            $total = bcadd($total, $subtotal, 2);
            $totalItems += $item->quantity;
        }

        $cart->setAttribute('total', $total);
        $cart->setAttribute('total_items', $totalItems);

        return $cart;
    }
}