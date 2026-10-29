<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'team'        => $this->team,
            'season'      => $this->season,
            'description' => $this->description,
            'price'       => $this->price,
            'image'       => $this->image,
            
            'in_stock'    => $this->whenLoaded(
                'variants',
                fn () => $this->variants->sum('stock') > 0
            ),
            'category'    => new CategoryResource($this->whenLoaded('category')),
            'variants'    => ProductVariantResource::collection($this->whenLoaded('variants')),
            'created_at'  => $this->created_at,
        ];
    }
}