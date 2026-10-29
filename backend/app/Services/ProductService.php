<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Pagination\LengthAwarePaginator;

class ProductService
{
    private const PER_PAGE = 12;

    public function listAll(array $filters): LengthAwarePaginator
    {
    
        $query = Product::active()->with(['category', 'variants']);

        if (! empty($filters['search'])) {
            $query->where('name', 'like', '%'.$filters['search'].'%');
        }

        if (! empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        
        if (! empty($filters['size'])) {
            $query->whereHas('variants', function ($variants) use ($filters) {
                $variants->where('size', $filters['size'])
                    ->where('stock', '>', 0);
            });
        }

        match ($filters['sort'] ?? 'newest') {
            'price_asc'  => $query->orderBy('price'),
            'price_desc' => $query->orderByDesc('price'),
            default      => $query->orderByDesc('created_at'),
        };

       
        $query->orderByDesc('id');

        $products = $query->paginate(self::PER_PAGE)->withQueryString();

        return $products;
    }

    public function findById(int $id): Product
    {
       
        $product = Product::active()
            ->with(['category', 'variants'])
            ->findOrFail($id);

        return $product;
    }
}