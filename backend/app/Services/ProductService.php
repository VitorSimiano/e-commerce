<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

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
            'price_asc' => $query->orderBy('price'),
            'price_desc' => $query->orderByDesc('price'),
            default => $query->orderByDesc('created_at'),
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
    
public function listForAdmin(array $filters): LengthAwarePaginator
{
    $query = Product::with(['category', 'variants']);

    if (! empty($filters['search'])) {
        $query->where(function ($query) use ($filters) {
            $query->where('name', 'like', '%' . $filters['search'] . '%')
                ->orWhere('team', 'like', '%' . $filters['search'] . '%');
        });
    }

    return $query->orderByDesc('created_at')
        ->paginate(self::PER_PAGE)
        ->withQueryString();
}

public function create(array $data): Product
{

    $variants = $data['variants'];

    unset($data['variants']);

    $product = DB::transaction(function () use ($data, $variants) {
        $product = Product::create($data);

        foreach ($variants as $variant) {
            $product->variants()->create($variant);
        }

        return $product;
    });



    return $product->load(['category', 'variants']);
}

public function update(int $id, array $data): Product
{
    $product = Product::findOrFail($id);


    $variants = $data['variants'];

    unset($data['variants']);

    DB::transaction(function () use ($product, $data, $variants) {
        $product->update($data);

        foreach ($variants as $variant) {
            $product->variants()->updateOrCreate(
                ['size' => $variant['size']],
                ['stock' => $variant['stock']]
            );
        }
    });

    return $product->load(['category', 'variants']);
}

public function delete(int $id): void
{
    $product = Product::findOrFail($id);

    $product->delete();

}

}
