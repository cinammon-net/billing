<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\StoreController;
use App\Models\Plan;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PlanController extends Controller
{
    public function index(): Response
    {
        $plans = Plan::withCount('orders')->orderBy('sort')->orderBy('id')->get()->groupBy('category');

        return Inertia::render('Admin/Plans', [
            'categories' => collect(StoreController::CATEGORIES)->map(fn ($meta, $key) => [
                'key' => $key,
                'title' => $meta['title'],
                'plans' => ($plans[$key] ?? collect())->values(),
            ])->values(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);

        Plan::create([
            ...$data,
            'slug' => $this->uniqueSlug($data['category'], $data['name']),
            'sort' => (int) Plan::max('sort') + 1,
        ]);

        return back()->with('success', "Plan «{$data['name']}» creado.");
    }

    public function update(Request $request, Plan $plan): RedirectResponse
    {
        $plan->update($this->validated($request));

        return back()->with('success', "Plan «{$plan->name}» actualizado.");
    }

    public function updatePrice(Request $request, Plan $plan): RedirectResponse
    {
        $data = $request->validate(['price' => ['required', 'numeric', 'min:0', 'max:9999.99']]);
        $plan->update(['price' => round((float) $data['price'], 2)]);

        return back()->with('success', "Precio de «{$plan->name}» actualizado a ".number_format($plan->price, 2, ',', '.').' €.');
    }

    public function destroy(Plan $plan): RedirectResponse
    {
        // orders.plan_id borra en cascada: nunca eliminar un plan con pedidos.
        if ($plan->orders()->exists()) {
            return back()->withErrors(['plan' => "«{$plan->name}» tiene pedidos asociados y no se puede eliminar."]);
        }

        $plan->delete();

        return back()->with('success', "Plan «{$plan->name}» eliminado.");
    }

    private function validated(Request $request): array
    {
        $cycleRules = ['cycle_prices' => ['nullable', 'array']];
        foreach (array_keys(Plan::CYCLES) as $cycle) {
            if ($cycle !== 'monthly') {
                $cycleRules["cycle_prices.{$cycle}"] = ['nullable', 'numeric', 'min:0.0001', 'max:9999.99'];
            }
        }

        $data = $request->validate([
            ...$cycleRules,
            'category' => ['required', Rule::in(array_keys(StoreController::CATEGORIES))],
            'name' => ['required', 'string', 'max:60'],
            'ram_mb' => ['required', 'integer', 'min:64', 'max:1048576'],
            'cpu_pct' => ['required', 'integer', 'min:1', 'max:10000'],
            'storage_gb' => ['required', 'integer', 'min:1', 'max:100000'],
            'price' => ['required', 'numeric', 'min:0', 'max:9999.99'],
            'popular' => ['boolean'],
            'features' => ['nullable', 'string', 'max:2000'],
        ]);

        $data['price'] = round((float) $data['price'], 2);
        $data['popular'] = (bool) ($data['popular'] ?? false);
        $data['cycle_prices'] = collect($data['cycle_prices'] ?? [])
            ->only(array_keys(Plan::CYCLES))
            ->except('monthly')
            ->filter(fn ($value) => $value !== null && $value !== '')
            ->map(fn ($value) => round((float) $value, 4))
            ->all();
        $data['features'] = collect(preg_split('/\R/', (string) ($data['features'] ?? '')))
            ->map(fn ($line) => Str::limit(trim($line), 80, ''))
            ->filter()
            ->take(12)
            ->values()
            ->all();

        return $data;
    }

    private function uniqueSlug(string $category, string $name): string
    {
        $base = Str::slug("{$category}-{$name}") ?: $category;
        $slug = $base;
        for ($i = 2; Plan::where('slug', $slug)->exists(); $i++) {
            $slug = "{$base}-{$i}";
        }

        return $slug;
    }
}
