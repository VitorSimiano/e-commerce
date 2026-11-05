<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => ['required', 'integer', 'exists:categories,id'],

            'name' => ['required', 'string', 'max:255'],
            'team' => ['required', 'string', 'max:255'],
            'season' => ['required', 'string', 'max:50'],
            'description' => ['required', 'string'],
            'price' => ['required', 'numeric', 'min:0.01', 'max:99999999.99'],

            'is_active' => ['required', 'boolean'],

            'image' => ['sometimes', 'nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],

            'variants' => ['required', 'array', 'size:4'],
            'variants.*.size' => ['required', 'string', 'in:P,M,G,GG', 'distinct'],
            'variants.*.stock' => ['required', 'integer', 'min:0', 'max:999999'],
        ];
    }
}
