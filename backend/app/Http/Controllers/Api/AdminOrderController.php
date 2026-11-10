<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Services\OrderService;
use Illuminate\Http\Request;

class AdminOrderController extends Controller
{
    private const STATUSES = 'awaiting_payment,paid,shipped,delivered,cancelled';

    public function __construct(
        private OrderService $orderService
    ) {}

    public function index(Request $request)
    {
        $filters = $request->validate([
            'status' => ['nullable', 'in:' . self::STATUSES],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $orders = $this->orderService->listForAdmin($filters['status'] ?? null);

        return OrderResource::collection($orders);
    }

    public function updateStatus(Request $request, int $id)
    {
        $data = $request->validate([
            'status' => ['required', 'in:' . self::STATUSES],
        ]);

        $order = $this->orderService->updateStatus($id, $data['status']);

        return new OrderResource($order);
    }
}