import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Check, Gift, Gauge, Power, Server, Users } from 'lucide-react';

const fmtRam = (mb) => (mb >= 1024 ? `${+(mb / 1024).toFixed(1)} GB` : `${mb} MB`);
const fmtDate = (d) => (d ? new Date(d).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—');

function Num({ label, value, onChange, suffix, step = 1, min = 0, hint }) {
    return (
        <label className="block">
            <span className="mb-1 block text-[11px] font-semibold text-slate-300">{label}</span>
            <span className="flex items-center gap-1.5">
                <input
                    type="number"
                    step={step}
                    min={min}
                    value={value}
                    onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full min-w-0 rounded-lg border border-slate-700 bg-black/60 px-2 py-1.5 text-right font-mono text-sm text-white focus:border-yellow-400 focus:ring-0"
                />
                {suffix && <span className="shrink-0 font-mono text-[11px] text-slate-500">{suffix}</span>}
            </span>
            {hint && <span className="mt-1 block text-[10px] text-slate-500">{hint}</span>}
        </label>
    );
}

function Card({ title, children, desc }) {
    return (
        <section className="space-y-3 rounded-2xl border border-slate-800 bg-[#070b18]/90 p-4 sm:p-5">
            <div>
                <h2 className="font-black text-white">{title}</h2>
                {desc && <p className="text-xs text-slate-400">{desc}</p>}
            </div>
            {children}
        </section>
    );
}

export default function Free({ settings, categories, usage, stats, servers, options }) {
    const { flash, errors } = usePage().props;
    const { data, setData, put, processing, isDirty } = useForm(settings);
    const set = (k) => (v) => setData(k, v);
    const toggleCat = (k) =>
        setData('disabled_categories', data.disabled_categories.includes(k) ? data.disabled_categories.filter((c) => c !== k) : [...data.disabled_categories, k]);

    const save = (e) => {
        e.preventDefault();
        put(route('admin.free.update'), { preserveScroll: true });
    };

    const capServers = settings.max_active ? Math.min(100, (usage.servers / settings.max_active) * 100) : 0;
    const capRam = settings.max_total_ram_mb ? Math.min(100, (usage.ram_mb / settings.max_total_ram_mb) * 100) : 0;
    const example = Math.ceil(data.coins_base_day + data.coins_ram_gb_day + (data.coins_cpu_day * 50) / 100 + data.coins_disk_gb_day * 5);

    const tiles = [
        ['Gratis activos', stats.active, Server],
        ['Gratis creados en total', stats.total, Gift],
        ['Personas con gratis', stats.people, Users],
        ['De esos, ya pagan', stats.converted, Check],
        ['Invitados por usuarios', stats.referred_users, Users],
        ['Monedas ganadas (7 días)', stats.coins_earned_week, Gauge],
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Servidores gratis" />
            <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
                <header>
                    <h1 className="flex items-center gap-2 text-2xl font-black text-white"><Gift className="text-yellow-300" /> Servidores gratis</h1>
                    <p className="mt-1 max-w-3xl text-sm text-slate-400">
                        Los clientes eligen el servicio y los recursos que quieran dentro de estos límites. Un gratuito nunca supera al plan de pago más barato de ese servicio, y la capacidad total reservada a gratuitos está acotada para que los de pago siempre vayan primero.
                    </p>
                </header>

                {flash?.success && <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-200">{flash.success}</div>}
                {Object.values(errors ?? {}).length > 0 && (
                    <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-200">{Object.values(errors)[0]}</div>
                )}

                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
                    {tiles.map(([label, value, Icon]) => (
                        <div key={label} className="rounded-xl border border-slate-800 bg-black/40 p-3">
                            <Icon size={16} className="text-yellow-300" />
                            <p className="mt-1 text-2xl font-black text-white">{value}</p>
                            <p className="text-[11px] leading-tight text-slate-400">{label}</p>
                        </div>
                    ))}
                </div>

                <Card title="Capacidad reservada a gratuitos" desc="Cuando se llena, nadie más puede pedir un gratuito hasta que caduque alguno.">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                            <p className="mb-1 font-mono text-xs text-slate-300">Servidores: {usage.servers} / {settings.max_active || '∞'}</p>
                            <div className="h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full bg-yellow-400" style={{ width: `${capServers}%` }} /></div>
                        </div>
                        <div>
                            <p className="mb-1 font-mono text-xs text-slate-300">RAM: {fmtRam(usage.ram_mb)} / {settings.max_total_ram_mb ? fmtRam(settings.max_total_ram_mb) : '∞'}</p>
                            <div className="h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full bg-pink-500" style={{ width: `${capRam}%` }} /></div>
                        </div>
                    </div>
                </Card>

                <form onSubmit={save} className="space-y-6">
                    <Card title="General">
                        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-200">
                            <input type="checkbox" checked={data.enabled} onChange={(e) => setData('enabled', e.target.checked)} className="rounded border-slate-600 bg-black text-yellow-400" />
                            Permitir pedir servidores gratis
                        </label>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <Num label="Gratis activos por persona" value={data.per_user} onChange={set('per_user')} />
                            <Num label="Máx. gratuitos a la vez" value={data.max_active} onChange={set('max_active')} hint="0 = sin límite" />
                            <Num label="RAM total para gratuitos" value={data.max_total_ram_mb} onChange={set('max_total_ram_mb')} suffix="MB" step={512} hint="0 = sin límite" />
                            <Num label="% del plan de pago" value={data.paid_ratio} onChange={set('paid_ratio')} step={0.05} hint="Tope de cada recurso respecto al plan más barato (máx. 0,9)" />
                        </div>
                    </Card>

                    <Card title="Servicios que se ofrecen gratis" desc={`${options} servicios disponibles ahora. Desmarca una categoría para quitarla del modo gratis.`}>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(categories).map(([k, title]) => {
                                const on = !data.disabled_categories.includes(k);
                                return (
                                    <button
                                        key={k}
                                        type="button"
                                        onClick={() => toggleCat(k)}
                                        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${on ? 'border-yellow-400/60 bg-yellow-400/10 text-yellow-200' : 'border-slate-800 text-slate-500 line-through'}`}
                                    >
                                        {title}
                                    </button>
                                );
                            })}
                        </div>
                    </Card>

                    <Card title="Límites por servidor gratuito" desc="Además, nunca pasan del % del plan de pago más barato de ese servicio.">
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            <Num label="RAM máxima" value={data.max_ram_mb} onChange={set('max_ram_mb')} suffix="MB" step={128} />
                            <Num label="CPU máxima" value={data.max_cpu_pct} onChange={set('max_cpu_pct')} suffix="%" step={5} />
                            <Num label="Disco máximo" value={data.max_disk_gb} onChange={set('max_disk_gb')} suffix="GB" />
                            <Num label="RAM mínima" value={data.min_ram_mb} onChange={set('min_ram_mb')} suffix="MB" step={128} />
                            <Num label="CPU mínima" value={data.min_cpu_pct} onChange={set('min_cpu_pct')} suffix="%" step={5} />
                            <Num label="Disco mínimo" value={data.min_disk_gb} onChange={set('min_disk_gb')} suffix="GB" />
                        </div>
                        <label className="block">
                            <span className="mb-1 block text-[11px] font-semibold text-slate-300">Duraciones que se pueden elegir (días, separadas por comas)</span>
                            <input
                                value={data.durations.join(', ')}
                                onChange={(e) => setData('durations', e.target.value.split(',').map((d) => parseInt(d, 10)).filter((d) => d > 0))}
                                className="w-full rounded-lg border border-slate-700 bg-black/60 px-3 py-1.5 font-mono text-sm text-white focus:border-yellow-400 focus:ring-0"
                            />
                        </label>
                    </Card>

                    <Card title="Precio en monedas (por día)" desc={`Ejemplo: 1 GB RAM · 50 % CPU · 5 GB disco = ${example} monedas/día.`}>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <Num label="Base" value={data.coins_base_day} onChange={set('coins_base_day')} />
                            <Num label="Por GB de RAM" value={data.coins_ram_gb_day} onChange={set('coins_ram_gb_day')} />
                            <Num label="Por 100 % de CPU" value={data.coins_cpu_day} onChange={set('coins_cpu_day')} />
                            <Num label="Por GB de disco" value={data.coins_disk_gb_day} onChange={set('coins_disk_gb_day')} />
                        </div>
                    </Card>

                    <Card title="Cómo se ganan monedas">
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <Num label="Monedas por anuncio" value={data.ad_reward} onChange={set('ad_reward')} />
                            <Num label="Anuncios al día" value={data.ads_per_day} onChange={set('ads_per_day')} />
                            <Num label="Tope diario por anuncios" value={data.daily_cap} onChange={set('daily_cap')} />
                            <Num label="Monedas por cada € pagado" value={data.coins_per_euro} onChange={set('coins_per_euro')} />
                        </div>
                        <div>
                            <p className="mb-1 text-[11px] font-semibold text-slate-300">Racha diaria (día 1 a 7)</p>
                            <div className="grid grid-cols-7 gap-1.5">
                                {data.checkin.map((v, i) => (
                                    <input
                                        key={i}
                                        type="number"
                                        min={0}
                                        value={v}
                                        aria-label={`Día ${i + 1}`}
                                        onChange={(e) => setData('checkin', data.checkin.map((x, j) => (j === i ? Number(e.target.value) : x)))}
                                        className="w-full min-w-0 rounded-lg border border-slate-700 bg-black/60 px-1 py-1.5 text-center font-mono text-sm text-white focus:border-yellow-400 focus:ring-0"
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <Num label="Invitar: al que invita" value={data.referral_active} onChange={set('referral_active')} hint="Cuando el invitado empieza a usar la tienda" />
                            <Num label="Invitar: bienvenida al invitado" value={data.referral_welcome} onChange={set('referral_welcome')} />
                            <Num label="Invitar: primera compra" value={data.referral_purchase} onChange={set('referral_purchase')} hint="Al que invita" />
                            <Num label="Monedas para contar como activo" value={data.referral_active_threshold} onChange={set('referral_active_threshold')} hint="Frena las cuentas falsas" />
                        </div>
                    </Card>

                    <div className="sticky bottom-4 z-10 flex justify-end">
                        <button
                            type="submit"
                            disabled={processing || !isDirty}
                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 px-5 py-2.5 font-black text-black shadow-lg hover:brightness-110 disabled:opacity-50"
                        >
                            <Check size={16} /> Guardar ajustes
                        </button>
                    </div>
                </form>

                <Card title={`Quién tiene servidor gratis (${servers.length})`}>
                    {servers.length === 0 ? (
                        <p className="text-sm text-slate-400">Todavía nadie ha pedido un servidor gratis.</p>
                    ) : (
                        <div className="divide-y divide-slate-800">
                            {servers.map((o) => (
                                <div key={o.id} className="flex flex-col gap-2 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-bold text-white">
                                            {o.server_name} <span className="font-normal text-slate-400">· {o.user?.name ?? '—'}</span>
                                        </p>
                                        <p className="truncate font-mono text-[11px] text-slate-400">
                                            {o.egg} · {fmtRam(o.ram_mb ?? 0)} · {o.cpu_pct}% CPU · {o.storage_gb} GB ·{' '}
                                            {o.status === 'active' ? `caduca ${fmtDate(o.renews_at)}` : 'detenido'}
                                        </p>
                                    </div>
                                    {o.status === 'active' && (
                                        <button
                                            type="button"
                                            onClick={() => confirm(`¿Detener «${o.server_name}»?`) && router.post(route('admin.free.suspend', o.id), {}, { preserveScroll: true })}
                                            className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg border border-rose-500/50 px-3 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-500/10 sm:self-auto"
                                        >
                                            <Power size={13} /> Detener
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
