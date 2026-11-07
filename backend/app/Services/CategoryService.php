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

}
