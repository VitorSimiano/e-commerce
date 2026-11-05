<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CreateOrderRequest;
use App\Http\Resources\OrderResource;
use App\Services\OrderService;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(
        private OrderService $orderService
    ) {}

    public function store(CreateOrderRequest $request)
    {
        $order = $this->orderService->create(
            $request->user(),
            $request->validated()
        );

        return new OrderResource($order);
    }

    public function pay(Request $request, int $id)
    {
        $order = $this->orderService->pay(
            $request->user(),
            $id
        );

        return new OrderResource($order);
    }

    public function cancel(Request $request, int $id)
    {
        $order = $this->orderService->cancel(
            $request->user(),
            $id
        );

        return new OrderResource($order);
    }

public function index(Request $request)
{
    $orders = $this->orderService->listForUser(
        $request->user()
    );

    return OrderResource::collection($orders);
}

public function show(Request $request, int $id)
{
    $order = $this->orderService->findForUser(
        $request->user(),
        $id
    );

    return new OrderResource($order);
}

}
