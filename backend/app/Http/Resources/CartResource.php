<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
    
            'token' => $this->user_id === null ? $this->token : null,
            'items' => CartItemResource::collection($this->items),
            'total_items' => $this->total_items,
            'total' => $this->total,
        ];
    }
}
