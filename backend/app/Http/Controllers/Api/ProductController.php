<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ListProductsRequest;
use App\Http\Resources\ProductResource;
use App\Services\ProductService;

class ProductController extends Controller
{
    public function __construct(
        private ProductService $productService
    ) {}

    public function index(ListProductsRequest $request)
    {
        $products = $this->productService->listAll($request->validated());

        return ProductResource::collection($products);
    }

    public function show(int $id)
    {
        $product = $this->productService->findById($id);

        return new ProductResource($product);
    }
}