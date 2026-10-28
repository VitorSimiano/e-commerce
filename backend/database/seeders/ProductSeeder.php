<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // map "category name => id", so we never hardcode ids
        $categoryIds = Category::pluck('id', 'name');

        $products = [
            // Brasil
            [
                'category'    => 'Brasil',
                'name'        => 'Camisa Flamengo I 2025',
                'team'        => 'Flamengo',
                'season'      => '2025/26',
                'description' => 'Camisa titular do Flamengo.',
                'price'       => '349.90',
                'is_active'   => true,
                'stock'       => ['P' => 10, 'M' => 15, 'G' => 8],
            ],
            [
                'category'    => 'Brasil',
                'name'        => 'Camisa Corinthians II 2025',
                'team'        => 'Corinthians',
                'season'      => '2025/26',
                'description' => 'Camisa reserva do Corinthians.',
                'price'       => '329.90',
                'is_active'   => true,
                'stock'       => ['P' => 5, 'M' => 3, 'G' => 0], // one size sold out
            ],
            [
                'category'    => 'Brasil',
                'name'        => 'Camisa Palmeiras I 2025',
                'team'        => 'Palmeiras',
                'season'      => '2025/26',
                'description' => 'Camisa titular do Palmeiras.',
                'price'       => '339.90',
                'is_active'   => true,
                'stock'       => ['P' => 0, 'M' => 0, 'G' => 0], // fully sold out
            ],

            // Espanha
            [
                'category'    => 'Espanha',
                'name'        => 'Camisa Real Madrid I 2025',
                'team'        => 'Real Madrid',
                'season'      => '2025/26',
                'description' => 'Camisa titular do Real Madrid.',
                'price'       => '449.90',
                'is_active'   => true,
                'stock'       => ['P' => 12, 'M' => 20, 'G' => 9, 'GG' => 4],
            ],
            [
                'category'    => 'Espanha',
                'name'        => 'Camisa Barcelona I 2025',
                'team'        => 'Barcelona',
                'season'      => '2025/26',
                'description' => 'Camisa titular do Barcelona.',
                'price'       => '429.90',
                'is_active'   => false, // inactive: must not show in the catalog
                'stock'       => ['P' => 6, 'M' => 6, 'G' => 6],
            ],

            // Italia
            [
                'category'    => 'Italia',
                'name'        => 'Camisa Inter de Milao I 2025',
                'team'        => 'Inter de Milao',
                'season'      => '2025/26',
                'description' => 'Camisa titular da Inter de Milao.',
                'price'       => '399.90',
                'is_active'   => true,
                'stock'       => ['P' => 7, 'M' => 10, 'G' => 5],
            ],

            // Inglaterra
            [
                'category'    => 'Inglaterra',
                'name'        => 'Camisa Manchester United I 2025',
                'team'        => 'Manchester United',
                'season'      => '2025/26',
                'description' => 'Camisa titular do Manchester United.',
                'price'       => '429.90',
                'is_active'   => true,
                'stock'       => ['P' => 8, 'M' => 12, 'G' => 6],
            ],
            [
                'category'    => 'Inglaterra',
                'name'        => 'Camisa Liverpool I 2025',
                'team'        => 'Liverpool',
                'season'      => '2025/26',
                'description' => 'Camisa titular do Liverpool.',
                'price'       => '419.90',
                'is_active'   => true,
                'stock'       => ['P' => 4, 'M' => 9, 'G' => 7, 'GG' => 2],
            ],
            [
                'category'    => 'Inglaterra',
                'name'        => 'Camisa Arsenal I 2025',
                'team'        => 'Arsenal',
                'season'      => '2025/26',
                'description' => 'Camisa titular do Arsenal.',
                'price'       => '409.90',
                'is_active'   => true,
                'stock'       => ['P' => 6, 'M' => 0, 'G' => 5], // M sold out
            ],

            // Selecoes Nacionais
            [
                'category'    => 'Selecoes Nacionais',
                'name'        => 'Camisa Selecao Brasileira I 2026',
                'team'        => 'Brasil',
                'season'      => '2026',
                'description' => 'Camisa titular da Selecao Brasileira.',
                'price'       => '379.90',
                'is_active'   => true,
                'stock'       => ['P' => 15, 'M' => 25, 'G' => 18, 'GG' => 6],
            ],
            [
                'category'    => 'Selecoes Nacionais',
                'name'        => 'Camisa Selecao Argentina I 2026',
                'team'        => 'Argentina',
                'season'      => '2026',
                'description' => 'Camisa titular da Selecao Argentina.',
                'price'       => '389.90',
                'is_active'   => true,
                'stock'       => ['P' => 9, 'M' => 14, 'G' => 10],
            ],
            [
                'category'    => 'Selecoes Nacionais',
                'name'        => 'Camisa Selecao Francesa I 2026',
                'team'        => 'Franca',
                'season'      => '2026',
                'description' => 'Camisa titular da Selecao Francesa.',
                'price'       => '389.90',
                'is_active'   => true,
                'stock'       => ['P' => 5, 'M' => 7, 'G' => 4],
            ],
        ];

        foreach ($products as $item) {
            $product = Product::create([
                'category_id' => $categoryIds[$item['category']],
                'name'        => $item['name'],
                'team'        => $item['team'],
                'season'      => $item['season'],
                'description' => $item['description'],
                'price'       => $item['price'],
                'is_active'   => $item['is_active'],
            ]);

            foreach ($item['stock'] as $size => $quantity) {
                $product->variants()->create([
                    'size'  => $size,
                    'stock' => $quantity,
                ]);
            }
        }
    }
}