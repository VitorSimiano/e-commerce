<?php

namespace App\Services;

use App\Models\Category;
use Illuminate\Database\Eloquent\Collection;

class CategoryService
{
    public function listAll(): Collection
    {
        $categories = Category::orderBy('name')->get();

        return $categories;
    }

    public function create(array $data): Category
    {
        $category = Category::create($data);

        return $category;
    }

    public function update(int $id, array $data): Category
    {
        $category = Category::findOrFail($id);
        $category->update($data);

        return $category;
    }

    public function delete(int $id): void
    {
        $category = Category::findOrFail($id);

        if ($category->products()->exists()) {
            abort(409, 'Category has products and cannot be deleted.');
        }

        $category->delete();
    }
}