import { RankEmblem } from '@/Components/RankIcon';
import { fmtPrice } from '@/lib/price';
import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Cake, Check, Cpu, Dices, HardDrive, LogIn, MapPin, Orbit, PenLine, Plane, Sparkles, Ticket, UserPlus, X, Zap } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/*
 * Secuencia de lanzamiento: sustituye al antiguo modal de pedido.
 * 1. Órbita  — eliges cada cuánto pagas y ves cuánto ahorras de verdad.
 * 2. Bautizo — nombre del servidor (con dado de nombres por categoría).
 * 3. Billete — tarjeta de embarque con todos los descuentos a la vista; se mantiene pulsado para reservar.
 * Al reservar se pasa directo al pago (ya no se vuelve al dashboard).
 */

const fmtRam = (mb) => (mb >= 1024 ? `${+(mb / 1024).toFixed(1)} GB` : `${mb} MB`);

const NAME_PARTS = {
    minecraft: [['aldea', 'reino', 'isla', 'bloque', 'creeper', 'bioma', 'portal', 'mina'], ['neon', 'norte', 'eterna', 'salvaje', 'dorada', 'perdida', 'cyber', 'canela']],
    bots: [['bot', 'droide', 'eco', 'chispa', 'vigia', 'nexo', 'pulso', 'radar'], ['canela', 'neon', 'turbo', 'nocturno', 'beta', 'prime', 'zero', 'astral']],
    web: [['sitio', 'portal', 'escaparate', 'blog', 'rincon', 'faro', 'atlas', 'nido'], ['canela', 'digital', 'neon', 'creativo', 'central', 'vivo', 'nube', 'pixel']],
    databases: [['datos', 'boveda', 'archivo', 'indice', 'cripta', 'memoria', 'nucleo', 'registro'], ['central', 'segura', 'neon', 'prime', 'norte', 'canela', 'alfa', 'zen']],
    default: [['base', 'arena', 'fortaleza', 'frontera', 'refugio', 'colonia', 'distrito', 'puesto'], ['neon', 'salvaje', 'canela', 'omega', 'nocturna', 'roja', 'astral', 'prime']],
};

function randomName(category) {
    const [a, b] = NAME_PARTS[category] ?? NAME_PARTS.default;
    const pick = (list) => list[Math.floor(Math.random() * list.length)];
    return `${pick(a)}-${pick(b)}-${Math.floor(Math.random() * 90 + 10)}`;
}

/** Botón que hay que mantener pulsado (evita pedidos por un clic sin querer). Con teclado basta Enter o Espacio. */
function HoldButton({ onConfirm, disabled, children }) {
    const [progress, setProgress] = useState(0);
    const raf = useRef(null);
    const start = useRef(0);
    const HOLD_MS = 900;

    const stop = useCallback(() => {
        cancelAnimationFrame(raf.current);
        raf.current = null;
        setProgress(0);
    }, []);

    const tick = useCallback(() => {
        const p = Math.min(1, (performance.now() - start.current) / HOLD_MS);
        setProgress(p);
        if (p >= 1) {
            raf.current = null;
            onConfirm();
            return;
        }
        raf.current = requestAnimationFrame(tick);
    }, [onConfirm]);

    const begin = (e) => {
        if (disabled || raf.current) return;
        e.preventDefault();
        start.current = performance.now();
        raf.current = requestAnimationFrame(tick);
    };

    useEffect(() => () => cancelAnimationFrame(raf.current), []);

    return (
        <button
            type="button"
            disabled={disabled}
            onPointerDown={begin}
            onPointerUp={() => progress < 1 && stop()}
            onPointerLeave={() => progress < 1 && stop()}
            onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
                    e.preventDefault();
                    onConfirm();
                }
            }}
            className="launch-hold relative w-full select-none overflow-hidden rounded-xl border border-neon/60 bg-black/60 py-4 font-mono text-sm font-bold uppercase tracking-widest text-white transition disabled:opacity-50"
            style={{ touchAction: 'none' }}
        >
            <span className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-500 to-fuchsia-600" style={{ width: `${progress * 100}%` }} aria-hidden />
            <span className="relative flex items-center justify-center gap-2">{children}</span>
        </button>
    );
}

export default function LaunchSequence({ plan, category, CategoryIcon, cycles, initialCycle, initialName = '', discounts, user, onClose, startAtTicket = false }) {
    const isRank = !!plan.role;
    const steps = isRank
        ? [{ key: 'orbit', label: 'Órbita', icon: Orbit }, { key: 'ticket', label: 'Billete', icon: Ticket }]
        : [{ key: 'orbit', label: 'Órbita', icon: Orbit }, { key: 'name', label: 'Bautizo', icon: PenLine }, { key: 'ticket', label: 'Billete', icon: Ticket }];

    const planCycles = useMemo(() => cycles.filter((c) => plan.prices?.[c.key] != null), [cycles, plan]);
    const firstCycle = planCycles.some((c) => c.key === initialCycle) ? initialCycle : planCycles.find((c) => c.key === 'monthly')?.key ?? planCycles[0]?.key;

    const { data, setData, post, processing, errors } = useForm({ plan_id: plan.id, server_name: initialName, billing_cycle: firstCycle });
    const [step, setStep] = useState(startAtTicket && (isRank || initialName) ? steps.length - 1 : 0);
    const [launching, setLaunching] = useState(false);
    const current = steps[step].key;

    // Si el servidor rechaza algo, se vuelve a la etapa del campo con error
    useEffect(() => {
        if (errors.server_name) setStep(steps.findIndex((s) => s.key === 'name'));
        else if (errors.billing_cycle) setStep(0);
    }, [errors]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const onKey = (e) => e.key === 'Escape' && !processing && onClose();
        window.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [onClose, processing]);

    // Descuentos candidatos: solo se aplica el mayor (igual que OrderController)
    const candidates = [
        discounts.promo > 0 && { key: 'promo', label: discounts.promoLabel || 'Oferta', pct: discounts.promo, icon: Sparkles },
        !isRank && discounts.vip > 0 && { key: 'vip', label: 'Tu rango VIP', pct: discounts.vip, icon: Zap },
        discounts.birthday > 0 && { key: 'birthday', label: 'Regalo de cumpleaños (1 uso)', pct: discounts.birthday, icon: Cake },
    ].filter(Boolean);
    const best = candidates.reduce((a, c) => (c.pct > (a?.pct ?? 0) ? c : a), null);
    const pct = best?.pct ?? 0;

    const priceOf = (key) => (plan.prices?.[key] ?? 0) * (100 - pct) / 100;
    const monthlyBase = plan.prices?.monthly != null ? priceOf('monthly') : null;
    const perMonth = (c) => priceOf(c.key) / c.factor;
    const saving = (c) => (monthlyBase ? Math.round((1 - perMonth(c) / monthlyBase) * 100) : 0);
    const chosen = planCycles.find((c) => c.key === data.billing_cycle) ?? planCycles[0];
    const maxPerMonth = Math.max(...planCycles.map(perMonth));
    const total = priceOf(chosen.key);
    const before = plan.prices?.[chosen.key] ?? 0;

    const canNext = current !== 'name' || data.server_name.trim().length >= 2;
    const next = () => canNext && setStep((s) => Math.min(steps.length - 1, s + 1));
    const back = () => setStep((s) => Math.max(0, s - 1));

    const launch = () => {
        setLaunching(true);
        post(route('orders.store'), { onFinish: () => setLaunching(false) });
    };

    const resumeUrl = route('store.resume', { plan: plan.id, cycle: data.billing_cycle, ...(data.server_name ? { name: data.server_name } : {}) });

    // Portal al <body>: dentro de la página quedaba bajo la cabecera y la pastilla de temporada
    return createPortal(
        <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/80 backdrop-blur-sm sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={`Contratar ${plan.name}`}>
            <style>{CSS}</style>
            <div className="launch-panel relative flex max-h-[100dvh] w-full max-w-3xl flex-col overflow-hidden border border-pink-500/30 bg-[#070b18] text-white sm:max-h-[92vh] sm:rounded-2xl">
                <div className="launch-stars pointer-events-none absolute inset-0" aria-hidden />

                {/* Cabecera + raíl de etapas */}
                <header className="relative border-b border-slate-800 px-5 pt-5 pb-4 sm:px-8">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                            {isRank ? (
                                <RankEmblem role={plan.role} size="sm" />
                            ) : plan.icon ? (
                                <img src={plan.icon} alt="" className="h-10 w-10 rounded-lg border border-pink-500/40 object-cover" />
                            ) : (
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-pink-500/40 bg-pink-500/10 text-pink-400">
                                    <CategoryIcon size={20} />
                                </div>
                            )}
                            <div className="min-w-0">
                                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-pink-400">Secuencia de lanzamiento</p>
                                <h3 className="truncate text-lg font-bold">
                                    {category.title} · {plan.name}
                                </h3>
                            </div>
                        </div>
                        <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white" aria-label="Cerrar">
                            <X size={18} />
                        </button>
                    </div>

                    <ol className="mt-5 flex items-center gap-2">
                        {steps.map((s, i) => {
                            const Icon = s.icon;
                            const done = i < step;
                            const active = i === step;
                            return (
                                <li key={s.key} className="flex flex-1 items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => i <= step && setStep(i)}
                                        disabled={i > step}
                                        className={`flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition ${
                                            active ? 'border-neon bg-neon/10 text-neon' : done ? 'border-pink-500/50 text-pink-300 hover:border-pink-400' : 'border-slate-800 text-slate-500'
                                        }`}
                                        aria-current={active ? 'step' : undefined}
                                    >
                                        {done ? <Check size={13} /> : <Icon size={13} />}
                                        <span className="hidden sm:inline">{i + 1}. {s.label}</span>
                                        <span className="sm:hidden">{i + 1}</span>
                                    </button>
                                    {i < steps.length - 1 && <span className={`h-px flex-1 ${done ? 'bg-pink-500/60' : 'bg-slate-800'}`} />}
                                </li>
                            );
                        })}
                    </ol>
                </header>

                <div className="relative flex-1 overflow-y-auto px-5 py-6 sm:px-8">
                    {/* 1. ÓRBITA: cada cuánto pagas */}
                    {current === 'orbit' && (
                        <section key="orbit" className="launch-stage space-y-4">
                            <div>
                                <h4 className="text-xl font-bold">¿Cada cuánto quieres pagar?</h4>
                                <p className="text-sm text-slate-400">Cuanto más larga la órbita, menos pagas al mes. Puedes cancelar cuando quieras.</p>
                            </div>
                            <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Periodo de pago">
                                {planCycles.map((c) => {
                                    const on = c.key === data.billing_cycle;
                                    const sv = saving(c);
                                    return (
                                        <button
                                            key={c.key}
                                            type="button"
                                            role="radio"
                                            aria-checked={on}
                                            onClick={() => setData('billing_cycle', c.key)}
                                            onDoubleClick={next}
                                            className={`group relative grid grid-cols-[1fr_auto] items-center gap-x-4 overflow-hidden rounded-xl border px-4 py-3 text-left transition ${
                                                on ? 'border-neon bg-neon/5' : 'border-slate-800 bg-black/40 hover:border-pink-500/50'
                                            }`}
                                        >
                                            {/* Barra: coste equivalente al mes (más corta = más barato) */}
                                            <span className={`absolute inset-y-0 left-0 ${on ? 'bg-neon/10' : 'bg-white/[0.03]'}`} style={{ width: `${Math.max(8, (perMonth(c) / maxPerMonth) * 100)}%` }} aria-hidden />
                                            <span className="relative">
                                                <span className="flex items-center gap-2 font-semibold">
                                                    {c.label}
                                                    {sv >= 3 && <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-400">ahorras {sv}%</span>}
                                                </span>
                                                <span className="font-mono text-[11px] text-slate-400">
                                                    {c.key === 'monthly' || !monthlyBase ? `se renueva cada ${c.unit}` : `≈ ${fmtPrice(perMonth(c))} €/mes`}
                                                </span>
                                            </span>
                                            <span className="relative text-right">
                                                <span className="block font-mono text-lg font-black">{fmtPrice(priceOf(c.key))} €</span>
                                                <span className="font-mono text-[10px] text-slate-500">/ {c.unit}</span>
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {/* 2. BAUTIZO: nombre del servidor */}
                    {current === 'name' && (
                        <section key="name" className="launch-stage space-y-5">
                            <div>
                                <h4 className="text-xl font-bold">Ponle nombre a tu servidor</h4>
                                <p className="text-sm text-slate-400">Así lo verás en el panel. Lo puedes cambiar cuando quieras.</p>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    autoFocus
                                    value={data.server_name}
                                    onChange={(e) => setData('server_name', e.target.value.slice(0, 60))}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), next())}
                                    placeholder="survival-smp"
                                    maxLength={60}
                                    className="min-w-0 flex-1 rounded-xl border border-pink-500/40 bg-black/70 px-4 py-3 font-mono text-base text-white placeholder-slate-600 focus:border-neon focus:outline-none focus:ring-0"
                                    aria-label="Nombre del servidor"
                                />
                                <button
                                    type="button"
                                    onClick={() => setData('server_name', randomName(category.key))}
                                    className="launch-dice flex items-center gap-2 rounded-xl border border-slate-700 px-4 font-mono text-xs uppercase text-slate-300 hover:border-neon hover:text-neon"
                                    title="Sugerir un nombre"
                                >
                                    <Dices size={18} /> <span className="hidden sm:inline">Dado</span>
                                </button>
                            </div>
                            {errors.server_name && <p className="text-xs text-red-400">{errors.server_name}</p>}

                            {/* Vista previa de cómo aparecerá en el panel */}
                            <div className="rounded-xl border border-slate-800 bg-black/50 p-4">
                                <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-slate-500">Así aparecerá en tu panel</p>
                                <div className="flex items-center gap-3">
                                    <span className="relative flex h-2.5 w-2.5">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                                    </span>
                                    <span className="truncate font-mono font-bold">{data.server_name.trim() || 'tu-servidor'}</span>
                                    <span className="ml-auto shrink-0 font-mono text-[11px] text-slate-500">{plan.egg || plan.name}</span>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-slate-400">
                                    <span className="flex items-center gap-1"><Zap size={12} className="text-pink-400" /> {fmtRam(plan.ram_mb)} RAM</span>
                                    <span className="flex items-center gap-1"><Cpu size={12} className="text-pink-400" /> {plan.cpu_pct}% vCPU</span>
                                    <span className="flex items-center gap-1"><HardDrive size={12} className="text-pink-400" /> {plan.storage_gb} GB NVMe</span>
                                    <span className="flex items-center gap-1"><MapPin size={12} className="text-pink-400" /> Miami, US</span>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* 3. BILLETE: tarjeta de embarque */}
                    {current === 'ticket' && (
                        <section key="ticket" className="launch-stage space-y-5">
                            <div className="launch-ticket relative overflow-hidden rounded-2xl border border-pink-500/40 bg-gradient-to-br from-[#12081c] to-[#0a1024]">
                                <div className="grid sm:grid-cols-[1fr_190px]">
                                    <div className="p-5">
                                        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.25em] text-pink-300">
                                            <span>Tarjeta de embarque</span>
                                            <span>Cinammon Air</span>
                                        </div>
                                        <div className="mt-4 flex items-center gap-3">
                                            <div>
                                                <p className="font-mono text-[10px] text-slate-500">DESDE</p>
                                                <p className="font-[Orbitron] text-2xl font-black">CNM</p>
                                                <p className="text-[11px] text-slate-400">Tienda</p>
                                            </div>
                                            <div className="relative flex-1">
                                                <div className="h-px w-full border-t border-dashed border-slate-600" />
                                                <Plane size={18} className="launch-plane absolute -top-[9px] text-neon" />
                                            </div>
                                            <div className="text-right">
                                                <p className="font-mono text-[10px] text-slate-500">HACIA</p>
                                                <p className="font-[Orbitron] text-2xl font-black">{isRank ? 'VIP' : 'MIA'}</p>
                                                <p className="text-[11px] text-slate-400">{isRank ? 'Tu cuenta' : 'Panel · Miami'}</p>
                                            </div>
                                        </div>
                                        <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 font-mono text-xs sm:grid-cols-3">
                                            <div>
                                                <dt className="text-[10px] text-slate-500">PASAJERO</dt>
                                                <dd className="truncate font-bold">{user?.name ?? 'Invitado'}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-[10px] text-slate-500">VUELO</dt>
                                                <dd className="truncate font-bold">{plan.name}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-[10px] text-slate-500">CLASE</dt>
                                                <dd className="font-bold">{chosen.label}</dd>
                                            </div>
                                            {!isRank && (
                                                <div className="col-span-2 sm:col-span-3">
                                                    <dt className="text-[10px] text-slate-500">SERVIDOR</dt>
                                                    <dd className="truncate font-bold text-neon">{data.server_name || '—'}</dd>
                                                </div>
                                            )}
                                        </dl>
                                    </div>

                                    {/* Talón con el precio */}
                                    <div className="launch-stub relative flex flex-col justify-between border-t border-dashed border-pink-500/40 p-5 sm:border-t-0 sm:border-l">
                                        <div>
                                            <p className="font-mono text-[10px] text-slate-500">TOTAL / {chosen.unit.toUpperCase()}</p>
                                            {pct > 0 && <p className="font-mono text-xs text-slate-500 line-through">{fmtPrice(before)} €</p>}
                                            <p className="font-[Orbitron] text-3xl font-black text-neon">{fmtPrice(total)} €</p>
                                        </div>
                                        <div className="launch-barcode mt-4 h-10 w-full" aria-hidden />
                                    </div>
                                </div>
                            </div>

                            {/* Descuentos: se ven todos y se marca el que se aplica */}
                            {candidates.length > 0 && (
                                <div className="rounded-xl border border-slate-800 bg-black/40 p-4">
                                    <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-slate-500">Descuentos · se aplica el mayor, no se suman</p>
                                    <ul className="space-y-1.5">
                                        {candidates.map((c) => {
                                            const Icon = c.icon;
                                            const win = best?.key === c.key;
                                            return (
                                                <li key={c.key} className={`flex items-center gap-2 text-sm ${win ? 'text-white' : 'text-slate-500'}`}>
                                                    <Icon size={14} className={win ? 'text-emerald-400' : ''} />
                                                    <span className={win ? '' : 'line-through'}>{c.label}</span>
                                                    <span className={`ml-auto font-mono font-bold ${win ? 'text-emerald-400' : ''}`}>-{c.pct}%</span>
                                                    {win && <Check size={14} className="text-emerald-400" />}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}

                            {(errors.plan_id || errors.billing_cycle) && <p className="text-xs text-red-400">{errors.plan_id || errors.billing_cycle}</p>}

                            {user ? (
                                <div className="space-y-2">
                                    <HoldButton onConfirm={launch} disabled={processing || launching}>
                                        {processing || launching ? 'Reservando…' : 'Mantén pulsado para reservar'}
                                    </HoldButton>
                                    <p className="text-center text-[11px] text-slate-500">
                                        Después eliges cómo pagar. {isRank ? 'El rango' : 'El servidor'} se activa en cuanto se confirma el pago.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3 rounded-xl border border-pink-500/30 bg-pink-500/5 p-4">
                                    <p className="text-sm text-pink-100">Guarda tu billete: entra o crea tu cuenta y vuelves aquí con todo tal cual.</p>
                                    <div className="flex flex-col gap-2 sm:flex-row">
                                        <a href={resumeUrl} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-pink-500 to-fuchsia-600 py-2.5 text-sm font-bold">
                                            <LogIn size={15} /> Entrar y seguir
                                        </a>
                                        <Link
                                            href={route('register')}
                                            onClick={() => fetch(resumeUrl, { credentials: 'same-origin', redirect: 'manual' }).catch(() => {})}
                                            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-700 py-2.5 text-sm font-semibold text-slate-200 hover:border-neon"
                                        >
                                            <UserPlus size={15} /> Crear cuenta
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </section>
                    )}
                </div>

                {/* Pie: navegación entre etapas */}
                {current !== 'ticket' && (
                    <footer className="relative flex items-center justify-between gap-3 border-t border-slate-800 px-5 py-4 sm:px-8">
                        <button type="button" onClick={step === 0 ? onClose : back} className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-slate-400 hover:text-white">
                            <ArrowLeft size={15} /> {step === 0 ? 'Cancelar' : 'Atrás'}
                        </button>
                        <div className="text-right font-mono text-xs text-slate-400">
                            <span className="hidden sm:inline">Total: </span>
                            <span className="font-bold text-white">{fmtPrice(total)} €</span> / {chosen.unit}
                        </div>
                        <button
                            type="button"
                            onClick={next}
                            disabled={!canNext}
                            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-pink-500 to-fuchsia-600 px-4 py-2 text-sm font-bold disabled:opacity-40"
                        >
                            Siguiente <ArrowRight size={15} />
                        </button>
                    </footer>
                )}
                {current === 'ticket' && (
                    <footer className="relative border-t border-slate-800 px-5 py-3 sm:px-8">
                        <button type="button" onClick={back} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-slate-400 hover:text-white">
                            <ArrowLeft size={15} /> Cambiar algo
                        </button>
                    </footer>
                )}
            </div>
        </div>,
        document.body,
    );
}

const CSS = `
.launch-panel { animation: launch-in .35s cubic-bezier(.2,.8,.2,1); }
@keyframes launch-in { from { transform: translateY(24px) scale(.98); opacity: 0; } to { transform: none; opacity: 1; } }
.launch-stage { animation: launch-stage .3s ease; }
@keyframes launch-stage { from { transform: translateX(16px); opacity: 0; } to { transform: none; opacity: 1; } }
.launch-stars { background-image: radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,.35), transparent), radial-gradient(1px 1px at 70% 80%, rgba(255,255,255,.25), transparent), radial-gradient(1px 1px at 85% 20%, rgba(255,255,255,.3), transparent), radial-gradient(1px 1px at 40% 70%, rgba(255,255,255,.2), transparent); opacity: .6; }
.launch-plane { animation: launch-fly 3.2s ease-in-out infinite; }
@keyframes launch-fly { 0% { left: 0; } 50% { left: calc(100% - 18px); } 100% { left: 0; } }
.launch-stub::before, .launch-stub::after { content: ''; position: absolute; width: 18px; height: 18px; border-radius: 50%; background: #070b18; }
.launch-stub::before { top: -9px; left: -9px; }
.launch-stub::after { bottom: -9px; left: -9px; }
@media (max-width: 639px) { .launch-stub::before { top: -9px; left: -9px; } .launch-stub::after { top: -9px; right: -9px; left: auto; bottom: auto; } }
.launch-barcode { background: repeating-linear-gradient(90deg, rgba(255,255,255,.85) 0 2px, transparent 2px 4px, rgba(255,255,255,.85) 4px 5px, transparent 5px 8px, rgba(255,255,255,.85) 8px 11px, transparent 11px 13px); opacity: .7; }
.launch-dice:active svg { transform: rotate(180deg); transition: transform .2s; }
@media (prefers-reduced-motion: reduce) { .launch-panel, .launch-stage, .launch-plane { animation: none !important; } }
`;
