<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('Dashboard', [
            'orders' => Order::with('plan')
                ->where('user_id', $user->id)
                ->latest()
                ->get(),
            'invoices' => Invoice::with('order.plan')
                ->where('user_id', $user->id)
                ->latest()
                ->get(),
        ]);
    }
}
