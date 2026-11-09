import Modal from '@/Components/Modal';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Check, Pencil, Plus, Star, Tags, Trash2 } from 'lucide-react';
import { cycleUnit, defaultCyclePrice, fmtPrice } from '@/lib/price';
import { useState } from 'react';

const fmtRam = (mb) => (mb >= 1024 ? `${mb / 1024} GB` : `${mb} MB`);

const inputClass =
    'w-full rounded-lg border border-slate-700 bg-black/60 px-3 py-2 font-mono text-sm text-slate-100 outline-none transition focus:border-neon disabled:opacity-60';

function PriceInput({ plan }) {
    const [value, setValue] = useState(plan.price.toFixed(2));
    const [saving, setSaving] = useState(false);
    const dirty = Number(value) !== plan.price;

    const save = () => {
        if (!dirty || saving) return;
        router.patch(
            route('admin.plans.price', plan.id),
            { price: value },
            { preserveScroll: true, onStart: () => setSaving(true), onFinish: () => setSaving(false) },
        );
    };

    return (
        <div className="flex items-center gap-1.5">
            <input
                type="number"
                step="0.01"
                min="0"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && save()}
                className="w-24 rounded-md border border-slate-700 bg-black/60 px-2 py-1 text-right font-mono text-sm text-neon outline-none focus:border-neon"
            />
            <span className="font-mono text-xs text-slate-400">€</span>
            {dirty && (
                <button
                    type="button"
                    onClick={save}
                    disabled={saving}
                    title="Guardar precio"
                    className="rounded-md border border-emerald-500/50 bg-emerald-500/10 p-1 text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-50"
                >
                    <Check size={14} />
                </button>
            )}
        </div>
    );
}

function Field({ label, error, children }) {
    return (
        <label className="block space-y-1">
            <span className="font-mono text-[11px] font-bold tracking-wider text-slate-400 uppercase">{label}</span>
            {children}
            {error && <p className="font-mono text-xs text-rose-400">{error}</p>}
        </label>
    );
}

function PlanForm({ editing, categories, onClose }) {
    const plan = editing.plan;
    const { billingCycles } = usePage().props;
    const extraCycles = billingCycles.filter((c) => c.key !== 'monthly');
    const { data, setData, post, put, processing, errors } = useForm({
        cycle_prices: Object.fromEntries(extraCycles.map((c) => [c.key, plan?.cycle_prices?.[c.key] ?? ''])),
        category: plan?.category ?? editing.category,
        name: plan?.name ?? '',
        ram_mb: plan?.ram_mb ?? 1024,
        cpu_pct: plan?.cpu_pct ?? 100,
        storage_gb: plan?.storage_gb ?? 10,
        price: plan?.price ?? 0,
        popular: plan?.popular ?? false,
        features: (plan?.features ?? []).join('\n'),
    });

    const setCyclePrice = (key, value) => setData('cycle_prices', { ...data.cycle_prices, [key]: value });

    const fillFromMonthly = () =>
        setData(
            'cycle_prices',
            Object.fromEntries(extraCycles.map((c) => [c.key, defaultCyclePrice(data.price, c)])),
        );

    const submit = (e) => {
        e.preventDefault();
        const options = { preserveScroll: true, onSuccess: onClose };
        if (plan) put(route('admin.plans.update', plan.id), options);
        else post(route('admin.plans.store'), options);
    };

    return (
        <form onSubmit={submit} className="space-y-4 bg-[#060914] p-6 text-slate-100">
            <h2 className="text-lg font-black text-white">{plan ? `Editar «${plan.name}»` : 'Nuevo plan'}</h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Categoría" error={errors.category}>
                    <select className={inputClass} value={data.category} onChange={(e) => setData('category', e.target.value)}>
                        {categories.map((c) => (
                            <option key={c.key} value={c.key}>
                                {c.title}
                            </option>
                        ))}
                    </select>
                </Field>
                <Field label="Nombre" error={errors.name}>
                    <input className={inputClass} value={data.name} onChange={(e) => setData('name', e.target.value)} maxLength={60} required />
                </Field>
                <Field label="Precio (€ / mes)" error={errors.price}>
                    <input type="number" step="0.01" min="0" className={inputClass} value={data.price} onChange={(e) => setData('price', e.target.value)} required />
                </Field>
                <Field label="RAM (MB)" error={errors.ram_mb}>
                    <input type="number" min="64" className={inputClass} value={data.ram_mb} onChange={(e) => setData('ram_mb', e.target.value)} required />
                </Field>
                <Field label="CPU (%)" error={errors.cpu_pct}>
                    <input type="number" min="1" className={inputClass} value={data.cpu_pct} onChange={(e) => setData('cpu_pct', e.target.value)} required />
                </Field>
                <Field label="Almacenamiento (GB)" error={errors.storage_gb}>
                    <input type="number" min="1" className={inputClass} value={data.storage_gb} onChange={(e) => setData('storage_gb', e.target.value)} required />
                </Field>
            </div>

            <div className="space-y-3 rounded-xl border border-slate-800 bg-black/30 p-4">
                <div className="flex items-center justify-between gap-2">
                    <div>
                        <h3 className="font-mono text-[11px] font-bold tracking-wider text-slate-300 uppercase">Otros períodos de facturación</h3>
                        <p className="font-mono text-[10px] text-slate-500">El precio mensual es el de arriba. Deja un período vacío para no ofrecerlo.</p>
                    </div>
                    <button
                        type="button"
                        onClick={fillFromMonthly}
                        className="shrink-0 rounded-lg border border-yellow-400/40 bg-yellow-400/10 px-3 py-1.5 font-mono text-[11px] font-bold text-yellow-300 hover:bg-yellow-400/20"
                    >
                        Calcular desde el mensual
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {extraCycles.map((c) => (
                        <Field key={c.key} label={`€ / ${c.unit}`} error={errors[`cycle_prices.${c.key}`]}>
                            <input
                                type="number"
                                step="any"
                                min="0"
                                className={inputClass}
                                value={data.cycle_prices[c.key]}
                                placeholder="No se ofrece"
                                onChange={(e) => setCyclePrice(c.key, e.target.value)}
                            />
                        </Field>
                    ))}
                </div>
            </div>

            <Field label="Características (una por línea)" error={errors.features}>
                <textarea rows={5} className={inputClass} value={data.features} onChange={(e) => setData('features', e.target.value)} />
            </Field>

            <label className="flex items-center gap-2 font-mono text-xs text-slate-300">
                <input type="checkbox" checked={data.popular} onChange={(e) => setData('popular', e.target.checked)} className="rounded border-slate-600 bg-black text-pink-500" />
                Marcar como plan destacado
            </label>

            <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={onClose} className="rounded-lg border border-slate-700 px-4 py-2 font-mono text-xs text-slate-300 hover:border-slate-500">
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={processing}
                    className="rounded-lg border border-neon/60 bg-neon/10 px-4 py-2 font-mono text-xs font-bold text-neon hover:bg-neon/20 disabled:opacity-50"
                >
                    {processing ? 'Guardando…' : 'Guardar'}
                </button>
            </div>
        </form>
    );
}

export default function AdminPlans({ categories }) {
    const { auth, flash, errors, billingCycles } = usePage().props;
    const [editing, setEditing] = useState(null);

    const destroy = (plan) => {
        if (!confirm(`¿Eliminar el plan «${plan.name}»? Esta acción no se puede deshacer.`)) return;
        router.delete(route('admin.plans.destroy', plan.id), { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Administrar precios - Cinammon Billing" />

            <div className="relative z-10 mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex items-center gap-3 border-b border-pink-500/25 pb-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-neon/40 bg-neon/10 text-neon">
                        <Tags size={22} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-white uppercase">Precios y planes</h1>
                        <p className="font-mono text-xs text-slate-400">
                            Cambia el precio mensual con Enter; el lápiz edita también los demás períodos (hora, día, año…). Los pedidos y facturas ya creados conservan el precio con el que se hicieron.
                        </p>
                    </div>
                </div>

                {flash?.success && (
                    <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 font-mono text-xs text-emerald-300">{flash.success}</div>
                )}
                {errors?.plan && (
                    <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-2 font-mono text-xs text-rose-300">{errors.plan}</div>
                )}

                {categories.map((category) => (
                    <section key={category.key} className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-black tracking-widest text-pink-300 uppercase">{category.title}</h2>
                            <button
                                type="button"
                                onClick={() => setEditing({ category: category.key, plan: null })}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-pink-500/40 bg-pink-500/10 px-3 py-1.5 font-mono text-xs font-bold text-pink-300 hover:bg-pink-500/20"
                            >
                                <Plus size={14} />
                                Nuevo plan
                            </button>
                        </div>

                        {category.plans.length === 0 ? (
                            <p className="rounded-xl border border-dashed border-slate-700 bg-black/30 p-6 text-center font-mono text-xs text-slate-400">
                                Sin planes. Esta categoría no se muestra en la tienda hasta que añadas el primero.
                            </p>
                        ) : (
                            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#060914]">
                                <table className="w-full min-w-[640px] text-left font-mono text-xs">
                                    <thead className="border-b border-slate-800 text-[10px] tracking-wider text-slate-500 uppercase">
                                        <tr>
                                            <th className="px-4 py-3">Plan</th>
                                            <th className="px-4 py-3">RAM</th>
                                            <th className="px-4 py-3">CPU</th>
                                            <th className="px-4 py-3">Disco</th>
                                            <th className="px-4 py-3">Precio / mes</th>
                                            <th className="px-4 py-3">Períodos</th>
                                            <th className="px-4 py-3">Pedidos</th>
                                            <th className="px-4 py-3 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {category.plans.map((plan) => (
                                            <tr key={plan.id} className="border-b border-slate-800/60 last:border-0">
                                                <td className="px-4 py-3 font-bold text-white">
                                                    <span className="inline-flex items-center gap-1.5">
                                                        {plan.name}
                                                        {plan.popular && <Star size={12} className="fill-yellow-400 text-yellow-400" />}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-300">{fmtRam(plan.ram_mb)}</td>
                                                <td className="px-4 py-3 text-slate-300">{plan.cpu_pct}%</td>
                                                <td className="px-4 py-3 text-slate-300">{plan.storage_gb} GB</td>
                                                <td className="px-4 py-3">
                                                    <PriceInput key={`${plan.id}-${plan.price}`} plan={plan} />
                                                </td>
                                                <td
                                                    className="px-4 py-3 text-slate-300"
                                                    title={Object.entries(plan.prices ?? {})
                                                        .map(([key, price]) => `${cycleUnit(billingCycles, key)}: ${fmtPrice(price)} €`)
                                                        .join(' · ')}
                                                >
                                                    {Object.keys(plan.prices ?? {}).length}
                                                </td>
                                                <td className="px-4 py-3 text-slate-400">{plan.orders_count}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setEditing({ category: plan.category, plan })}
                                                            title="Editar"
                                                            className="rounded-md border border-slate-700 p-1.5 text-slate-300 hover:border-neon hover:text-neon"
                                                        >
                                                            <Pencil size={14} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => destroy(plan)}
                                                            disabled={plan.orders_count > 0}
                                                            title={plan.orders_count > 0 ? 'Tiene pedidos: no se puede eliminar' : 'Eliminar'}
                                                            className="rounded-md border border-slate-700 p-1.5 text-slate-300 hover:border-rose-500 hover:text-rose-400 disabled:cursor-not-allowed disabled:opacity-30"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                ))}
            </div>

            <Modal show={editing !== null} onClose={() => setEditing(null)} maxWidth="2xl">
                {editing && <PlanForm key={editing.plan?.id ?? `new-${editing.category}`} editing={editing} categories={categories} onClose={() => setEditing(null)} />}
            </Modal>
        </AuthenticatedLayout>
    );
}
