<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Promotion;
use App\Services\SeasonService;
use App\Support\Seasons;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PromotionController extends Controller
{
    public function index(Request $request, SeasonService $seasons): Response
    {
        foreach (Seasons::promotionKeys() as $key => $name) {
            Promotion::firstOrCreate(['key' => $key], ['name' => $name, 'percent' => $key === 'new_years_eve' ? 20 : 0, 'enabled' => true]);
        }

        $dates = collect(Seasons::HOLIDAYS)->map(fn ($h) => match ($h['rule'][0]) {
            'fixed' => $h['rule'][1] === $h['rule'][2] ? $this->md($h['rule'][1]) : $this->md($h['rule'][1]).' – '.$this->md($h['rule'][2]),
            'easter' => 'Según Semana Santa',
            'nth' => 'Finales de noviembre',
        })->all();

        return Inertia::render('Admin/Promotions', [
            'promotions' => Promotion::orderByDesc('percent')->orderBy('name')->get()->map(fn (Promotion $p) => [
                ...$p->only(['id', 'key', 'name', 'percent', 'enabled']),
                'when' => $p->key === 'national' ? 'Fiesta nacional de cada país' : ($dates[$p->key] ?? ''),
                'countries' => $p->key === 'national' ? count(Seasons::NATIONAL).' países' : (Seasons::HOLIDAYS[$p->key]['countries'] ?? null ? implode(', ', Seasons::HOLIDAYS[$p->key]['countries']) : 'Todos'),
            ]),
            'now' => $seasons->forRequest($request),
        ]);
    }

    public function update(Request $request, Promotion $promotion): RedirectResponse
    {
        $data = $request->validate([
            'percent' => ['required', 'integer', 'min:0', 'max:90'],
            'enabled' => ['required', 'boolean'],
        ]);
        $promotion->update($data);
        SeasonService::flush();

        return back()->with('success', "«{$promotion->name}»: ".($data['enabled'] && $data['percent'] > 0 ? "-{$data['percent']}%" : 'sin descuento').'.');
    }

    private function md(string $md): string
    {
        [$m, $d] = explode('-', $md);

        return (int) $d.'/'.(int) $m;
    }
}
