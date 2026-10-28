<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Brasil',             'league' => 'Brasileirao Serie A', 'flag' => '🇧🇷'],
            ['name' => 'Espanha',            'league' => 'La Liga',             'flag' => '🇪🇸'],
            ['name' => 'Italia',             'league' => 'Serie A',             'flag' => '🇮🇹'],
            ['name' => 'Inglaterra',         'league' => 'Premier League',      'flag' => '🇬🇧'],
            ['name' => 'Selecoes Nacionais', 'league' => 'Selecoes Nacionais',       'flag' => '🌍'],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}