import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { fmtPrice, cycleUnit } from '@/lib/price';
import { useState } from 'react';
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
};

const fmtRam = (mb) => (mb >= 1024 ? `${mb / 1024} GB` : `${mb} MB`);

export default function StoreCategory({ category, plans }) {
    const { auth, billingCycles = [] } = usePage().props;
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
                        className="inline-flex items-center gap-2 font-mono text-xs font-semibold text-pink-400 transition hover:text-[#00f7ff]"
                    >
                        <ArrowLeft size={14} />
                        <span>// VOLVER AL CATÁLOGO DE SERVIDORES</span>
                    </Link>
                </div>

                {/* HEADER DE LA CATEGORÍA */}
                <header className="mx-auto mt-6 max-w-6xl text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-4 py-1.5 font-mono text-xs text-pink-300 shadow-[0_0_15px_rgba(255,0,128,0.2)]">
                        <CategoryIcon size={14} className="text-[#00f7ff]" />
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
                                        className="h-11 w-11 rounded-lg border border-slate-700/80 bg-black/40 object-cover shadow-[0_0_12px_rgba(0,247,255,0.12)]"
                                        onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }}
                                    />
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
                            <Shield size={12} className="text-[#00f7ff]" />
                            <span>Anti-DDoS Game 2.5 Tbps</span>
                        </div>
                        <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-[#070b18]/80 px-3 py-1 text-slate-300">
                            <Zap size={12} className="text-yellow-400" />
                            <span>Activación en &lt; 60s</span>
                        </div>
                    </div>
                </header>

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
                                        ? 'border-[#00f7ff] bg-[#00f7ff]/10 text-[#00f7ff] shadow-[0_0_12px_rgba(0,247,255,0.3)]'
                                        : 'border-slate-700 bg-black/40 text-slate-300 hover:border-pink-500/60 hover:text-pink-300'
                                }`}
                            >
                                {c.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* GRID DE PLANES */}
                <div className="mx-auto mt-8 grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-7 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 ${
                                plan.popular
                                    ? 'border-[#00f7ff] bg-gradient-to-b from-cyan-950/30 via-[#070b18] to-black shadow-[0_0_35px_rgba(0,247,255,0.25)] ring-1 ring-[#00f7ff]/40'
                                    : 'border-slate-800 bg-[#070b18]/90 hover:border-pink-500/60 hover:shadow-[0_0_25px_rgba(255,0,128,0.2)]'
                            }`}
                        >
                            {/* Cinta "Popular" */}
                            {plan.popular && (
                                <div className="absolute top-0 right-0">
                                    <div className="flex items-center gap-1 rounded-bl-xl bg-gradient-to-r from-[#00f7ff] to-cyan-400 px-3.5 py-1 font-mono text-[10px] font-black uppercase tracking-wider text-black shadow-[0_0_15px_rgba(0,247,255,0.6)]">
                                        <Sparkles size={11} />
                                        <span>Recomendado</span>
                                    </div>
                                </div>
                            )}

                            <div>
                                {/* Header del Plan */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="font-mono text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                                            // PLAN TIER
                                        </span>
                                        <h2 className="text-2xl font-black text-white group-hover:text-pink-300 transition-colors">
                                            {plan.name}
                                        </h2>
                                    </div>
                                </div>

                                {/* Precio */}
                                <div className="mt-5 flex items-baseline gap-1.5 border-b border-slate-800/80 pb-5">
                                    {plan.prices?.[cycle] != null ? (
                                        <>
                                            <span className="font-mono text-4xl font-black tracking-tight text-white">
                                                {fmtPrice(plan.prices[cycle])} €
                                            </span>
                                            <span className="font-mono text-xs text-slate-400">/ {unit}</span>
                                        </>
                                    ) : (
                                        <span className="font-mono text-sm text-slate-400">No disponible por {unit}</span>
                                    )}
                                </div>

                                {/* SPECS CHIPS (RAM / CPU / SSD) */}
                                <div className="mt-5 space-y-2.5">
                                    <div className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-black/40 px-3 py-2 text-xs">
                                        <div className="flex items-center gap-2 text-slate-300">
                                            <Cpu size={14} className="text-[#00f7ff]" />
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
                                                    className={plan.popular ? 'text-[#00f7ff]' : 'text-pink-400'}
                                                />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                        <li className="flex items-center gap-2">
                                            <CheckCircle2
                                                size={13}
                                                className={plan.popular ? 'text-[#00f7ff]' : 'text-pink-400'}
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
                                        className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#00f7ff]/40 bg-[#00f7ff]/5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-[#00f7ff] transition-all duration-200 hover:border-[#00f7ff] hover:bg-[#00f7ff]/15 hover:shadow-[0_0_20px_rgba(0,247,255,0.3)]"
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
                                            ? 'bg-gradient-to-r from-[#00f7ff] to-cyan-400 text-black shadow-[0_0_20px_rgba(0,247,255,0.4)] hover:brightness-110 hover:shadow-[0_0_30px_rgba(0,247,255,0.6)]'
                                            : 'border border-pink-500/40 bg-pink-500/10 text-pink-300 shadow-[0_0_15px_rgba(255,0,128,0.15)] hover:border-pink-500 hover:bg-pink-500 hover:text-white hover:shadow-[0_0_25px_rgba(255,0,128,0.4)]'
                                    }`}
                                >
                                    <Zap size={14} />
                                    <span>Desplegar Servidor</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* MODAL DE COMPLEMENTOS INCLUIDOS */}
                <Modal show={addonsPlan !== null} onClose={() => setAddonsPlan(null)} maxWidth="md">
                    {addonsPlan && (
                        <div className="relative overflow-hidden bg-[#070b18] p-6 sm:p-8 font-sans text-white border border-[#00f7ff]/30">
                            <div className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full bg-[#00f7ff]/10 blur-3xl" />

                            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#00f7ff]/40 bg-[#00f7ff]/10 text-[#00f7ff]">
                                        <Layers size={20} />
                                    </div>
                                    <div>
                                        <span className="font-mono text-[10px] uppercase tracking-wider text-[#00f7ff]">
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
                                        <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#00f7ff]" />
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
                                    className="border border-[#00f7ff] bg-gradient-to-r from-pink-500 to-fuchsia-600 font-mono text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(255,0,128,0.4)] hover:brightness-110"
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
                            <div className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full bg-[#00f7ff]/10 blur-3xl" />

                            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-pink-500/40 bg-pink-500/10 text-pink-400">
                                        <CategoryIcon size={20} />
                                    </div>
                                    <div>
                                        <span className="font-mono text-[10px] uppercase tracking-wider text-pink-400">
                                            // NUEVA INSTANCIA WINGS
                                        </span>
                                        <h3 className="text-lg font-bold text-white">
                                            {category.title} — {selected.name}
                                        </h3>
                                    </div>
                                </div>
                            </div>

                            {/* Resumen del Plan */}
                            <div className="mt-5 rounded-xl border border-slate-800 bg-black/60 p-4 font-mono text-xs">
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
                                    <span className="text-[#00f7ff]">Miami, FL US-01</span>
                                </div>
                                <div className="mt-3 border-t border-slate-800 pt-2 flex items-center justify-between">
                                    <span className="text-slate-400">Total por {cycleUnit(billingCycles, data.billing_cycle)}:</span>
                                    <span className="text-lg font-black text-[#00f7ff]">
                                        {fmtPrice(selected.prices?.[data.billing_cycle] ?? selected.price)} €
                                    </span>
                                </div>
                            </div>

                            {auth?.user ? (
                                <form onSubmit={submit} className="mt-6 space-y-5">
                                    <div>
                                        <InputLabel
                                            htmlFor="server_name"
                                            value="// NOMBRE IDENTIFICADOR DEL SERVIDOR"
                                            className="font-mono text-xs text-pink-400"
                                        />
                                        <TextInput
                                            id="server_name"
                                            className="mt-2 block w-full border-pink-500/40 bg-black/80 font-mono text-sm text-white placeholder-slate-600 focus:border-[#00f7ff] focus:ring-[#00f7ff]"
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
                                            className="border border-[#00f7ff] bg-gradient-to-r from-pink-500 to-fuchsia-600 font-mono text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_20px_rgba(255,0,128,0.4)] hover:brightness-110"
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
