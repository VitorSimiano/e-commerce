<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Services\CategoryService;

class AdminCategoryController extends Controller
{
    public function __construct(
        private CategoryService $categoryService
    ) {}

    public function store(CategoryRequest $request)
    {
        $category = $this->categoryService->create($request->validated());

        return (new CategoryResource($category))
            ->response()
            ->setStatusCode(201);
    }

    public function update(CategoryRequest $request, int $id)
    {
        $category = $this->categoryService->update($id, $request->validated());

        return new CategoryResource($category);
    }

    public function destroy(int $id)
    {
        $this->categoryService->delete($id);

        return response()->noContent();
    }
}