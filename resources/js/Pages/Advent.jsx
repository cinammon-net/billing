import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Check, Coins, Crown, Gift, Lock, Sparkles, Star, Trophy, Wrench, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const ACCENT_STYLES = {
    emerald: {
        badge: 'border-emerald-400/50 bg-emerald-500/15 text-emerald-200',
        glow: 'from-emerald-500/20 via-red-500/15 to-amber-500/20',
        readyBorder: 'border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.45)]',
        btn: 'from-emerald-500 via-teal-500 to-cyan-500 hover:brightness-110',
    },
    orange: {
        badge: 'border-orange-400/50 bg-orange-500/15 text-orange-200',
        glow: 'from-orange-500/20 via-purple-500/15 to-amber-500/20',
        readyBorder: 'border-orange-400 shadow-[0_0_25px_rgba(249,115,22,0.45)]',
        btn: 'from-orange-500 via-amber-500 to-pink-500 hover:brightness-110',
    },
    cyan: {
        badge: 'border-cyan-400/50 bg-cyan-500/15 text-cyan-200',
        glow: 'from-cyan-500/20 via-sky-500/15 to-yellow-500/20',
        readyBorder: 'border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.45)]',
        btn: 'from-cyan-500 via-sky-500 to-blue-500 hover:brightness-110',
    },
    pink: {
        badge: 'border-pink-400/50 bg-pink-500/15 text-pink-200',
        glow: 'from-pink-500/20 via-fuchsia-500/15 to-purple-500/20',
        readyBorder: 'border-pink-400 shadow-[0_0_25px_rgba(236,72,153,0.45)]',
        btn: 'from-pink-500 via-fuchsia-500 to-purple-600 hover:brightness-110',
    },
};

function AdminAdventPanel({ advent, themes }) {
    const { data, setData, put, processing } = useForm({
        mode: advent.mode || 'auto',
        theme: advent.theme_key || 'christmas',
        multiplier: advent.multiplier || 100,
        allow_catchup: Boolean(advent.allow_catchup),
        override_day: advent.override_day ?? '',
        reset_edition: false,
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.advent.update'), {
            preserveScroll: true,
            onSuccess: () => setData('reset_edition', false),
        });
    };

    return (
        <form onSubmit={submit} className="rounded-2xl border border-amber-500/30 bg-[#080c1a]/90 p-5 font-mono text-xs text-slate-200 shadow-lg">
            <div className="mb-4 flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-sm font-bold text-amber-300">
                    <Wrench size={16} /> Panel de Admin · Configurar Calendario y Eventos
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] text-slate-400">
                    Edición: {advent.edition}
                </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <label className="space-y-1">
                    <span className="block text-[11px] text-slate-400">Estado / Modo</span>
                    <select
                        value={data.mode}
                        onChange={(e) => setData('mode', e.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-black/70 px-3 py-2 text-xs text-white focus:border-pink-500"
                    >
                        <option value="auto">🎄 Automático (1–25 Dic)</option>
                        <option value="active">🟢 Activo ahora (manual)</option>
                        <option value="off">⏸️ Desactivado</option>
                    </select>
                </label>

                <label className="space-y-1">
                    <span className="block text-[11px] text-slate-400">Temática del evento</span>
                    <select
                        value={data.theme}
                        onChange={(e) => setData('theme', e.target.value)}
                        className="w-full rounded-lg border border-slate-700 bg-black/70 px-3 py-2 text-xs text-white focus:border-pink-500"
                    >
                        {themes.map((t) => (
                            <option key={t.key} value={t.key}>
                                {t.emoji} {t.title}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="space-y-1">
                    <span className="block text-[11px] text-slate-400">Multiplicador premios (%)</span>
                    <input
                        type="number"
                        min={50}
                        max={500}
                        step={10}
                        value={data.multiplier}
                        onChange={(e) => setData('multiplier', Number(e.target.value))}
                        className="w-full rounded-lg border border-slate-700 bg-black/70 px-3 py-2 text-xs text-white focus:border-pink-500"
                    />
                </label>

                <label className="space-y-1">
                    <span className="block text-[11px] text-slate-400">Día actual (vacío = auto)</span>
                    <input
                        type="number"
                        min={1}
                        max={24}
                        placeholder={`Auto (hoy: día ${advent.current_day})`}
                        value={data.override_day}
                        onChange={(e) => setData('override_day', e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full rounded-lg border border-slate-700 bg-black/70 px-3 py-2 text-xs text-white focus:border-pink-500"
                    />
                </label>

                <div className="flex flex-col justify-end gap-2">
                    <label className="flex cursor-pointer items-center gap-2 text-[11px] text-slate-300">
                        <input
                            type="checkbox"
                            checked={data.allow_catchup}
                            onChange={(e) => setData('allow_catchup', e.target.checked)}
                            className="rounded border-slate-600 bg-black text-pink-500"
                        />
                        Permitir abrir días pasados
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 text-[11px] text-amber-300/90">
                        <input
                            type="checkbox"
                            checked={data.reset_edition}
                            onChange={(e) => setData('reset_edition', e.target.checked)}
                            className="rounded border-slate-600 bg-black text-amber-500"
                        />
                        Reiniciar casillas de todos
                    </label>
                </div>
            </div>

            <div className="mt-4 flex justify-end">
                <button
                    type="submit"
                    disabled={processing}
                    className="rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2 text-xs font-bold text-black transition hover:brightness-110 disabled:opacity-50"
                >
                    Guardar cambios del calendario
                </button>
            </div>
        </form>
    );
}

export default function Advent({ advent, claimedDays = [], totalEarned = 0, themes = [], rewardModal }) {
    const { auth, coins = 0, flash, errors, panelUrl } = usePage().props;
    const [busyDay, setBusyDay] = useState(null);
    const [modal, setModal] = useState(rewardModal || null);

    useEffect(() => {
        if (rewardModal) setModal(rewardModal);
    }, [rewardModal]);

    const theme = advent.theme || {};
    const accent = ACCENT_STYLES[theme.accent] || ACCENT_STYLES.emerald;
    const openedSet = new Set(claimedDays);
    const openedCount = openedSet.size;
    const loginHref = `${panelUrl}/billing/redirect`;

    const openDoor = (day) => {
        if (!auth?.user) {
            window.location.href = loginHref;
            return;
        }
        setBusyDay(day);
        router.post(
            route('advent.claim', day),
            {},
            {
                preserveScroll: true,
                onFinish: () => setBusyDay(null),
            },
        );
    };

    const maxReward = (advent.doors || []).reduce((sum, d) => sum + d.coins, 0) + (advent.milestones || []).reduce((sum, m) => sum + m.coins, 0);

    return (
        <PublicLayout>
            <Head title={`${theme.title || 'Calendario de Adviento'} — Cinammon`} />

            <div className="relative mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
                {/* Resplandor temático superior */}
                <div className={`pointer-events-none absolute inset-x-0 -top-10 -z-10 h-80 rounded-full bg-gradient-to-r ${accent.glow} blur-[120px]`} />

                {/* Cabecera principal */}
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#070b18]/90 p-6 sm:p-10 shadow-[0_20px_70px_rgba(0,0,0,0.6)]">
                    <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
                        <div className="max-w-2xl space-y-3">
                            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 font-mono text-xs font-bold tracking-wider ${accent.badge}`}>
                                {theme.badge}
                            </span>
                            <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl">
                                {theme.emoji} {theme.title}
                            </h1>
                            <p className="text-sm leading-relaxed text-slate-300 sm:text-base">{theme.subtitle}</p>
                        </div>

                        {/* Tarjeta de estado del jugador */}
                        <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/50 p-5 font-mono text-xs sm:min-w-[300px]">
                            <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                <span className="text-slate-400">Día disponible hoy</span>
                                <span className="rounded-lg bg-white/10 px-2.5 py-1 text-sm font-black text-white">
                                    Casilla #{advent.current_day} / 24
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-400">Casillas abiertas</span>
                                <span className="font-bold text-emerald-300">{openedCount} de 24</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-400">Ganado en este evento</span>
                                <span className="font-bold text-yellow-300">+{totalEarned} monedas</span>
                            </div>
                            {auth?.user ? (
                                <Link
                                    href={route('coins.index')}
                                    className="mt-1 flex items-center justify-between rounded-xl border border-yellow-400/40 bg-yellow-400/10 px-3.5 py-2.5 font-bold text-yellow-200 transition hover:bg-yellow-400/20"
                                >
                                    <span className="flex items-center gap-1.5">
                                        <Coins size={15} className="text-yellow-300" /> Saldo: {coins} monedas
                                    </span>
                                    <span>Canjear servidor →</span>
                                </Link>
                            ) : (
                                <a
                                    href={loginHref}
                                    className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-fuchsia-600 px-4 py-2.5 font-bold text-white shadow transition hover:brightness-110"
                                >
                                    <Gift size={15} /> Iniciar sesión para abrir regalos
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Barra de progreso y Metas (Milestones) */}
                    <div className="mt-8 space-y-3 border-t border-white/10 pt-6">
                        <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
                            <span className="flex items-center gap-1.5 font-bold text-slate-200">
                                <Trophy size={15} className="text-amber-400" /> Metas extra de la edición (hasta {maxReward} monedas en total)
                            </span>
                            <span className="text-slate-400">
                                {advent.allow_catchup
                                    ? '✨ Puedes abrir la casilla de hoy y también las de días anteriores'
                                    : '⏰ Abre cada día su casilla correspondiente para no perder la racha'}
                            </span>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                            {(advent.milestones || []).map((m) => {
                                const done = openedCount >= m.count;
                                return (
                                    <div
                                        key={m.count}
                                        className={`flex items-center justify-between rounded-xl border px-4 py-3 font-mono text-xs transition ${
                                            done
                                                ? 'border-emerald-400/50 bg-emerald-500/15 text-emerald-100'
                                                : 'border-white/10 bg-white/[0.03] text-slate-300'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <span
                                                className={`flex h-7 w-7 items-center justify-center rounded-lg font-bold ${
                                                    done ? 'bg-emerald-400 text-black' : 'bg-white/10 text-slate-300'
                                                }`}
                                            >
                                                {done ? <Check size={15} /> : m.count}
                                            </span>
                                            <div>
                                                <p className="font-bold">{m.label}</p>
                                                <p className="text-[10px] opacity-75">
                                                    {done ? '¡Meta conseguida!' : `Te faltan ${Math.max(0, m.count - openedCount)} casillas`}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="rounded-lg bg-yellow-400/20 px-2.5 py-1 font-extrabold text-yellow-300">
                                            +{m.coins} 🪙
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Alertas */}
                {flash?.success && (
                    <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/15 px-5 py-3 font-mono text-xs font-bold text-emerald-200">
                        {flash.success}
                    </div>
                )}
                {errors?.advent && (
                    <div className="rounded-2xl border border-red-500/40 bg-red-500/15 px-5 py-3 font-mono text-xs font-bold text-red-200">
                        {errors.advent}
                    </div>
                )}

                {/* Panel de administrador (solo visible para admins) */}
                {auth?.user?.is_admin && <AdminAdventPanel advent={advent} themes={themes} />}

                {!advent.active && (
                    <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-6 text-center font-mono text-sm text-amber-200">
                        El calendario se activará automáticamente el <strong>1 de diciembre</strong>.
                        {auth?.user?.is_admin && ' (Como administrador puedes activarlo ahora mismo desde el panel superior).'}
                    </div>
                )}

                {/* Cuadrícula de las 24 casillas */}
                <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {(advent.doors || []).map((door) => {
                        const isClaimed = openedSet.has(door.day);
                        const isToday = advent.active && door.day === advent.current_day;
                        const canCatchUp = advent.active && advent.allow_catchup && door.day < advent.current_day && !isClaimed;
                        const canOpen = !isClaimed && (isToday || canCatchUp);
                        const isPastMissed = advent.active && door.day < advent.current_day && !isClaimed && !advent.allow_catchup;
                        const isGrand = door.tier === 'grand';
                        const isSpecial = door.tier === 'special';

                        const emoji = isGrand ? theme.grand_emoji : isSpecial ? theme.special_emoji : theme.box_emoji;

                        return (
                            <div
                                key={door.day}
                                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-4 transition duration-300 ${
                                    isGrand ? 'col-span-2 sm:col-span-2' : ''
                                } ${
                                    isClaimed
                                        ? 'border-emerald-500/50 bg-gradient-to-b from-emerald-950/50 to-[#070b18]/90'
                                        : canOpen
                                          ? `${accent.readyBorder} bg-gradient-to-b from-white/[0.09] to-[#090e20] hover:-translate-y-1`
                                          : isGrand
                                            ? 'border-amber-400/40 bg-gradient-to-b from-amber-950/30 to-[#070b18]/90'
                                            : isSpecial
                                              ? 'border-purple-400/30 bg-gradient-to-b from-purple-950/25 to-[#070b18]/90'
                                              : 'border-white/10 bg-[#070b18]/75 opacity-80'
                                }`}
                            >
                                {/* Cabecera de la casilla */}
                                <div className="flex items-center justify-between font-mono">
                                    <span
                                        className={`inline-flex h-8 w-8 items-center justify-center rounded-xl text-sm font-black ${
                                            isClaimed
                                                ? 'bg-emerald-400 text-black'
                                                : canOpen
                                                  ? 'bg-white text-black shadow'
                                                  : isGrand
                                                    ? 'bg-amber-400/20 text-amber-300'
                                                    : 'bg-white/10 text-slate-300'
                                        }`}
                                    >
                                        {door.day}
                                    </span>

                                    {isClaimed ? (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                                            <Check size={11} /> Abierta
                                        </span>
                                    ) : isToday ? (
                                        <span className="animate-pulse rounded-full bg-pink-500 px-2.5 py-0.5 text-[10px] font-extrabold text-white">
                                            ¡HOY!
                                        </span>
                                    ) : canCatchUp ? (
                                        <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-200">
                                            Disponible
                                        </span>
                                    ) : isPastMissed ? (
                                        <span className="text-[10px] text-slate-500">Pasado</span>
                                    ) : (
                                        <Lock size={13} className="text-slate-500" />
                                    )}
                                </div>

                                {/* Icono central y etiqueta */}
                                <div className="my-4 flex flex-col items-center text-center">
                                    <div
                                        className={`text-4xl transition duration-300 ${
                                            canOpen ? 'animate-bounce group-hover:scale-125' : isClaimed ? 'scale-95 opacity-80' : 'opacity-70'
                                        }`}
                                    >
                                        {isClaimed ? '✨' : emoji}
                                    </div>
                                    <p className="mt-2 font-mono text-[11px] font-bold text-slate-200">{door.label}</p>
                                    <span
                                        className={`mt-1 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-xs font-extrabold ${
                                            isGrand
                                                ? 'bg-amber-400/25 text-amber-200'
                                                : isSpecial
                                                  ? 'bg-purple-400/25 text-purple-200'
                                                  : 'bg-yellow-400/15 text-yellow-300'
                                        }`}
                                    >
                                        +{door.coins} monedas
                                    </span>
                                </div>

                                {/* Botón de acción */}
                                {isClaimed ? (
                                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-2 text-center font-mono text-[11px] font-bold text-emerald-300">
                                        ✓ Recogido
                                    </div>
                                ) : canOpen ? (
                                    <button
                                        type="button"
                                        disabled={busyDay === door.day}
                                        onClick={() => openDoor(door.day)}
                                        className={`w-full rounded-xl bg-gradient-to-r ${accent.btn} py-2.5 font-mono text-xs font-extrabold text-white shadow-lg transition active:scale-95 disabled:opacity-50`}
                                    >
                                        {busyDay === door.day ? 'Abriendo...' : `¡Abrir #${door.day}!`}
                                    </button>
                                ) : (
                                    <div className="rounded-xl border border-white/5 bg-black/40 py-2 text-center font-mono text-[11px] text-slate-500">
                                        {isPastMissed ? 'Cerrada' : `Día ${door.day}`}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Modal de celebración al abrir una casilla */}
            {modal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
                    onClick={() => setModal(null)}
                    role="dialog"
                    aria-modal="true"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-md overflow-hidden rounded-3xl border-2 border-yellow-400/70 bg-[#080d1d] p-7 text-center shadow-[0_0_50px_rgba(250,204,21,0.35)]"
                    >
                        <button
                            type="button"
                            onClick={() => setModal(null)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white"
                            aria-label="Cerrar"
                        >
                            <X size={20} />
                        </button>

                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-400/20 text-4xl">
                            {theme.box_emoji || '🎁'}
                        </div>

                        <p className="mt-4 font-mono text-xs font-bold tracking-widest text-yellow-300 uppercase">
                            ¡Casilla #{modal.day} desbloqueada!
                        </p>
                        <h2 className="mt-1 text-3xl font-black text-white">+{modal.coins + (modal.bonus_coins || 0)} monedas</h2>

                        {modal.bonus_coins > 0 && (
                            <div className="mt-3 rounded-xl border border-emerald-400/40 bg-emerald-500/15 px-3 py-2 font-mono text-xs text-emerald-200">
                                🎉 <strong>¡Meta alcanzada ({modal.milestone_label})!</strong> Incluye +{modal.bonus_coins} monedas de bonus.
                            </div>
                        )}

                        <p className="mt-3 text-xs text-slate-300">
                            Ya se han sumado a tu cuenta. Llevas <strong>{modal.opened_count} de 24</strong> casillas abiertas en esta edición.
                        </p>

                        <div className="mt-6 flex flex-col gap-2 font-mono text-xs">
                            <Link
                                href={route('coins.index')}
                                className="rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 px-5 py-3 font-extrabold text-black transition hover:brightness-110"
                            >
                                Usar mis monedas en un servidor gratis →
                            </Link>
                            <button
                                type="button"
                                onClick={() => setModal(null)}
                                className="rounded-xl border border-white/10 py-2.5 text-slate-300 hover:bg-white/5"
                            >
                                Seguir viendo el calendario
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </PublicLayout>
    );
}
