import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import RankIcon, { RankEmblem, VIP_RANKS } from '@/Components/RankIcon';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { fmtPrice, cycleUnit } from '@/lib/price';
import { useMemo, useState } from 'react';
import {
    Box,
    Gamepad2,
    Bot,
    Database,
    Globe,
    ArrowLeft,
    CheckCircle2,
    Zap,
    Cpu,
    HardDrive,
    Server,
    Shield,
    Flame,
    Sparkles,
    Gauge,
    Crosshair,
    Hammer,
    Car,
    Headphones,
    Search,
    Joystick,
    AppWindow,
    Drama,
    Crown,
    Layers,
    LogIn,
    UserPlus,
    Clock,
    Activity
} from 'lucide-react';

const CATEGORY_ICONS = {
    minecraft: Box,
    games: Gamepad2,
    survival: Gamepad2,
    shooters: Crosshair,
    sandbox: Hammer,
    simulation: Car,
    voice: Headphones,
    bots: Bot,
    databases: Database,
    web: Globe,
    roleplay: Drama,
    arcade: Joystick,
    software: AppWindow,
    ranks: Crown,
};

const fmtRam = (mb) => (mb >= 1024 ? `${mb / 1024} GB` : `${mb} MB`);

export default function StoreCategory({ category, plans }) {
    const { auth, billingCycles = [], vipDiscount = 0, season } = usePage().props;
    const promo = season?.discount ?? 0;
    // Se aplica el mayor descuento (festivo o VIP); el VIP no cuenta en los rangos.
    const discountFor = (plan) => {
        const d = plan.role ? promo : Math.max(promo, vipDiscount);
        return { pct: d, label: d > 0 && d === promo ? season?.holiday?.name ?? 'oferta' : 'VIP' };
    };
    const [selected, setSelected] = useState(null);
    const [addonsPlan, setAddonsPlan] = useState(null);
    const availableCycles = billingCycles.filter((c) => plans.some((plan) => plan.prices?.[c.key] != null));
    const [cycle, setCycle] = useState(availableCycles.some((c) => c.key === 'monthly') ? 'monthly' : availableCycles[0]?.key ?? 'monthly');
    const unit = cycleUnit(billingCycles, cycle);
    const { data, setData, post, processing, errors, reset } = useForm({
        plan_id: null,
        server_name: '',
        billing_cycle: 'monthly',
    });

    const CategoryIcon = CATEGORY_ICONS[category.key] || Server;

    // Buscador y orden: hay categorías con decenas de planes (uno por juego).
    const [query, setQuery] = useState('');
    const [sort, setSort] = useState('recommended');
    const [botFilter, setBotFilter] = useState('all');

    const visiblePlans = useMemo(() => {
        let list = [...plans];
        if (category.key === 'bots' && botFilter !== 'all') {
            if (botFilter === 'whatsapp') {
                list = list.filter((p) => `${p.name} ${p.egg ?? ''}`.toLowerCase().includes('whatsapp'));
            } else if (botFilter === 'telegram') {
                list = list.filter((p) => `${p.name} ${p.egg ?? ''}`.toLowerCase().includes('telegram'));
            } else if (botFilter === 'discord') {
                list = list.filter((p) => !`${p.name} ${p.egg ?? ''}`.toLowerCase().includes('whatsapp') && !`${p.name} ${p.egg ?? ''}`.toLowerCase().includes('telegram'));
            }
        }
        const q = query.trim().toLowerCase();
        if (q) {
            list = list.filter((p) => `${p.name} ${p.egg ?? ''}`.toLowerCase().includes(q));
        }
        if (sort === 'price') list.sort((a, b) => (a.prices?.[cycle] ?? Infinity) - (b.prices?.[cycle] ?? Infinity));
        if (sort === 'ram') list.sort((a, b) => b.ram_mb - a.ram_mb);
        if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
        return list;
    }, [plans, query, sort, cycle, category.key, botFilter]);

    const openOrder = (plan) => {
        setSelected(plan);
        setData({
            plan_id: plan.id,
            server_name: '',
            billing_cycle: cycle,
        });
    };

    const close = () => {
        setSelected(null);
        reset();
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('orders.store'), {
            onSuccess: close,
        });
    };

    return (
        <PublicLayout>
            <Head title={`${category.title} - Cinammon Store`} />

            <div className="relative px-4 pt-8 pb-24 sm:px-6 lg:px-8">
                {/* BREADCRUMB & BACK BUTTON */}
                <div className="mx-auto max-w-6xl">
                    <Link
                        href={route('store')}
                        className="inline-flex items-center gap-2 font-mono text-xs font-semibold text-pink-400 transition hover:text-neon"
                    >
                        <ArrowLeft size={14} />
                        <span>// VOLVER AL CATÁLOGO DE SERVIDORES</span>
                    </Link>
                </div>

                {/* HEADER DE LA CATEGORÍA */}
                <header className="mx-auto mt-6 max-w-6xl text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-4 py-1.5 font-mono text-xs text-pink-300 shadow-[0_0_15px_rgba(255,0,128,0.2)]">
                        <CategoryIcon size={14} className="text-neon" />
                        <span>LÍNEA DE SERVICIO: {category.title.toUpperCase()}</span>
                    </div>

                    <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                        {category.title}
                    </h1>
                    <p className="mx-auto mt-3 max-w-2xl text-base text-slate-300 sm:text-lg">
                        {category.tagline}
                    </p>

                    {category.eggs?.length > 0 && (
                        <ul className="mx-auto mt-6 flex max-w-3xl flex-wrap items-center justify-center gap-3" aria-label="Disponibles en esta categoría">
                            {category.eggs.map((egg) => (
                                <li key={egg.name} title={egg.name}>
                                    <img
                                        src={egg.icon}
                                        alt={egg.name}
                                        width={44}
                                        height={44}
                                        loading="lazy"
                                        className="h-11 w-11 rounded-lg border border-slate-700/80 bg-black/40 object-cover shadow-[0_0_12px_oklch(var(--tw-c-neon)_/_0.12)]"
                                        onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }}
                                    />
                                </li>
                            ))}
                        </ul>
                    )}

                    {category.key === 'ranks' && (
                        <ul className="mx-auto mt-6 flex max-w-3xl flex-wrap items-center justify-center gap-3" aria-label="Emblemas de Rangos VIP">
                            {VIP_RANKS.map((r) => (
                                <li
                                    key={r.role}
                                    title={r.label}
                                    className="flex items-center gap-2 rounded-xl border bg-black/60 px-3 py-1.5 font-mono text-xs font-bold text-white"
                                    style={{ borderColor: `${r.color}55`, boxShadow: `0 0 14px ${r.color}22` }}
                                >
                                    <RankIcon role={r.role} size={20} />
                                    <span style={{ color: r.color }}>{r.label.replace(/^VIP\s+/, '')}</span>
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Badge de Clúster en Vivo */}
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3 font-mono text-xs">
                        <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-[#070b18]/80 px-3 py-1 text-slate-300">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span>Nodo: Miami, FL (US-East)</span>
                        </div>
                        <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-[#070b18]/80 px-3 py-1 text-slate-300">
                            <Shield size={12} className="text-neon" />
                            <span>Anti-DDoS Game 2.5 Tbps</span>
                        </div>
                        <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-[#070b18]/80 px-3 py-1 text-slate-300">
                            <Zap size={12} className="text-yellow-400" />
                            <span>Activación en &lt; 60s</span>
                        </div>
                    </div>
                </header>

                {/* BOT PLATFORM FILTER (CATEGORY: BOTS) */}
                {category.key === 'bots' && (
                    <div className="mx-auto mt-8 flex max-w-lg items-center justify-center gap-1.5 rounded-2xl border border-slate-800 bg-[#070b18]/90 p-1.5 font-mono text-xs shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                        {[
                            { id: 'all', label: 'Todos' },
                            { id: 'whatsapp', label: 'WhatsApp', color: '#25D366' },
                            { id: 'telegram', label: 'Telegram', color: '#38bdf8' },
                            { id: 'discord', label: 'Discord & Apps' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setBotFilter(tab.id)}
                                className={`flex-1 rounded-xl py-2 px-3 text-center font-bold transition ${
                                    botFilter === tab.id
                                        ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-white border border-pink-500/40 shadow-[0_0_15px_rgba(255,0,128,0.25)]'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                                style={botFilter === tab.id && tab.color ? { borderColor: `${tab.color}77`, color: tab.color, boxShadow: `0 0 16px ${tab.color}33` } : undefined}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* SELECTOR DE PERÍODO DE FACTURACIÓN */}
                {availableCycles.length > 1 && (
                    <div className="mx-auto mt-10 flex max-w-6xl flex-wrap items-center justify-center gap-2 font-mono text-xs">
                        <span className="mr-1 text-slate-400">Facturación:</span>
                        {availableCycles.map((c) => (
                            <button
                                key={c.key}
                                type="button"
                                onClick={() => setCycle(c.key)}
                                className={`rounded-lg border px-3.5 py-1.5 font-bold transition ${
                                    cycle === c.key
                                        ? 'border-neon bg-neon/10 text-neon shadow-[0_0_12px_oklch(var(--tw-c-neon)_/_0.3)]'
                                        : 'border-slate-700 bg-black/40 text-slate-300 hover:border-pink-500/60 hover:text-pink-300'
                                }`}
                            >
                                {c.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* BUSCADOR */}
                {plans.length > 6 && (
                    <div className="mx-auto mt-8 flex max-w-6xl flex-col gap-3 font-mono text-xs sm:flex-row sm:items-center">
                        <div className="relative flex-1">
                            <Search size={14} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-500" />
                            <input
                                type="search"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={`Buscar entre ${plans.length} planes…`}
                                aria-label="Buscar plan"
                                className="w-full rounded-lg border border-slate-700 bg-black/50 py-2 pr-3 pl-9 text-sm text-white placeholder-slate-500 focus:border-neon focus:outline-none"
                            />
                        </div>
                        <label className="flex items-center gap-2 text-slate-400">
                            Ordenar
                            <select
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                                className="rounded-lg border border-slate-700 bg-black/50 py-2 pr-8 pl-3 text-slate-200 focus:border-neon focus:outline-none"
                            >
                                <option value="recommended">Recomendados</option>
                                <option value="price">Precio: menor a mayor</option>
                                <option value="ram">Más RAM</option>
                                <option value="name">Nombre (A-Z)</option>
                            </select>
                        </label>
                        <span className="text-slate-500">{visiblePlans.length} resultados</span>
                    </div>
                )}

                {visiblePlans.length === 0 && (
                    <p className="mx-auto mt-10 max-w-6xl text-center font-mono text-sm text-slate-400">No hay planes que coincidan con «{query}».</p>
                )}

                {/* GRID DE PLANES */}
                <div className="mx-auto mt-8 grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {visiblePlans.map((plan) => (
                        <div
                            key={plan.id}
                            style={plan.role && plan.perks?.color ? { borderColor: `${plan.perks.color}99`, boxShadow: `0 0 28px ${plan.perks.color}26` } : undefined}
                            className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-7 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 ${
                                plan.popular
                                    ? 'border-neon bg-gradient-to-b from-amber-950/30 via-[#070b18] to-black shadow-[0_0_35px_oklch(var(--tw-c-neon)_/_0.25)] ring-1 ring-neon/40'
                                    : 'border-slate-800 bg-[#070b18]/90 hover:border-pink-500/60 hover:shadow-[0_0_25px_rgba(255,0,128,0.2)]'
                            }`}
                        >
                            {/* Cinta "Popular" */}
                            {plan.popular && (
                                <div className="absolute top-0 right-0">
                                    <div className="flex items-center gap-1 rounded-bl-xl bg-gradient-to-r from-neon to-amber-400 px-3.5 py-1 font-mono text-[10px] font-black uppercase tracking-wider text-black shadow-[0_0_15px_oklch(var(--tw-c-neon)_/_0.6)]">
                                        <Sparkles size={11} />
                                        <span>Recomendado</span>
                                    </div>
                                </div>
                            )}

                            <div>
                                {/* Header del Plan */}
                                <div className="flex items-center gap-4">
                                    {plan.role ? (
                                        <RankEmblem role={plan.role} size="md" />
                                    ) : plan.icon ? (
                                        <img
                                            src={plan.icon}
                                            alt=""
                                            width={56}
                                            height={56}
                                            loading="lazy"
                                            className="h-14 w-14 shrink-0 rounded-xl border border-slate-700/80 bg-black/40 object-cover"
                                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                        />
                                    ) : (plan.name?.toLowerCase().includes('whatsapp') || plan.egg?.toLowerCase().includes('whatsapp')) ? (
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-emerald-500/40 bg-emerald-950/40 text-emerald-400 shadow-[0_0_16px_rgba(37,211,102,0.25)]">
                                            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                                            </svg>
                                        </div>
                                    ) : (plan.name?.toLowerCase().includes('telegram') || plan.egg?.toLowerCase().includes('telegram')) ? (
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-blue-500/40 bg-blue-950/40 text-blue-400 shadow-[0_0_16px_rgba(34,158,217,0.25)]">
                                            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="22" y1="2" x2="11" y2="13" />
                                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                            </svg>
                                        </div>
                                    ) : null}
                                    <div className="min-w-0">
                                        <span className="font-mono text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                                            {plan.role
                                                ? '// RANGO VIP'
                                                : category.key === 'bots'
                                                    ? (plan.name?.toLowerCase().includes('whatsapp') ? '// BOT DE WHATSAPP' : plan.name?.toLowerCase().includes('telegram') ? '// BOT DE TELEGRAM' : '// HOSTING DE BOTS')
                                                    : plan.egg
                                                        ? '// SERVIDOR DE JUEGO'
                                                        : '// PLAN TIER'}
                                        </span>
                                        <h2 className="text-2xl font-black text-white group-hover:text-pink-300 transition-colors">
                                            {plan.name}
                                        </h2>
                                    </div>
                                </div>

                                {/* Precio */}
                                <div className="mt-5 flex items-baseline gap-1.5 border-b border-slate-800/80 pb-5">
                                    {plan.prices?.[cycle] != null ? (
                                        discountFor(plan).pct > 0 ? (
                                            <span className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
                                                <span className="font-mono text-4xl font-black tracking-tight text-white">
                                                    {fmtPrice(plan.prices[cycle] * (100 - discountFor(plan).pct) / 100)} €
                                                </span>
                                                <span className="font-mono text-xs text-slate-400">/ {unit}</span>
                                                <span className="ml-1 font-mono text-xs text-slate-500 line-through">{fmtPrice(plan.prices[cycle])} €</span>
                                                <span className="rounded bg-fuchsia-500/20 px-1.5 py-0.5 font-mono text-[10px] font-bold text-fuchsia-300">-{discountFor(plan).pct}% {discountFor(plan).label}</span>
                                            </span>
                                        ) : (
                                            <>
                                                <span className="font-mono text-4xl font-black tracking-tight text-white">
                                                    {fmtPrice(plan.prices[cycle])} €
                                                </span>
                                                <span className="font-mono text-xs text-slate-400">/ {unit}</span>
                                            </>
                                        )
                                    ) : (
                                        <span className="font-mono text-sm text-slate-400">No disponible por {unit}</span>
                                    )}
                                </div>

                                {/* VENTAJAS DEL RANGO */}
                                {plan.role && (
                                    <div className="mt-5 grid grid-cols-2 gap-2 text-xs">
                                        {[
                                            ['Descuento', plan.perks?.discount ? `${plan.perks.discount}%` : '—'],
                                            ['Backups extra', plan.perks?.backups ? `+${plan.perks.backups}` : '—'],
                                            ['BBDD extra', plan.perks?.databases ? `+${plan.perks.databases}` : '—'],
                                            ['Puertos extra', plan.perks?.allocations ? `+${plan.perks.allocations}` : '—'],
                                        ].map(([label, value]) => (
                                            <div key={label} className="rounded-lg border border-slate-800/80 bg-black/40 px-3 py-2">
                                                <span className="block text-[10px] text-slate-400">{label}</span>
                                                <span className="font-mono text-base font-black" style={{ color: plan.perks?.color ?? '#fff' }}>
                                                    {value}
                                                </span>
                                            </div>
                                        ))}
                                        {plan.perks?.priority && (
                                            <div className="col-span-2 rounded-lg border px-3 py-2 text-center font-mono text-[11px] font-bold" style={{ color: plan.perks.color, borderColor: `${plan.perks.color}66` }}>
                                                ★ SOPORTE PRIORITARIO
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* SPECS CHIPS (RAM / CPU / SSD) */}
                                <div className={`mt-5 space-y-2.5 ${plan.role ? 'hidden' : ''}`}>
                                    <div className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-black/40 px-3 py-2 text-xs">
                                        <div className="flex items-center gap-2 text-slate-300">
                                            <Cpu size={14} className="text-neon" />
                                            <span>Memoria RAM</span>
                                        </div>
                                        <span className="font-mono font-bold text-white">
                                            {fmtRam(plan.ram_mb)} DDR5
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-black/40 px-3 py-2 text-xs">
                                        <div className="flex items-center gap-2 text-slate-300">
                                            <Zap size={14} className="text-pink-400" />
                                            <span>Capacidad CPU</span>
                                        </div>
                                        <span className="font-mono font-bold text-white">
                                            {plan.cpu_pct}% vCPU
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-black/40 px-3 py-2 text-xs">
                                        <div className="flex items-center gap-2 text-slate-300">
                                            <HardDrive size={14} className="text-purple-400" />
                                            <span>Almacenamiento</span>
                                        </div>
                                        <span className="font-mono font-bold text-white">
                                            {plan.storage_gb} GB NVMe
                                        </span>
                                    </div>
                                </div>

                                {/* FEATURES CHECKLIST */}
                                <div className="mt-6 border-t border-slate-800/80 pt-5">
                                    <span className="block font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                        // CARACTERÍSTICAS INCLUIDAS
                                    </span>
                                    <ul className="mt-3 space-y-2 text-xs text-slate-300">
                                        {(plan.features || []).map((feature, idx) => (
                                            <li key={idx} className="flex items-center gap-2">
                                                <CheckCircle2
                                                    size={13}
                                                    className={plan.popular ? 'text-neon' : 'text-pink-400'}
                                                />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2
                                                size={13}
                                                className={plan.popular ? 'text-neon' : 'text-pink-400'}
                                            />
                                            <span>Consola Cinammon 2.0 en Tiempo Real</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* BOTÓN CONTRATAR */}
                            <div className="mt-8 space-y-2.5 pt-2">
                                {(plan.addons || []).length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setAddonsPlan(plan)}
                                        className="w-full flex items-center justify-center gap-2 rounded-xl border border-neon/40 bg-neon/5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-neon transition-all duration-200 hover:border-neon hover:bg-neon/15 hover:shadow-[0_0_20px_oklch(var(--tw-c-neon)_/_0.3)]"
                                    >
                                        <Layers size={14} />
                                        <span>Ver complementos</span>
                                    </button>
                                )}
                                <button
                                    onClick={() => openOrder(plan)}
                                    disabled={plan.prices?.[cycle] == null}
                                    className={`w-full flex disabled:cursor-not-allowed disabled:opacity-40 items-center justify-center gap-2 rounded-xl py-3 font-mono text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                                        plan.popular
                                            ? 'bg-gradient-to-r from-neon to-amber-400 text-black shadow-[0_0_20px_oklch(var(--tw-c-neon)_/_0.4)] hover:brightness-110 hover:shadow-[0_0_30px_oklch(var(--tw-c-neon)_/_0.6)]'
                                            : 'border border-pink-500/40 bg-pink-500/10 text-pink-300 shadow-[0_0_15px_rgba(255,0,128,0.15)] hover:border-pink-500 hover:bg-pink-500 hover:text-white hover:shadow-[0_0_25px_rgba(255,0,128,0.4)]'
                                    }`}
                                >
                                    {plan.role ? <RankIcon role={plan.role} size={15} /> : <Zap size={14} />}
                                    <span>{plan.role ? 'Activar Rango VIP' : 'Desplegar Servidor'}</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* MODAL DE COMPLEMENTOS INCLUIDOS */}
                <Modal show={addonsPlan !== null} onClose={() => setAddonsPlan(null)} maxWidth="md">
                    {addonsPlan && (
                        <div className="relative overflow-hidden bg-[#070b18] p-6 sm:p-8 font-sans text-white border border-neon/30">
                            <div className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full bg-neon/10 blur-3xl" />

                            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-neon/40 bg-neon/10 text-neon">
                                        <Layers size={20} />
                                    </div>
                                    <div>
                                        <span className="font-mono text-[10px] uppercase tracking-wider text-neon">
                                            // COMPLEMENTOS INCLUIDOS
                                        </span>
                                        <h3 className="text-lg font-bold text-white">
                                            {category.title} — {addonsPlan.name}
                                        </h3>
                                    </div>
                                </div>
                            </div>

                            <ul className="mt-5 space-y-3">
                                {(addonsPlan.addons || []).map((addon, idx) => (
                                    <li
                                        key={idx}
                                        className="flex items-start gap-3 rounded-xl border border-slate-800 bg-black/60 px-4 py-3"
                                    >
                                        <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-neon" />
                                        <div>
                                            <p className="text-sm font-bold text-white">{addon.name}</p>
                                            {addon.desc && (
                                                <p className="mt-0.5 text-xs text-slate-400">{addon.desc}</p>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-800 pt-5">
                                <SecondaryButton
                                    type="button"
                                    onClick={() => setAddonsPlan(null)}
                                    className="border-slate-700 bg-neutral-900 text-slate-300 hover:border-slate-500"
                                >
                                    Cerrar
                                </SecondaryButton>
                                <PrimaryButton
                                    type="button"
                                    onClick={() => {
                                        const plan = addonsPlan;
                                        setAddonsPlan(null);
                                        openOrder(plan);
                                    }}
                                    disabled={addonsPlan.prices?.[cycle] == null}
                                    className="border border-neon bg-gradient-to-r from-pink-500 to-fuchsia-600 font-mono text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(255,0,128,0.4)] hover:brightness-110"
                                >
                                    Desplegar Servidor
                                </PrimaryButton>
                            </div>
                        </div>
                    )}
                </Modal>

                {/* MODAL DE CONTRATACIÓN CYBERPUNK */}
                <Modal show={selected !== null} onClose={close} maxWidth="md">
                    {selected && (
                        <div className="relative overflow-hidden bg-[#070b18] p-6 sm:p-8 font-sans text-white border border-pink-500/30">
                            {/* Brillo ambiental */}
                            <div className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full bg-neon/10 blur-3xl" />

                            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                                <div className="flex items-center gap-3">
                                    {selected.role ? (
                                        <RankEmblem role={selected.role} size="sm" />
                                    ) : (
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-pink-500/40 bg-pink-500/10 text-pink-400">
                                            <CategoryIcon size={20} />
                                        </div>
                                    )}
                                    <div>
                                        <span className="font-mono text-[10px] uppercase tracking-wider text-pink-400">
                                            {selected.role ? '// SUSCRIPCIÓN RANGO VIP' : '// NUEVA INSTANCIA WINGS'}
                                        </span>
                                        <h3 className="text-lg font-bold text-white">
                                            {category.title} — {selected.name}
                                        </h3>
                                    </div>
                                </div>
                            </div>

                            {/* Resumen del Plan */}
                            <div className="mt-5 rounded-xl border border-slate-800 bg-black/60 p-4 font-mono text-xs">
                                {selected.role ? (
                                    <>
                                        <div className="flex items-center justify-between text-slate-300">
                                            <span>Descuento en tienda:</span>
                                            <span className="font-bold text-white">{selected.perks?.discount ? `-${selected.perks.discount}% en servidores` : 'Insignia exclusiva'}</span>
                                        </div>
                                        <div className="mt-2 flex items-center justify-between text-slate-300">
                                            <span>Extras en servidores:</span>
                                            <span className="font-bold text-white">
                                                +{selected.perks?.backups ?? 0} backups · +{selected.perks?.databases ?? 0} BBDD · +{selected.perks?.allocations ?? 0} puertos
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center justify-between text-slate-300">
                                            <span>Recursos:</span>
                                            <span className="font-bold text-white">
                                                {fmtRam(selected.ram_mb)} RAM · {selected.storage_gb} GB NVMe
                                            </span>
                                        </div>
                                        <div className="mt-2 flex items-center justify-between text-slate-300">
                                            <span>Capacidad CPU:</span>
                                            <span className="font-bold text-white">{selected.cpu_pct}% vCPU Ryzen</span>
                                        </div>
                                        <div className="mt-2 flex items-center justify-between text-slate-300">
                                            <span>Nodo Datacenter:</span>
                                            <span className="text-neon">Miami, FL US-01</span>
                                        </div>
                                    </>
                                )}
                                <div className="mt-3 border-t border-slate-800 pt-2 flex items-center justify-between">
                                    <span className="text-slate-400">Total por {cycleUnit(billingCycles, data.billing_cycle)}:</span>
                                    <span className="text-lg font-black text-neon">
                                        {fmtPrice((selected.prices?.[data.billing_cycle] ?? selected.price) * (100 - discountFor(selected).pct) / 100)} €
                                    </span>
                                </div>
                            </div>

                            {auth?.user ? (
                                <form onSubmit={submit} className="mt-6 space-y-5">
                                    {selected.role ? (
                                        <div className="rounded-lg border border-fuchsia-500/40 bg-fuchsia-500/10 p-3 font-mono text-xs text-fuchsia-200">
                                            El rango se activa en tu cuenta del panel en cuanto pagues la factura y dura el período elegido.
                                            <InputError message={errors.plan_id} className="mt-1" />
                                            <InputError message={errors.billing_cycle} className="mt-1" />
                                        </div>
                                    ) : (
                                    <div>
                                        <InputLabel
                                            htmlFor="server_name"
                                            value="// NOMBRE IDENTIFICADOR DEL SERVIDOR"
                                            className="font-mono text-xs text-pink-400"
                                        />
                                        <TextInput
                                            id="server_name"
                                            className="mt-2 block w-full border-pink-500/40 bg-black/80 font-mono text-sm text-white placeholder-slate-600 focus:border-neon focus:ring-neon"
                                            value={data.server_name}
                                            onChange={(e) => setData('server_name', e.target.value)}
                                            placeholder="ej. survival-smp-v2"
                                            isFocused
                                            required
                                        />
                                        <p className="mt-1.5 font-mono text-[10px] text-slate-400">
                                            Puedes cambiar este nombre en cualquier momento desde el Panel.
                                        </p>
                                        <InputError message={errors.server_name} className="mt-1" />
                                        <InputError message={errors.plan_id} className="mt-1" />
                                        <InputError message={errors.billing_cycle} className="mt-1" />
                                    </div>
                                    )}

                                    <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-5">
                                        <SecondaryButton
                                            type="button"
                                            onClick={close}
                                            className="border-slate-700 bg-neutral-900 text-slate-300 hover:border-slate-500"
                                        >
                                            Cancelar
                                        </SecondaryButton>
                                        <PrimaryButton
                                            disabled={processing}
                                            className="border border-neon bg-gradient-to-r from-pink-500 to-fuchsia-600 font-mono text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(255,0,128,0.4)] hover:brightness-110"
                                        >
                                            {processing ? 'Desplegando...' : 'Confirmar y Desplegar'}
                                        </PrimaryButton>
                                    </div>
                                </form>
                            ) : (
                                <div className="mt-6 space-y-4">
                                    <div className="rounded-xl border border-pink-500/30 bg-pink-500/10 p-4 text-xs leading-relaxed text-pink-200">
                                        Para aprovisionar tu contenedor Wings necesitas una cuenta en Cinammon.
                                        Podrás acceder al panel de control, gestionar los archivos de tu servidor y ver tu consola en tiempo real.
                                    </div>

                                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                                        <Link href={route('register')} className="w-full sm:w-auto">
                                            <SecondaryButton className="w-full justify-center border-slate-700 bg-neutral-900 text-slate-300">
                                                <UserPlus size={14} className="mr-1.5" />
                                                Crear Cuenta
                                            </SecondaryButton>
                                        </Link>
                                        <Link href={route('login')} className="w-full sm:w-auto">
                                            <PrimaryButton className="w-full justify-center">
                                                <LogIn size={14} className="mr-1.5" />
                                                Iniciar Sesión
                                            </PrimaryButton>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </Modal>
            </div>
        </PublicLayout>
    );
}
