import InputError from '@/Components/InputError';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import {
    CalendarCheck, Check, Coins as CoinsIcon, Copy, Cpu, CreditCard, Flame, Gift, HardDrive, IdCard, Image as ImageIcon,
    MemoryStick, PlayCircle, RefreshCw, Rocket, Search, Send, Server, Share2, Shield, ShoppingCart, Sparkles, Target, TrendingUp, Users,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

const fmtDate = (d) => (d ? new Date(d).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—');
const fmtRam = (mb) => (mb >= 1024 ? `${+(mb / 1024).toFixed(2)} GB` : `${mb} MB`);
const fmtEur = (n) => `${Number(n).toFixed(2).replace('.', ',')} €`;
const REASONS = {
    ad: 'Anuncio', checkin: 'Racha diaria', mission: 'Misión', referral: 'Invitación', purchase: 'Regalo por compra',
    free_server: 'Servidor gratis', free_renew: 'Renovación', admin: 'Ajuste', game: 'Minijuego', advent: 'Calendario de Adviento',
};
const MISSION_ICONS = { image: ImageIcon, id: IdCard, shield: Shield, flame: Flame, users: Users, cart: ShoppingCart };

function Panel({ icon: Icon, title, color = 'text-yellow-300', children, className = '' }) {
    return (
        <section className={`min-w-0 overflow-hidden rounded-2xl border border-slate-800 bg-[#070b18]/90 p-4 sm:p-5 ${className}`}>
            <h2 className="mb-3 flex items-center gap-2 font-black text-white">
                <Icon size={18} className={color} /> {title}
            </h2>
            {children}
        </section>
    );
}

/** Racha diaria: 7 casillas; el séptimo día es el premio gordo. */
function Checkin({ checkin }) {
    const { rewards, streak, done_today } = checkin;
    const today = done_today ? (streak - 1) % 7 : streak % 7;
    return (
        <div className="space-y-3">
            <div className="grid grid-cols-7 gap-1.5">
                {rewards.map((r, i) => {
                    const got = done_today ? i <= today : i < today;
                    const isToday = i === today;
                    return (
                        <div
                            key={i}
                            className={`flex flex-col items-center rounded-lg border px-0.5 py-2 text-center ${got ? 'border-emerald-500/50 bg-emerald-500/10' : isToday ? 'border-yellow-400/70 bg-yellow-400/10' : 'border-slate-800 bg-black/30'}`}
                        >
                            <span className="font-mono text-[9px] text-slate-400">Día {i + 1}</span>
                            {got ? <Check size={14} className="my-0.5 text-emerald-400" /> : <span className="text-sm font-black text-yellow-300">{r}</span>}
                        </div>
                    );
                })}
            </div>
            <button
                type="button"
                disabled={done_today}
                onClick={() => router.post(route('coins.checkin'), {}, { preserveScroll: true })}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 px-4 py-2.5 font-black text-black hover:brightness-110 disabled:cursor-not-allowed disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-300"
            >
                <CalendarCheck size={16} /> {done_today ? `Recogido · racha de ${streak} día(s)` : `Recoger +${rewards[today]} monedas`}
            </button>
            <p className="text-[11px] text-slate-500">Entra cada día: si te saltas uno, la racha vuelve al día 1.</p>
        </div>
    );
}

/** Anuncio con recompensa (Google Ad Manager / GPT). */
function RewardedAd({ ads, onDone }) {
    const [state, setState] = useState('idle');
    const [msg, setMsg] = useState(null);
    const left = Math.max(0, ads.per_day - ads.watched_today);

    const watch = useCallback(async () => {
        setMsg(null);
        let token;
        try {
            token = (await axios.post(route('coins.ads.start'))).data.token;
        } catch (e) {
            setMsg(e.response?.data?.message ?? 'No hay anuncios ahora mismo.');
            return;
        }
        setState('loading');
        await new Promise((resolve) => {
            if (window.googletag?.apiReady) return resolve();
            const s = document.createElement('script');
            s.src = 'https://securepubads.g.doubleclick.net/tag/js/gpt.js';
            s.async = true;
            s.onload = resolve;
            document.head.appendChild(s);
        });
        const gt = (window.googletag = window.googletag || { cmd: [] });
        gt.cmd.push(() => {
            const slot = gt.defineOutOfPageSlot(ads.unit, gt.enums.OutOfPageFormat.REWARDED);
            if (!slot) {
                setState('idle');
                setMsg('Tu navegador no admite anuncios con recompensa.');
                return;
            }
            slot.addService(gt.pubads());
            let granted = false;
            gt.pubads().addEventListener('rewardedSlotReady', (ev) => {
                setState('playing');
                ev.makeRewardedVisible();
            });
            gt.pubads().addEventListener('rewardedSlotGranted', () => {
                granted = true;
            });
            gt.pubads().addEventListener('rewardedSlotClosed', async () => {
                gt.destroySlots([slot]);
                setState('idle');
                if (!granted) return setMsg('Mira el anuncio hasta el final para recibir las monedas.');
                try {
                    const { data } = await axios.post(route('coins.ads.complete'), { token });
                    onDone(data);
                } catch (e) {
                    setMsg(e.response?.data?.message ?? 'No se pudo validar el anuncio.');
                }
            });
            gt.pubads().addEventListener('slotRenderEnded', (ev) => {
                if (ev.slot === slot && ev.isEmpty) {
                    setState('idle');
                    setMsg('No hay anuncios disponibles ahora mismo. Prueba más tarde.');
                }
            });
            gt.enableServices();
            gt.display(slot);
        });
    }, [ads.unit, onDone]);

    return (
        <div className="space-y-3">
            <p className="text-sm text-slate-300">
                Mira un anuncio corto entero y gana <b className="text-yellow-300">{ads.reward} monedas</b>.
                {ads.enabled && <> Te quedan <b className="text-white">{left}</b> hoy.</>}
            </p>
            <button
                type="button"
                disabled={!ads.enabled || left === 0 || state !== 'idle'}
                onClick={watch}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-yellow-400/50 bg-yellow-400/10 px-4 py-2.5 font-bold text-yellow-300 hover:bg-yellow-400/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <PlayCircle size={16} /> {!ads.enabled ? 'Muy pronto' : left === 0 ? 'Vuelve mañana' : state === 'idle' ? 'Ver anuncio' : 'Cargando…'}
            </button>
            {msg && <p className="text-xs text-rose-400">{msg}</p>}
        </div>
    );
}

function Missions({ missions }) {
    return (
        <ul className="space-y-2">
            {missions.map((m) => {
                const Icon = MISSION_ICONS[m.icon] ?? Target;
                return (
                    <li key={m.key} className={`flex items-center gap-3 rounded-xl border p-2.5 ${m.done ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-slate-800 bg-black/30'}`}>
                        <Icon size={16} className={m.done ? 'shrink-0 text-emerald-400' : 'shrink-0 text-slate-400'} />
                        <span className={`min-w-0 flex-1 text-sm ${m.done ? 'text-slate-400 line-through' : 'text-slate-200'}`}>{m.label}</span>
                        {m.done ? (
                            <Check size={16} className="shrink-0 text-emerald-400" />
                        ) : (
                            <button
                                type="button"
                                onClick={() => router.post(route('coins.mission', m.key), {}, { preserveScroll: true })}
                                className="shrink-0 rounded-lg border border-yellow-400/50 px-2.5 py-1 font-mono text-xs font-bold text-yellow-300 hover:bg-yellow-400/10"
                            >
                                +{m.reward}
                            </button>
                        )}
                    </li>
                );
            })}
        </ul>
    );
}

function Referral({ referral }) {
    const [copied, setCopied] = useState(false);
    const text = 'Consigue un servidor gratis en Cinammon (juegos, bots, webs y más):';
    const enc = encodeURIComponent;
    const copy = () => {
        navigator.clipboard?.writeText(referral.url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };
    const share = () => navigator.share?.({ title: 'Cinammon', text, url: referral.url }).catch(() => {});

    return (
        <div className="space-y-3">
            <p className="text-sm text-slate-300">
                Cuando tu amigo empiece a usar la tienda ganáis <b className="text-yellow-300">{referral.reward_active}</b> tú y <b className="text-yellow-300">{referral.reward_welcome}</b> él.
                Si compra algo, te llevas <b className="text-yellow-300">{referral.reward_purchase}</b> más.
            </p>
            <div className="flex gap-2">
                <input readOnly value={referral.url} onFocus={(e) => e.target.select()} className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-black/60 px-3 py-2 font-mono text-xs text-slate-200 focus:ring-0" />
                <button type="button" onClick={copy} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold text-white hover:border-yellow-400">
                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />} {copied ? 'Copiado' : 'Copiar'}
                </button>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-bold">
                <a href={`https://wa.me/?text=${enc(`${text} ${referral.url}`)}`} target="_blank" rel="noreferrer" className="rounded-lg bg-emerald-600/80 px-3 py-1.5 text-white hover:bg-emerald-600">WhatsApp</a>
                <a href={`https://t.me/share/url?url=${enc(referral.url)}&text=${enc(text)}`} target="_blank" rel="noreferrer" className="rounded-lg bg-sky-600/80 px-3 py-1.5 text-white hover:bg-sky-600">Telegram</a>
                <a href={`https://x.com/intent/post?text=${enc(`${text} ${referral.url}`)}`} target="_blank" rel="noreferrer" className="rounded-lg bg-slate-700 px-3 py-1.5 text-white hover:bg-slate-600">X</a>
                {typeof navigator !== 'undefined' && navigator.share && (
                    <button type="button" onClick={share} className="inline-flex items-center gap-1 rounded-lg bg-slate-700 px-3 py-1.5 text-white hover:bg-slate-600"><Share2 size={12} /> Más</button>
                )}
            </div>
            <p className="font-mono text-[11px] text-slate-400">Invitados: {referral.invited} · activos: {referral.active}</p>
        </div>
    );
}

function Slider({ icon: Icon, label, value, min, max, step, onChange, format }) {
    const disabled = max <= min;
    return (
        <label className="block">
            <span className="mb-1 flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1.5"><Icon size={13} className="text-yellow-300" /> {label}</span>
                <b className="font-mono text-white">{format(value)}</b>
            </span>
            <input
                type="range"
                min={min}
                max={Math.max(min, max)}
                step={step}
                value={value}
                disabled={disabled}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full accent-yellow-400"
            />
            <span className="flex justify-between font-mono text-[10px] text-slate-500"><span>{format(min)}</span><span>máx. {format(Math.max(min, max))}</span></span>
        </label>
    );
}

/** Icono del egg (el mismo de la tienda); si no tiene o no carga, un icono genérico del mismo tamaño. */
function EggIcon({ src, size = 36 }) {
    const [failed, setFailed] = useState(false);
    const box = { width: size, height: size };
    if (!src || failed) {
        return (
            <span style={box} className="flex shrink-0 items-center justify-center rounded-md border border-slate-800 bg-black/40 text-slate-500">
                <Server size={Math.round(size * 0.45)} />
            </span>
        );
    }
    return <img src={src} alt="" loading="lazy" style={box} onError={() => setFailed(true)} className="shrink-0 rounded-md border border-slate-700/80 bg-black/40 object-cover" />;
}

/** Crear el servidor gratis: servicio → recursos → días → nombre. */
function Builder({ builder, balance, activeCount }) {
    const { options, categories, durations, min, rates, per_user, full } = builder;
    const [cat, setCat] = useState('all');
    const [q, setQ] = useState('');
    const { data, setData, post, processing, errors } = useForm({
        egg: options[0]?.egg ?? '', ram_mb: min.ram_mb, cpu_pct: min.cpu_pct, disk_gb: min.disk_gb, days: durations[Math.min(1, durations.length - 1)], server_name: '',
    });
    const opt = options.find((o) => o.egg === data.egg);

    const visible = useMemo(() => {
        const term = q.trim().toLowerCase();
        return options.filter((o) => (cat === 'all' || o.category === cat) && (!term || o.egg.toLowerCase().includes(term))).slice(0, 60);
    }, [options, cat, q]);
    const usedCats = useMemo(() => [...new Set(options.map((o) => o.category))], [options]);

    const pick = (o) => {
        setData((d) => ({
            ...d,
            egg: o.egg,
            ram_mb: Math.min(Math.max(d.ram_mb, min.ram_mb), o.max.ram_mb),
            cpu_pct: Math.min(Math.max(d.cpu_pct, min.cpu_pct), o.max.cpu_pct),
            disk_gb: Math.min(Math.max(d.disk_gb, min.disk_gb), o.max.disk_gb),
        }));
    };

    const daily = Math.ceil(rates.base + (data.ram_mb / 1024) * rates.ram + (data.cpu_pct / 100) * rates.cpu + data.disk_gb * rates.disk);
    const total = daily * data.days;
    const enough = balance >= total;
    const limitReached = activeCount >= per_user;

    if (!options.length) return <p className="text-sm text-slate-400">Ahora mismo no hay servicios gratis disponibles.</p>;

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                post(route('coins.claim'), { preserveScroll: true });
            }}
            className="grid min-w-0 gap-5 lg:grid-cols-2"
        >
            <div className="min-w-0 space-y-3">
                <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">1 · Elige qué quieres</p>
                <div className="flex flex-wrap gap-1.5">
                    {['all', ...usedCats].map((k) => (
                        <button
                            key={k}
                            type="button"
                            onClick={() => setCat(k)}
                            className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${cat === k ? 'border-yellow-400/70 bg-yellow-400/15 text-yellow-200' : 'border-slate-800 text-slate-400 hover:text-white'}`}
                        >
                            {k === 'all' ? 'Todo' : categories[k] ?? k}
                        </button>
                    ))}
                </div>
                <div className="relative">
                    <Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-500" />
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Buscar: Minecraft, Discord, web, TeamSpeak…"
                        className="w-full rounded-lg border border-slate-700 bg-black/60 py-2 pr-3 pl-8 text-sm text-white focus:border-yellow-400 focus:ring-0"
                    />
                </div>
                <div className="grid max-h-72 grid-cols-1 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-2">
                    {visible.map((o) => (
                        <button
                            key={o.egg}
                            type="button"
                            onClick={() => pick(o)}
                            className={`flex min-w-0 items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left transition ${data.egg === o.egg ? 'border-yellow-400/70 bg-yellow-400/10' : 'border-slate-800 bg-black/30 hover:border-slate-600'}`}
                        >
                            <EggIcon src={o.icon} />
                            <span className="min-w-0">
                                <span className="block truncate text-sm font-bold text-white">{o.egg}</span>
                                <span className="block truncate text-[10px] text-slate-500">{categories[o.category] ?? o.category}</span>
                            </span>
                        </button>
                    ))}
                    {visible.length === 0 && <p className="text-xs text-slate-500 sm:col-span-2">Nada con ese nombre.</p>}
                </div>
            </div>

            <div className="min-w-0 space-y-4">
                <p className="flex min-w-0 items-center gap-2 text-xs font-bold tracking-wider text-slate-400 uppercase">
                    <span className="shrink-0">2 · Elige cuánto</span>
                    {opt && <EggIcon src={opt.icon} size={20} />}
                    <span className="truncate normal-case text-white">{opt?.egg}</span>
                </p>
                {opt && (
                    <>
                        <Slider icon={MemoryStick} label="RAM" value={data.ram_mb} min={min.ram_mb} max={opt.max.ram_mb} step={128} onChange={(v) => setData('ram_mb', v)} format={fmtRam} />
                        <Slider icon={Cpu} label="CPU" value={data.cpu_pct} min={min.cpu_pct} max={opt.max.cpu_pct} step={5} onChange={(v) => setData('cpu_pct', v)} format={(v) => `${v} %`} />
                        <Slider icon={HardDrive} label="Disco" value={data.disk_gb} min={min.disk_gb} max={opt.max.disk_gb} step={1} onChange={(v) => setData('disk_gb', v)} format={(v) => `${v} GB`} />
                    </>
                )}
                <div>
                    <p className="mb-1 text-xs text-slate-300">Duración</p>
                    <div className="flex flex-wrap gap-1.5">
                        {durations.map((d) => (
                            <button
                                key={d}
                                type="button"
                                onClick={() => setData('days', d)}
                                className={`rounded-lg border px-3 py-1.5 font-mono text-xs font-bold ${data.days === d ? 'border-yellow-400/70 bg-yellow-400/15 text-yellow-200' : 'border-slate-800 text-slate-400'}`}
                            >
                                {d} días
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label htmlFor="server_name" className="mb-1 block text-xs text-slate-300">Nombre del servidor</label>
                    <input
                        id="server_name"
                        value={data.server_name}
                        onChange={(e) => setData('server_name', e.target.value)}
                        maxLength={40}
                        placeholder="mi-servidor"
                        className="w-full rounded-lg border border-slate-700 bg-black/60 px-3 py-2 text-sm text-white focus:border-yellow-400 focus:ring-0"
                    />
                    <InputError message={errors.server_name} />
                </div>

                <div className="rounded-xl border border-yellow-400/30 bg-yellow-400/5 p-3">
                    <p className="flex items-center justify-between text-sm text-slate-300">
                        <span>{daily} monedas/día × {data.days} días</span>
                        <b className="flex items-center gap-1 text-lg text-yellow-300"><CoinsIcon size={16} /> {total}</b>
                    </p>
                    {opt && (
                        <p className="mt-2 border-t border-yellow-400/20 pt-2 text-[11px] text-slate-400">
                            ¿Quieres más? <b className="text-white">{opt.paid.name}</b> por {fmtEur(opt.paid.price)}/mes: {fmtRam(opt.paid.ram_mb)} · {opt.paid.cpu_pct} % CPU · {opt.paid.disk_gb} GB, sin caducar y con prioridad.{' '}
                            <Link href={route('store.category', opt.category)} className="font-bold text-pink-400 hover:underline">Ver planes</Link>
                        </p>
                    )}
                </div>

                <InputError message={errors.claim} />
                <button
                    type="submit"
                    disabled={processing || !enough || limitReached || full || !opt}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 px-5 py-3 font-black text-black hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Rocket size={16} />
                    {full ? 'Sin plazas gratis ahora mismo' : limitReached ? 'Ya tienes tu servidor gratis' : enough ? `Crear por ${total} monedas` : `Te faltan ${total - balance} monedas`}
                </button>
            </div>
        </form>
    );
}

function FreeServer({ o, durations }) {
    const [days, setDays] = useState(durations[0]);
    return (
        <div className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-black/40 p-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
                <p className="truncate font-bold text-white">{o.server_name}</p>
                <p className="font-mono text-[11px] text-slate-400">
                    {o.egg ?? 'Servidor'} · {fmtRam(o.ram_mb ?? 0)} · {o.cpu_pct}% CPU · {o.storage_gb} GB
                </p>
                <p className="font-mono text-[11px] text-slate-400">
                    {o.status === 'active' ? `Caduca ${fmtDate(o.renews_at)}` : 'Caducado (detenido)'}
                    {o.server_address && ` · ${o.server_address}`}
                </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                {o.status === 'active' && (
                    <>
                        <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="rounded-lg border border-slate-700 bg-black/60 py-1.5 pr-7 pl-2 text-xs text-white focus:ring-0">
                            {durations.map((d) => (
                                <option key={d} value={d}>{d} días · {(o.coin_daily ?? 0) * d}</option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={() => router.post(route('coins.renew', o.id), { days }, { preserveScroll: true })}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-yellow-400/50 px-3 py-2 text-xs font-bold text-yellow-300 hover:bg-yellow-400/10"
                        >
                            <RefreshCw size={13} /> Renovar
                        </button>
                    </>
                )}
                <Link
                    href={route('store.category', o.category ?? 'minecraft')}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 px-3 py-2 text-xs font-bold text-white hover:brightness-110"
                >
                    <TrendingUp size={13} /> Pasar a plan de pago
                </Link>
            </div>
        </div>
    );
}

export default function Coins({ balance: initialBalance, earnedToday, dailyCap, enabled, checkin, ads, missions, referral, coinsPerEuro, builder, stats, freeServers, history }) {
    const { flash, errors, adventSummary } = usePage().props;
    const [balance, setBalance] = useState(initialBalance);
    const [toast, setToast] = useState(null);
    useEffect(() => setBalance(initialBalance), [initialBalance]);

    const onDone = useCallback((data) => {
        if (typeof data.balance === 'number') setBalance(data.balance);
        setToast(data.message);
        setTimeout(() => setToast(null), 3500);
        router.reload({ only: ['history', 'ads', 'coins', 'earnedToday'] });
    }, []);

    const activeCount = freeServers.filter((o) => o.status === 'active').length;
    const anyError = errors?.checkin || errors?.mission || errors?.renew;

    return (
        <AuthenticatedLayout>
            <Head title="Servidor gratis" />
            <div className="mx-auto max-w-6xl min-w-0 space-y-6 overflow-x-hidden px-4 py-8 sm:px-6 lg:px-8">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="min-w-0">
                        <h1 className="flex items-center gap-2 text-2xl font-black text-white sm:text-3xl">
                            <Gift className="text-yellow-300" /> Tu servidor gratis
                        </h1>
                        <p className="mt-1 max-w-2xl text-sm text-slate-400">
                            Juegos, bots de Discord, webs, voz, bases de datos y más. Gana monedas, elige el servicio y cuántos recursos quieres, y úsalo gratis. Cuando se te quede pequeño, pásate a un plan de pago.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-yellow-400/40 bg-yellow-400/10 px-5 py-3 sm:text-right">
                        <p className="font-mono text-[10px] tracking-widest text-yellow-300/80 uppercase">Tus monedas</p>
                        <p className="flex items-center gap-2 text-3xl font-black text-yellow-300 sm:justify-end"><CoinsIcon /> {balance}</p>
                        <p className="font-mono text-[11px] text-slate-400">Anuncios hoy: {earnedToday}/{dailyCap}</p>
                    </div>
                </header>

                {/* Contador público: que se vea que hay gente usándolo */}
                {stats.active >= 3 && (
                <div className="grid grid-cols-3 gap-2 rounded-2xl border border-slate-800 bg-black/40 p-3 text-center">
                    <div><p className="text-xl font-black text-white sm:text-2xl">{stats.active}</p><p className="text-[10px] text-slate-400 sm:text-xs">servidores gratis activos</p></div>
                    <div><p className="text-xl font-black text-white sm:text-2xl">{stats.people}</p><p className="text-[10px] text-slate-400 sm:text-xs">personas lo han probado</p></div>
                    <div><p className="text-xl font-black text-white sm:text-2xl">{stats.services}</p><p className="text-[10px] text-slate-400 sm:text-xs">servicios para elegir</p></div>
                </div>
                )}

                {flash?.success && <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-200">{flash.success}</div>}
                {anyError && <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-200">{anyError}</div>}

                {adventSummary && (
                    <Link
                        href={route('advent.index')}
                        className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-emerald-400/50 bg-gradient-to-r from-emerald-950/80 via-green-950/70 to-emerald-950/80 p-4 text-center transition hover:border-emerald-300 sm:flex-row sm:px-6 sm:text-left"
                    >
                        <div className="flex items-center gap-3">
                            <Gift className="h-8 w-8 shrink-0 text-emerald-400" />
                            <div>
                                <p className="font-mono text-[10px] font-bold tracking-widest text-emerald-300 uppercase">{adventSummary.badge}</p>
                                <p className="text-base font-black text-white">
                                    {adventSummary.title} · Casilla #{adventSummary.current_day} disponible hoy
                                </p>
                                <p className="text-xs text-slate-300">Abre tu regalo diario y gana hasta +1.500 monedas extra con los cofres especiales.</p>
                            </div>
                        </div>
                        <span className="shrink-0 rounded-xl bg-emerald-400 px-4 py-2 font-mono text-xs font-extrabold text-black">
                            Abrir regalo de hoy
                        </span>
                    </Link>
                )}
                {toast && (
                    <div className="fixed right-4 bottom-20 z-50 rounded-xl border border-yellow-400/60 bg-black/90 px-4 py-3 font-bold text-yellow-300 shadow-[0_0_20px_rgba(250,204,21,0.3)]">{toast}</div>
                )}

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Panel icon={Flame} title="Racha diaria" color="text-orange-400"><Checkin checkin={checkin} /></Panel>
                    <Panel icon={PlayCircle} title="Anuncios con premio"><RewardedAd ads={ads} onDone={onDone} /></Panel>
                    <Panel icon={Target} title="Misiones" color="text-emerald-400"><Missions missions={missions} /></Panel>
                    <Panel icon={Send} title="Invita a tus amigos" color="text-sky-400" className="md:col-span-2"><Referral referral={referral} /></Panel>
                    <Panel icon={CreditCard} title="Comprar también da monedas" color="text-pink-400">
                        <p className="text-sm text-slate-300">Por cada euro que pagas en la tienda te regalamos <b className="text-yellow-300">{coinsPerEuro} monedas</b>.</p>
                        <Link href={route('store')} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-2.5 text-sm font-bold text-white hover:brightness-110">
                            <ShoppingCart size={15} /> Ver la tienda
                        </Link>
                    </Panel>
                </div>

                <Panel icon={Server} title="Crea tu servidor gratis">
                    {!enabled ? (
                        <p className="text-sm text-slate-400">Los servidores gratis están en pausa ahora mismo. Vuelve pronto.</p>
                    ) : (
                        <>
                            <ul className="mb-4 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-slate-400">
                                <li>· {builder.per_user} servidor gratis activo por cuenta</li>
                                <li>· Renuévalo con monedas antes de que caduque</li>
                                <li>· Los clientes de pago tienen prioridad</li>
                            </ul>
                            <Builder builder={builder} balance={balance} activeCount={activeCount} />
                        </>
                    )}
                </Panel>

                {freeServers.length > 0 && (
                    <Panel icon={Sparkles} title="Tus servidores gratis">
                        <div className="space-y-2">
                            {freeServers.map((o) => <FreeServer key={o.id} o={o} durations={builder.durations} />)}
                        </div>
                    </Panel>
                )}

                {history.length > 0 && (
                    <Panel icon={CoinsIcon} title="Movimientos">
                        <ul className="divide-y divide-slate-800 font-mono text-xs">
                            {history.map((h, i) => (
                                <li key={i} className="flex items-center justify-between gap-3 py-2">
                                    <span className="min-w-0 truncate text-slate-300">
                                        {REASONS[h.reason] ?? h.reason}
                                        {h.detail && <span className="text-slate-500"> · {h.detail}</span>}
                                    </span>
                                    <span className={`shrink-0 font-bold ${h.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {h.amount >= 0 ? '+' : ''}{h.amount}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </Panel>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
