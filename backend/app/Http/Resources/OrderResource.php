<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'total' => $this->total,
            'paid_at' => $this->paid_at,

            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ]),

            'shipping' => [
                'name' => $this->shipping_name,
                'phone' => $this->shipping_phone,
                'postal_code' => $this->shipping_postal_code,
                'address' => $this->shipping_address,
                'number' => $this->shipping_number,
                'complement' => $this->shipping_complement,
                'neighborhood' => $this->shipping_neighborhood,
                'city' => $this->shipping_city,
                'state' => $this->shipping_state,
            ],

            'items' => OrderItemResource::collection($this->items),

            'created_at' => $this->created_at,
        ];
    }


  
}