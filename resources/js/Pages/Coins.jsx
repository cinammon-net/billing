import InputError from '@/Components/InputError';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import { Brain, Clock, Flame, Gamepad2, Gem, Ghost, Globe, Shield, Zap, Coins as CoinsIcon, Crosshair, Gift, PlayCircle, RefreshCw, Rocket, Server, Sparkles, TrendingUp } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const fmtDate = (d) => (d ? new Date(d).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—');
const fmtRam = (mb) => (mb >= 1024 ? `${mb / 1024} GB` : `${mb} MB`);
const REASONS = { game: 'Minijuego', ad: 'Anuncio', free_server: 'Servidor gratis', free_renew: 'Renovación', admin: 'Ajuste' };

function useGame(game, onDone) {
    const [token, setToken] = useState(null);
    const [error, setError] = useState(null);
    const start = async () => {
        setError(null);
        try {
            const { data } = await axios.post(route('coins.games.start'), { game });
            setToken(data.token);
            return true;
        } catch (e) {
            setError(e.response?.data?.message ?? 'No se pudo empezar la partida.');
            return false;
        }
    };
    const finish = async (score) => {
        if (!token) return;
        try {
            const { data } = await axios.post(route('coins.games.finish'), { token, score });
            onDone(data);
        } catch (e) {
            setError(e.response?.data?.message ?? 'No se pudo guardar la partida.');
        } finally {
            setToken(null);
        }
    };
    return { start, finish, error, playing: Boolean(token) };
}

/** Minijuego 1: pulsar los núcleos que aparecen durante 30 segundos. */
function ReflexGame({ onDone }) {
    const DURATION = 30;
    const { start, finish, error, playing } = useGame('reflex', onDone);
    const [left, setLeft] = useState(DURATION);
    const [score, setScore] = useState(0);
    const [pos, setPos] = useState({ x: 50, y: 50, size: 56 });
    const scoreRef = useRef(0);

    const move = (s) => setPos({ x: 8 + Math.random() * 84, y: 10 + Math.random() * 80, size: Math.max(30, 56 - s) });

    const begin = async () => {
        if (!(await start())) return;
        scoreRef.current = 0;
        setScore(0);
        setLeft(DURATION);
        move(0);
    };

    useEffect(() => {
        if (!playing) return;
        const t0 = Date.now();
        const id = setInterval(() => {
            const remaining = DURATION - Math.floor((Date.now() - t0) / 1000);
            setLeft(Math.max(0, remaining));
            if (remaining <= 0) {
                clearInterval(id);
                finish(scoreRef.current);
            }
        }, 250);
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [playing]);

    const hit = () => {
        scoreRef.current += 1;
        setScore(scoreRef.current);
        move(scoreRef.current);
    };

    return (
        <div>
            <div className="mb-3 flex items-center justify-between font-mono text-xs text-slate-300">
                <span>Puntos: <b className="text-white">{score}</b></span>
                <span className="flex items-center gap-1"><Clock size={12} /> {left}s</span>
            </div>
            <div className="relative h-64 select-none overflow-hidden rounded-xl border border-cyan-500/30 bg-[radial-gradient(circle_at_center,oklch(var(--tw-c-neon)_/_0.08),transparent_70%)] sm:h-72">
                {playing ? (
                    <button
                        type="button"
                        onPointerDown={hit}
                        aria-label="Núcleo"
                        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-neon to-pink-500 shadow-[0_0_20px_oklch(var(--tw-c-neon))] transition-[left,top] duration-75"
                        style={{ left: `${pos.x}%`, top: `${pos.y}%`, width: pos.size, height: pos.size }}
                    />
                ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-3 p-4 text-center">
                        <p className="max-w-xs text-sm text-slate-300">Pulsa los núcleos tan rápido como puedas durante 30 segundos. Cada 5 aciertos = 1 moneda (máx. 15).</p>
                        <button type="button" onClick={begin} className="inline-flex items-center gap-2 rounded-xl bg-neon px-5 py-2.5 font-bold text-black hover:brightness-110">
                            <PlayCircle size={16} /> Jugar
                        </button>
                    </div>
                )}
            </div>
            {error && <p className="mt-2 text-xs text-rose-400">{error}</p>}
        </div>
    );
}

// Parejas del memory: iconos de línea con su color (sin emojis).
const SYMBOLS = ['rocket', 'gamepad', 'gem', 'flame', 'zap', 'shield', 'ghost', 'globe'];
const SYMBOL_ICON = {
    rocket: [Rocket, 'text-cyan-300'], gamepad: [Gamepad2, 'text-pink-300'], gem: [Gem, 'text-violet-300'], flame: [Flame, 'text-orange-300'],
    zap: [Zap, 'text-yellow-300'], shield: [Shield, 'text-emerald-300'], ghost: [Ghost, 'text-slate-200'], globe: [Globe, 'text-sky-300'],
};
const SymbolIcon = ({ k }) => {
    const [Icon, color] = SYMBOL_ICON[k];
    return <Icon className={`h-7 w-7 sm:h-8 sm:w-8 ${color}`} aria-hidden="true" />;
};
const shuffle = (a) => a.map((v) => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map((x) => x[1]);

/** Minijuego 2: memoria de 8 parejas. */
function MemoryGame({ onDone }) {
    const { start, finish, error, playing } = useGame('memory', onDone);
    const [cards, setCards] = useState([]);
    const [open, setOpen] = useState([]);
    const [found, setFound] = useState([]);
    const [moves, setMoves] = useState(0);

    const begin = async () => {
        if (!(await start())) return;
        setCards(shuffle([...SYMBOLS, ...SYMBOLS]));
        setOpen([]);
        setFound([]);
        setMoves(0);
    };

    const flip = (i) => {
        if (!playing || open.length === 2 || open.includes(i) || found.includes(cards[i])) return;
        const next = [...open, i];
        setOpen(next);
        if (next.length === 2) {
            setMoves((m) => m + 1);
            const [a, b] = next;
            if (cards[a] === cards[b]) {
                const nf = [...found, cards[a]];
                setFound(nf);
                setOpen([]);
                if (nf.length === SYMBOLS.length) setTimeout(() => finish(nf.length), 400);
            } else {
                setTimeout(() => setOpen([]), 650);
            }
        }
    };

    return (
        <div>
            <div className="mb-3 flex items-center justify-between font-mono text-xs text-slate-300">
                <span>Parejas: <b className="text-white">{found.length}/8</b></span>
                <span>Movimientos: {moves}</span>
            </div>
            {playing ? (
                <>
                    <div className="grid grid-cols-4 gap-2">
                        {cards.map((c, i) => {
                            const shown = open.includes(i) || found.includes(c);
                            return (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => flip(i)}
                                    className={`flex aspect-square items-center justify-center rounded-lg border text-2xl transition sm:text-3xl ${shown ? 'border-pink-400/60 bg-pink-500/15' : 'border-slate-700 bg-slate-900 hover:border-cyan-500/60'}`}
                                >
                                    {shown ? <SymbolIcon k={c} /> : ''}
                                </button>
                            );
                        })}
                    </div>
                    <button type="button" onClick={() => finish(found.length)} className="mt-3 text-xs text-slate-400 underline hover:text-white">
                        Terminar ahora
                    </button>
                </>
            ) : (
                <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-xl border border-pink-500/30 p-4 text-center sm:h-72">
                    <p className="max-w-xs text-sm text-slate-300">Encuentra las 8 parejas. Completarlo = 12 monedas; a medias, 1 moneda cada 2 parejas.</p>
                    <button type="button" onClick={begin} className="inline-flex items-center gap-2 rounded-xl bg-pink-500 px-5 py-2.5 font-bold text-white hover:brightness-110">
                        <PlayCircle size={16} /> Jugar
                    </button>
                </div>
            )}
            {error && <p className="mt-2 text-xs text-rose-400">{error}</p>}
        </div>
    );
}

/** Anuncio con recompensa (Google Ad Manager / GPT). Solo se muestra si está configurado. */
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
        const loadGpt = () =>
            new Promise((resolve) => {
                if (window.googletag?.apiReady) return resolve();
                const s = document.createElement('script');
                s.src = 'https://securepubads.g.doubleclick.net/tag/js/gpt.js';
                s.async = true;
                s.onload = resolve;
                document.head.appendChild(s);
            });
        await loadGpt();
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
                if (!granted) return setMsg('Cierra el anuncio solo al terminar para recibir monedas.');
                try {
                    const { data } = await axios.post(route('coins.ads.complete'), { token });
                    onDone({ ...data, message: `+${data.coins} monedas` });
                } catch (e) {
                    setMsg(e.response?.data?.message ?? 'No se pudo validar el anuncio.');
                }
            });
            gt.pubads().addEventListener('slotRenderEnded', (ev) => {
                if (ev.slot === slot && ev.isEmpty) {
                    setState('idle');
                    setMsg('No hay anuncios disponibles ahora mismo.');
                }
            });
            gt.enableServices();
            gt.display(slot);
        });
    }, [ads.unit, onDone]);

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-300">
                Mira un anuncio completo y gana <b className="text-yellow-300">{ads.reward} monedas</b>. Te quedan <b className="text-white">{left}</b> hoy.
            </p>
            <button
                type="button"
                disabled={!ads.enabled || left === 0 || state !== 'idle'}
                onClick={watch}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-yellow-400/50 bg-yellow-400/10 px-4 py-2.5 font-bold text-yellow-300 hover:bg-yellow-400/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <PlayCircle size={16} /> {!ads.enabled ? 'Próximamente' : state === 'idle' ? 'Ver anuncio' : 'Cargando…'}
            </button>
            {msg && <p className="text-xs text-rose-400 sm:basis-full">{msg}</p>}
        </div>
    );
}

function ClaimForm({ plans, balance }) {
    const { data, setData, post, processing, errors } = useForm({ plan_id: plans[0]?.id ?? '', server_name: '' });
    const plan = plans.find((p) => p.id === Number(data.plan_id));
    const enough = plan && balance >= plan.coin_cost;

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                post(route('coins.claim'), { preserveScroll: true });
            }}
            className="space-y-4"
        >
            <div className="grid gap-3 sm:grid-cols-2">
                {plans.map((p) => (
                    <label
                        key={p.id}
                        className={`cursor-pointer rounded-xl border p-4 transition ${Number(data.plan_id) === p.id ? 'border-yellow-400/70 bg-yellow-400/10' : 'border-slate-800 bg-black/40 hover:border-slate-600'}`}
                    >
                        <input type="radio" name="plan" className="sr-only" checked={Number(data.plan_id) === p.id} onChange={() => setData('plan_id', p.id)} />
                        <span className="block font-bold text-white">{p.name}</span>
                        <span className="mt-1 block font-mono text-[11px] text-slate-400">
                            {fmtRam(p.ram_mb)} RAM · {p.storage_gb} GB disco · {p.cpu_pct}% CPU
                        </span>
                        <span className="mt-2 inline-flex items-center gap-1 rounded bg-yellow-400/15 px-2 py-0.5 font-mono text-xs font-bold text-yellow-300">
                            <CoinsIcon size={12} /> {p.coin_cost} · {p.coin_days} días
                        </span>
                    </label>
                ))}
            </div>
            <InputError message={errors.plan_id} />
            <div>
                <label htmlFor="server_name" className="mb-1 block text-xs font-semibold text-slate-300">Nombre del servidor</label>
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
            <button
                type="submit"
                disabled={processing || !enough}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 px-5 py-3 font-black text-black hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
                <Rocket size={16} /> {enough ? `Canjear ${plan.coin_cost} monedas` : `Te faltan ${plan ? plan.coin_cost - balance : 0} monedas`}
            </button>
        </form>
    );
}

export default function Coins({ balance: initialBalance, earnedToday: initialEarned, dailyCap, ads, freePlans, freeServers, history }) {
    const { flash, errors, auth } = usePage().props;
    const [balance, setBalance] = useState(initialBalance);
    const [earned, setEarned] = useState(initialEarned);
    const [toast, setToast] = useState(null);
    useEffect(() => setBalance(initialBalance), [initialBalance]);

    const onDone = useCallback((data) => {
        if (typeof data.balance === 'number') setBalance(data.balance);
        if (typeof data.earnedToday === 'number') setEarned(data.earnedToday);
        setToast(data.message);
        setTimeout(() => setToast(null), 3500);
        router.reload({ only: ['history', 'ads', 'coins'] });
    }, []);

    const cheapest = Math.min(...freePlans.map((p) => p.coin_cost));
    const progress = Math.min(100, (balance / cheapest) * 100);
    const [tab, setTab] = useState('reflex');

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Monedas y servidores gratis" />
            <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-black text-white sm:text-3xl">
                            <Gift className="text-yellow-300" /> Servidor gratis con monedas
                        </h1>
                        <p className="mt-1 max-w-2xl text-sm text-slate-400">
                            Gana monedas jugando (y pronto viendo anuncios) y canjéalas por un servidor gratuito con recursos limitados. Para más potencia o más servidores, pásate a un plan de pago.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-yellow-400/40 bg-yellow-400/10 px-5 py-3 text-right">
                        <p className="font-mono text-[10px] tracking-widest text-yellow-300/80 uppercase">Tus monedas</p>
                        <p className="flex items-center justify-end gap-2 text-3xl font-black text-yellow-300">
                            <CoinsIcon /> {balance}
                        </p>
                        <p className="font-mono text-[11px] text-slate-400">Hoy: {earned}/{dailyCap}</p>
                    </div>
                </header>

                {flash?.success && <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-200">{flash.success}</div>}
                {errors?.renew && <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-200">{errors.renew}</div>}
                {toast && (
                    <div className="fixed right-4 bottom-16 z-50 rounded-xl border border-yellow-400/60 bg-black/90 px-4 py-3 font-bold text-yellow-300 shadow-[0_0_20px_rgba(250,204,21,0.3)]">
                        {toast}
                    </div>
                )}

                <div className="h-2 overflow-hidden rounded-full bg-slate-800" title="Progreso hacia tu servidor gratis">
                    <div className="h-full bg-gradient-to-r from-yellow-400 to-pink-500 transition-all" style={{ width: `${progress}%` }} />
                </div>

                <div className="grid gap-6 lg:grid-cols-5">
                    <section className="space-y-4 rounded-2xl border border-slate-800 bg-[#070b18]/90 p-5 lg:col-span-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <h2 className="flex items-center gap-2 font-black text-white"><Sparkles size={18} className="text-neon" /> Gana monedas</h2>
                            <div className="flex gap-1 rounded-xl border border-slate-800 p-1 text-xs">
                                <button type="button" onClick={() => setTab('reflex')} className={`flex items-center gap-1 rounded-lg px-3 py-1.5 ${tab === 'reflex' ? 'bg-cyan-500/20 text-cyan-200' : 'text-slate-400'}`}>
                                    <Crosshair size={13} /> Núcleos
                                </button>
                                <button type="button" onClick={() => setTab('memory')} className={`flex items-center gap-1 rounded-lg px-3 py-1.5 ${tab === 'memory' ? 'bg-pink-500/20 text-pink-200' : 'text-slate-400'}`}>
                                    <Brain size={13} /> Memoria
                                </button>
                            </div>
                        </div>
                        {tab === 'reflex' ? <ReflexGame onDone={onDone} /> : <MemoryGame onDone={onDone} />}
                        <div className="border-t border-slate-800 pt-4">
                            <RewardedAd ads={ads} onDone={onDone} />
                        </div>
                    </section>

                    <section className="space-y-4 rounded-2xl border border-yellow-400/30 bg-[#0b0a05]/80 p-5 lg:col-span-2">
                        <h2 className="flex items-center gap-2 font-black text-white"><Server size={18} className="text-yellow-300" /> Canjear servidor gratis</h2>
                        <ul className="space-y-1 font-mono text-[11px] text-slate-400">
                            <li>· 1 servidor gratuito activo por cuenta.</li>
                            <li>· Dura {freePlans[0]?.coin_days ?? 7} días; renuévalo con monedas antes de que caduque.</li>
                            <li>· Si caduca se detiene y se borra a los 7 días.</li>
                            <li>· Sin ampliaciones: para más recursos compra un plan.</li>
                        </ul>
                        <ClaimForm plans={freePlans} balance={balance} />
                    </section>
                </div>

                {freeServers.length > 0 && (
                    <section className="space-y-3 rounded-2xl border border-slate-800 bg-[#070b18]/90 p-5">
                        <h2 className="font-black text-white">Tus servidores gratuitos</h2>
                        {freeServers.map((o) => (
                            <div key={o.id} className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-black/40 p-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0">
                                    <p className="truncate font-bold text-white">{o.server_name}</p>
                                    <p className="font-mono text-[11px] text-slate-400">
                                        {o.plan?.name} · {o.status === 'active' ? `caduca ${fmtDate(o.renews_at)}` : 'caducado (detenido)'}
                                        {o.server_address && ` · ${o.server_address}`}
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {o.status === 'active' && (
                                        <button
                                            type="button"
                                            onClick={() => router.post(route('coins.renew', o.id), {}, { preserveScroll: true })}
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-yellow-400/50 px-3 py-2 text-xs font-bold text-yellow-300 hover:bg-yellow-400/10"
                                        >
                                            <RefreshCw size={13} /> Renovar ({o.plan?.coin_renew_cost})
                                        </button>
                                    )}
                                    <Link
                                        href={route('store.category', o.plan?.category ?? 'minecraft')}
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 px-3 py-2 text-xs font-bold text-white hover:brightness-110"
                                    >
                                        <TrendingUp size={13} /> Ampliar (de pago)
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </section>
                )}

                {history.length > 0 && (
                    <section className="rounded-2xl border border-slate-800 bg-[#070b18]/90 p-5">
                        <h2 className="mb-3 font-black text-white">Movimientos</h2>
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
                    </section>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
