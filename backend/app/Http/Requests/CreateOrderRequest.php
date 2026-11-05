<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'shipping_name' => ['required', 'string', 'max:255'],
            'shipping_phone' => ['required', 'string', 'max:30'],
            'shipping_postal_code' => ['required', 'string', 'max:20'],
            'shipping_address' => ['required', 'string', 'max:255'],
            'shipping_number' => ['required', 'string', 'max:30'],
            'shipping_complement' => ['nullable', 'string', 'max:255'],
            'shipping_neighborhood' => ['required', 'string', 'max:255'],
            'shipping_city' => ['required', 'string', 'max:255'],
            'shipping_state' => ['required', 'string', 'size:2'],
        ];
    }
}