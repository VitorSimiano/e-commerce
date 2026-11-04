<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::create([
            'name' => 'Administrador',
            'email' => 'admin@loja.com',
            'password' => 'senha12345',
        ]);

        $admin->forceFill(['role' => 'admin'])->save();

        $customers = [
            'Ana Souza' => 'ana@loja.com',
            'Bruno Lima' => 'bruno@loja.com',
            'Carla Dias' => 'carla@loja.com',
        ];

        foreach ($customers as $name => $email) {
            User::create(['name' => $name, 'email' => $email, 'password' => 'senha12345']);
        }
    }
}
