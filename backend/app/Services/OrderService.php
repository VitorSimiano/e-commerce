<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderService
{
    public function create(User $user, array $shippingData): Order
    {
        return DB::transaction(function () use ($user, $shippingData) {

           
            $cart = Cart::where('user_id', $user->id)
                ->lockForUpdate()
                ->first();

            if (! $cart) {
                throw ValidationException::withMessages([
                    'cart' => ['Cart not found.'],
                ]);
            }

            $cartItems = $cart->items()->get();

            if ($cartItems->isEmpty()) {
                throw ValidationException::withMessages([
                    'cart' => ['Your cart is empty.'],
                ]);
            }

            $itemsToOrder = [];
            $total = '0.00';

            
            foreach ($cartItems as $cartItem) {
                $variant = ProductVariant::with('product')
                    ->whereKey($cartItem->product_variant_id)
                    ->lockForUpdate()
                    ->first();

                if (! $variant || ! $variant->product->is_active) {
                    throw ValidationException::withMessages([
                        'cart' => ['One or more products are unavailable.'],
                    ]);
                }

                if ($variant->stock < $cartItem->quantity) {
                    throw ValidationException::withMessages([
                        'stock' => [
                            "Insufficient stock for {$variant->product->name}, size {$variant->size}.",
                        ],
                    ]);
                }

                $unitPrice = $variant->product->price;

                $subtotal = bcmul(
                    $unitPrice,
                    (string) $cartItem->quantity,
                    2
                );

                $total = bcadd($total, $subtotal, 2);

                $itemsToOrder[] = [
                    'variant' => $variant,
                    'product' => $variant->product,
                    'quantity' => $cartItem->quantity,
                    'unit_price' => $unitPrice,
                    'subtotal' => $subtotal,
                ];
            }

            $order = Order::create(array_merge($shippingData, [
                'user_id' => $user->id,
                'status' => 'awaiting_payment',
                'total' => $total,
            ]));

          
            foreach ($itemsToOrder as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product']->id,
                    'product_variant_id' => $item['variant']->id,
                    'product_name' => $item['product']->name,
                    'team' => $item['product']->team,
                    'size' => $item['variant']->size,
                    'unit_price' => $item['unit_price'],
                    'quantity' => $item['quantity'],
                    'subtotal' => $item['subtotal'],
                ]);

                $item['variant']->decrement('stock', $item['quantity']);
            }

           
            $cart->items()->delete();

            return $order->load('items');
        });
    }

public function pay(User $user, int $orderId): Order
{
    return DB::transaction(function () use ($user, $orderId) {

        $order = Order::where('user_id', $user->id)
            ->lockForUpdate()
            ->findOrFail($orderId);

        if ($order->status !== 'awaiting_payment') {
            throw ValidationException::withMessages([
                'order' => ['This order cannot be paid.'],
            ]);
        }

        $order->update([
            'status' => 'paid',
        ]);

        return $order->load('items');
    });
}

public function cancel(User $user, int $orderId): Order
{
    return DB::transaction(function () use ($user, $orderId) {

        
        $order = Order::where('user_id', $user->id)
            ->lockForUpdate()
            ->findOrFail($orderId);

        if ($order->status !== 'awaiting_payment') {
            throw ValidationException::withMessages([
                'order' => ['This order cannot be cancelled.'],
            ]);
        }

        $orderItems = $order->items;

        foreach ($orderItems as $item) {

            if ($item->product_variant_id !== null) {
                $variant = ProductVariant::whereKey($item->product_variant_id)
                    ->lockForUpdate()
                    ->first();

                if ($variant) {
                    $variant->increment('stock', $item->quantity);
                }
            }
        }

      
        $order->update([
            'status' => 'cancelled',
        ]);

        return $order->load('items');
    });
}

public function listForUser(User $user)
{
    return Order::where('user_id', $user->id)
        ->with('items')
        ->latest()
        ->paginate(10);
}

public function findForUser(User $user, int $orderId): Order
{
    return Order::where('user_id', $user->id)
        ->with('items')
        ->findOrFail($orderId);
}


}