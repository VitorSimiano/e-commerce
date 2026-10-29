<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ListProductsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search'      => ['nullable', 'string', 'max:100'],
            'category_id' => ['nullable', 'integer'],
            'size'        => ['nullable', 'in:P,M,G,GG'],
            'sort'        => ['nullable', 'in:newest,price_asc,price_desc'],
            'page'        => ['nullable', 'integer', 'min:1'],
        ];
    }
}