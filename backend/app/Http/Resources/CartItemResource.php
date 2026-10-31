<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
   public function toArray(Request $request): array
{
    return [
        'id'                 => $this->id,
        'product_variant_id' => $this->product_variant_id,
        'product'            => [
            'id'    => $this->variant->product->id,
            'name'  => $this->variant->product->name,
            'team'  => $this->variant->product->team,
            'image' => $this->variant->product->image,
        ],
        'size'       => $this->variant->size,
        'stock'      => $this->variant->stock,
        'quantity'   => $this->quantity,
        'unit_price' => $this->unit_price,
        'subtotal'   => $this->subtotal,
        'available'  => $this->available,
    ];
}
}
