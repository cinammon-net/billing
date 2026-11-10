import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { BadgePercent, Check } from 'lucide-react';
import SeasonIcon from '@/Components/SeasonIcon';

function Row({ promo }) {
    const { data, setData, put, processing, recentlySuccessful, isDirty } = useForm({ percent: promo.percent, enabled: promo.enabled });
    const save = (e) => {
        e.preventDefault();
        put(route('admin.promotions.update', promo.id), { preserveScroll: true });
    };

    return (
        <form onSubmit={save} className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-black/40 p-4 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
                <p className="font-bold text-white">{promo.name}</p>
                <p className="font-mono text-[11px] text-slate-400">
                    {promo.when} · {promo.countries}
                </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-1.5 font-mono text-xs text-slate-300">
                    -
                    <input
                        type="number"
                        min={0}
                        max={90}
                        value={data.percent}
                        onChange={(e) => setData('percent', Number(e.target.value))}
                        className="w-16 rounded-lg border border-slate-700 bg-black/60 px-2 py-1.5 text-right text-white focus:border-pink-500 focus:ring-0"
                    />
                    %
                </label>
                <label className="flex cursor-pointer items-center gap-2 font-mono text-xs text-slate-300">
                    <input type="checkbox" checked={data.enabled} onChange={(e) => setData('enabled', e.target.checked)} className="rounded border-slate-600 bg-black text-pink-500" />
                    Activa
                </label>
                <button
                    type="submit"
                    disabled={processing || !isDirty}
                    className="inline-flex items-center gap-1 rounded-lg border border-pink-500/50 px-3 py-1.5 text-xs font-bold text-pink-300 hover:bg-pink-500/10 disabled:opacity-40"
                >
                    {recentlySuccessful ? <Check size={13} /> : null} Guardar
                </button>
            </div>
        </form>
    );
}

export default function Promotions({ promotions, now }) {
    const { flash, auth } = usePage().props;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Descuentos por festivo" />
            <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
                <header>
                    <h1 className="flex items-center gap-2 text-2xl font-black text-white">
                        <BadgePercent className="text-pink-400" /> Descuentos por festivo
                    </h1>
                    <p className="mt-1 text-sm text-slate-400">
                        Se aplican solos en la tienda cuando el festivo está activo en el país del visitante (según Cloudflare). Si coinciden varios, se usa el mayor; con un rango VIP también se aplica el mayor, no se suman. 0% = solo decoración.
                    </p>
                </header>

                <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4 font-mono text-xs text-cyan-100">
                    Ahora mismo para ti ({now.country}): {now.season ? <><SeasonIcon k={now.season.key} /> {now.season.name}</> : 'sin estación'}
                    {now.holiday ? <> · <SeasonIcon k={now.holiday.key} /> {now.holiday.name}</> : ' · sin festivo'}
                    {now.discount > 0 ? ` · -${now.discount}% activo` : ' · sin descuento'}
                </div>

                {flash?.success && <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-200">{flash.success}</div>}

                <div className="space-y-2">
                    {promotions.map((p) => (
                        <Row key={p.id} promo={p} />
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
