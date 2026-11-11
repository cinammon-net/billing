import { usePage } from '@inertiajs/react';
import {
    CalendarDays,
    Check,
    ChevronLeft,
    ChevronRight,
    Clock,
    Coins,
    Copy,
    Crown,
    Flame,
    Gift,
    Megaphone,
    Rocket,
    Server,
    ShieldCheck,
    Sparkles,
    X,
    Zap,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const TYPE_STYLES = {
    offer: {
        label: 'Oferta',
        icon: Flame,
        bar: 'border-pink-500/60 from-pink-950/95 via-fuchsia-950/95 to-rose-950/95 text-pink-50',
        chip: 'bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white',
        glow: 'from-pink-500/35 via-fuchsia-500/20 to-amber-500/30',
        border: 'border-pink-500 shadow-[0_0_60px_rgba(236,72,153,0.45)]',
        cta: 'from-pink-500 via-fuchsia-500 to-rose-500 text-white shadow-[0_0_30px_rgba(236,72,153,0.55)]',
    },
    new: {
        label: 'Servidor Gratis',
        icon: Sparkles,
        bar: 'border-amber-500/60 from-amber-950/95 via-orange-950/90 to-pink-950/95 text-amber-50',
        chip: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black',
        glow: 'from-amber-500/35 via-yellow-500/25 to-pink-500/25',
        border: 'border-amber-400 shadow-[0_0_60px_rgba(245,158,11,0.45)]',
        cta: 'from-amber-400 via-yellow-400 to-orange-500 text-black shadow-[0_0_30px_rgba(245,158,11,0.55)]',
    },
    event: {
        label: 'Evento',
        icon: CalendarDays,
        bar: 'border-violet-500/60 from-violet-950/95 via-purple-950/95 to-fuchsia-950/95 text-violet-50',
        chip: 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white',
        glow: 'from-violet-500/35 via-fuchsia-500/25 to-pink-500/25',
        border: 'border-violet-400 shadow-[0_0_60px_rgba(167,139,250,0.45)]',
        cta: 'from-violet-500 via-fuchsia-500 to-pink-500 text-white shadow-[0_0_30px_rgba(167,139,250,0.55)]',
    },
    news: {
        label: 'Noticia',
        icon: Megaphone,
        bar: 'border-rose-500/60 from-rose-950/95 via-pink-950/95 to-purple-950/95 text-rose-50',
        chip: 'bg-rose-500 text-white',
        glow: 'from-rose-500/30 via-pink-500/20 to-purple-500/25',
        border: 'border-rose-400 shadow-[0_0_50px_rgba(244,63,94,0.4)]',
        cta: 'from-rose-500 to-pink-600 text-white shadow-[0_0_25px_rgba(244,63,94,0.45)]',
    },
};

const DISMISS_KEY = 'announcements-dismissed';
const POPUP_KEY = 'announcements-popup-seen-v3';

function readIds(key) {
    try {
        const v = JSON.parse(localStorage.getItem(key) || '[]');
        return Array.isArray(v) ? v.filter((n) => typeof n === 'number') : [];
    } catch {
        return [];
    }
}

function writeIds(key, ids) {
    try {
        localStorage.setItem(key, JSON.stringify(Array.from(new Set(ids)).slice(-50)));
    } catch {
        /* sin almacenamiento */
    }
}

function endsIn(iso, now) {
    if (!iso) return null;
    const ms = new Date(iso).getTime() - now;
    if (ms <= 0 || ms > 7 * 86400000) return null;
    const mins = Math.floor(ms / 60000);
    const d = Math.floor(mins / 1440);
    const h = Math.floor((mins % 1440) / 60);
    const m = mins % 60;
    if (d > 0) return `${d}d ${h}h`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m} min`;
}

function isFreeServerAnnouncement(a) {
    const text = `${a?.highlight || ''} ${a?.title || ''} ${a?.cta_url || ''}`.toLowerCase();
    return text.includes('gratis') || text.includes('0,00') || text.includes('0€') || text.includes('/free') || text.includes('/coins');
}

function visualPills(a) {
    if (isFreeServerAnnouncement(a)) {
        return [
            { icon: Zap, text: 'Activo en 60s' },
            { icon: Coins, text: '0 € con monedas' },
            { icon: Server, text: 'Juegos, Bots y Web' },
        ];
    }
    if (a?.type === 'event') {
        return [
            { icon: Gift, text: '1 Regalo diario' },
            { icon: Crown, text: '2x Clientes VIP' },
            { icon: Clock, text: '+13 días gratis' },
        ];
    }
    return [
        { icon: Zap, text: 'Descuento directo' },
        { icon: ShieldCheck, text: 'Anti-DDoS Pro' },
        { icon: Rocket, text: 'Activación al instante' },
    ];
}

export default function AnnouncementBanner() {
    const { announcements, panelUrl } = usePage().props;
    const [now, setNow] = useState(() => Date.now());
    const [dismissed, setDismissed] = useState(() => readIds(DISMISS_KEY));
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const [copied, setCopied] = useState(false);

    const [popupVisible, setPopupVisible] = useState(false);
    const [popupIdx, setPopupIdx] = useState(0);
    const [popupPaused, setPopupPaused] = useState(false);

    useEffect(() => {
        const t = setInterval(() => setNow(Date.now()), 30000);
        return () => clearInterval(t);
    }, []);

    const live = useMemo(
        () =>
            (announcements || []).filter(
                (a) => new Date(a.starts_at).getTime() <= now && (!a.ends_at || new Date(a.ends_at).getTime() > now),
            ),
        [announcements, now],
    );

    const items = live.filter((a) => !dismissed.includes(a.id));
    const popups = useMemo(() => live.filter((a) => a.popup), [live]);
    const popupIdsKey = popups.map((p) => p.id).join(',');

    useEffect(() => {
        if (items.length < 2 || paused) return;
        const t = setInterval(() => setIndex((i) => (i + 1) % items.length), 6000);
        return () => clearInterval(t);
    }, [items.length, paused]);

    useEffect(() => {
        if (popups.length === 0) return;
        const seen = readIds(POPUP_KEY);
        const firstUnseen = popups.findIndex((p) => !seen.includes(p.id));
        if (firstUnseen === -1) return;

        const t = setTimeout(() => {
            setPopupIdx(firstUnseen);
            setPopupVisible(true);
        }, 1200);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [popupIdsKey]);

    useEffect(() => {
        if (!popupVisible || popups.length < 2 || popupPaused) return;
        const t = setInterval(() => setPopupIdx((i) => (i + 1) % popups.length), 5500);
        return () => clearInterval(t);
    }, [popupVisible, popups.length, popupPaused]);

    const sendClick = (id) => {
        try {
            const base = (panelUrl || 'https://panel.cinammon.net').replace(/\/$/, '');
            fetch(`${base}/api/announcements/${id}/click`, { method: 'POST', keepalive: true }).catch(() => {});
        } catch {
            /* opcional */
        }
    };

    const closePopup = () => {
        writeIds(POPUP_KEY, [...readIds(POPUP_KEY), ...popups.map((p) => p.id)]);
        setPopupVisible(false);
    };

    const goToPopup = (target) => {
        if (!target?.cta_url) return;
        sendClick(target.id);
        writeIds(POPUP_KEY, [...readIds(POPUP_KEY), target.id]);
        window.location.href = target.cta_url;
    };

    const a = items.length > 0 ? items[index % items.length] : null;
    const isFree = a ? isFreeServerAnnouncement(a) : false;
    const style = a ? (isFree ? TYPE_STYLES.new : TYPE_STYLES[a.type] || TYPE_STYLES.news) : TYPE_STYLES.news;
    const Icon = style.icon;
    const left = a ? endsIn(a.ends_at, now) : null;

    const currentPopup = popups.length > 0 ? popups[popupIdx % popups.length] || popups[0] : null;
    const otherPopups = currentPopup ? popups.filter((p) => p.id !== currentPopup.id) : [];
    const popupIsFree = currentPopup ? isFreeServerAnnouncement(currentPopup) : false;
    const popupStyle = currentPopup
        ? popupIsFree
            ? TYPE_STYLES.new
            : TYPE_STYLES[currentPopup.type] || TYPE_STYLES.offer
        : TYPE_STYLES.offer;
    const PopupIcon = popupIsFree ? Gift : currentPopup?.type === 'offer' ? Flame : popupStyle.icon;
    const popupLeft = currentPopup ? endsIn(currentPopup.ends_at, now) : null;
    const pills = currentPopup ? visualPills(currentPopup) : [];

    const dismiss = () => {
        if (!a) return;
        const next = [...dismissed, a.id];
        setDismissed(next);
        writeIds(DISMISS_KEY, next);
    };

    const copyCoupon = (code) => {
        if (!code) return;
        navigator.clipboard?.writeText(code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        });
    };

    return (
        <>
            {a && (
                <div
                    role="region"
                    aria-label="Anuncios"
                    onMouseEnter={() => setPaused(true)}
                    onMouseLeave={() => setPaused(false)}
                    className={`relative z-40 flex items-center justify-center gap-3 border-b bg-gradient-to-r px-10 py-2 font-mono text-xs ${style.bar}`}
                >
                    <div className="flex min-w-0 flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-center">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider uppercase ${style.chip}`}>
                            <Icon size={12} /> {isFree ? '100% GRATIS' : style.label}
                        </span>
                        {a.highlight && (
                            <span className="rounded bg-amber-400/20 px-1.5 py-0.5 text-sm font-black tracking-wide text-amber-300">
                                {a.highlight}
                            </span>
                        )}
                        <strong className="tracking-wide text-white">{a.title}</strong>
                        {a.coupon_code && (
                            <button
                                type="button"
                                onClick={() => copyCoupon(a.coupon_code)}
                                title="Copiar cupón"
                                className="inline-flex items-center gap-1 rounded border border-dashed border-white/50 bg-black/30 px-2 py-0.5 font-mono text-[11px] font-bold tracking-wider hover:bg-white/10"
                            >
                                {copied ? <Check size={12} /> : <Copy size={12} />}
                                {copied ? 'COPIADO' : a.coupon_code}
                            </button>
                        )}
                        {left && (
                            <span className="inline-flex items-center gap-1 font-sans text-[11px] font-bold text-amber-200">
                                <Clock className="h-3 w-3" /> {left}
                            </span>
                        )}
                        {a.cta_url && (
                            <a
                                href={a.cta_url}
                                onClick={() => sendClick(a.id)}
                                target={a.cta_url.startsWith('http') ? '_blank' : undefined}
                                rel={a.cta_url.startsWith('http') ? 'noopener noreferrer' : undefined}
                                className="rounded-lg bg-white px-3 py-1 font-extrabold whitespace-nowrap text-black shadow transition hover:scale-105 hover:bg-amber-300"
                            >
                                {a.cta_label || 'Entrar ahora'}
                            </a>
                        )}
                        {popups.length > 0 && (
                            <button
                                type="button"
                                onClick={() => {
                                    const idx = popups.findIndex((p) => p.id === a.id);
                                    setPopupIdx(idx >= 0 ? idx : 0);
                                    setPopupVisible(true);
                                }}
                                className="hidden items-center gap-1 rounded-lg border border-white/25 bg-black/30 px-2 py-0.5 font-sans text-[11px] text-white/85 transition hover:border-white hover:text-white sm:inline-flex"
                            >
                                <Sparkles size={12} className="text-amber-300" /> Ver cartel
                            </button>
                        )}
                    </div>
                    <button onClick={dismiss} className="absolute top-1/2 right-3 -translate-y-1/2 opacity-60 hover:opacity-100" aria-label="Ocultar anuncio">
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Cartel en grande multi-anuncio (sin emojis ni cyan) */}
            {popupVisible && currentPopup && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
                    onClick={closePopup}
                    role="dialog"
                    aria-modal="true"
                    aria-label={currentPopup.title}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        onMouseEnter={() => setPopupPaused(true)}
                        onMouseLeave={() => setPopupPaused(false)}
                        className={`relative w-full max-w-lg overflow-hidden rounded-3xl border-2 bg-[#080612]/95 p-6 text-center font-mono text-white sm:p-8 ${popupStyle.border}`}
                    >
                        <div className={`pointer-events-none absolute -top-24 left-1/2 h-64 w-80 -translate-x-1/2 rounded-full bg-gradient-to-r ${popupStyle.glow} blur-3xl`} />

                        <button
                            type="button"
                            onClick={closePopup}
                            className="absolute top-4 right-4 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/80 transition hover:bg-white/20 hover:text-white"
                            aria-label="Cerrar"
                        >
                            <X size={16} />
                        </button>

                        {popups.length > 1 && (
                            <div className="relative z-10 mb-5 flex flex-wrap items-center justify-center gap-2 pr-6">
                                {popups.map((p, idx) => {
                                    const active = idx === popupIdx % popups.length;
                                    const freeTab = isFreeServerAnnouncement(p);
                                    const TabIcon = freeTab ? Gift : Flame;
                                    return (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => setPopupIdx(idx)}
                                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-extrabold tracking-wider uppercase transition ${
                                                active
                                                    ? freeTab
                                                        ? 'border-amber-300 bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.6)]'
                                                        : 'border-pink-300 bg-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.6)]'
                                                    : 'border-white/15 bg-white/5 text-slate-300 hover:border-white/40 hover:text-white'
                                            }`}
                                        >
                                            <TabIcon size={13} />
                                            <span>{p.highlight || (freeTab ? 'GRATIS' : 'OFERTA')}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        <div
                            onClick={() => currentPopup.cta_url && goToPopup(currentPopup)}
                            className={`relative z-10 space-y-4 ${currentPopup.cta_url ? 'cursor-pointer' : ''}`}
                        >
                            <div>
                                <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-[11px] font-black tracking-widest uppercase ${popupStyle.chip}`}>
                                    <PopupIcon size={14} /> {popupIsFree ? 'SERVIDORES 100% GRATIS' : popupStyle.label}
                                    {popupLeft && (
                                        <span className="ml-1 inline-flex items-center gap-1 rounded bg-black/25 px-1.5 py-0.5 text-[10px]">
                                            <Clock size={10} /> {popupLeft}
                                        </span>
                                    )}
                                </span>
                            </div>

                            <div className="py-1">
                                <p className="font-sans text-6xl font-black tracking-tight text-amber-300 drop-shadow-[0_0_25px_rgba(251,191,36,0.65)] sm:text-7xl">
                                    {currentPopup.highlight || (popupIsFree ? '0,00 €' : 'OFERTA')}
                                </p>
                            </div>

                            <h2 className="mx-auto max-w-md font-sans text-xl leading-tight font-black tracking-wide text-white uppercase sm:text-2xl">
                                {currentPopup.title}
                            </h2>

                            <div className="flex flex-wrap items-center justify-center gap-2 pt-1 font-sans text-xs font-bold">
                                {pills.map((pill) => {
                                    const PillIcon = pill.icon;
                                    return (
                                        <span key={pill.text} className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.07] px-3 py-1.5 text-slate-100">
                                            <PillIcon size={13} className="text-amber-300" />
                                            {pill.text}
                                        </span>
                                    );
                                })}
                            </div>

                            {currentPopup.message && (
                                <p className="mx-auto max-w-sm line-clamp-2 font-sans text-xs leading-relaxed text-slate-300 sm:text-sm">
                                    {currentPopup.message}
                                </p>
                            )}

                            <div className="pt-2" onClick={(e) => e.stopPropagation()}>
                                {currentPopup.cta_url && (
                                    <a
                                        href={currentPopup.cta_url}
                                        onClick={() => {
                                            sendClick(currentPopup.id);
                                            writeIds(POPUP_KEY, [...readIds(POPUP_KEY), currentPopup.id]);
                                        }}
                                        className={`group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r py-4 font-sans text-sm font-black tracking-wider uppercase transition duration-200 hover:scale-[1.02] hover:brightness-110 active:scale-95 sm:text-base ${popupStyle.cta}`}
                                    >
                                        <Rocket size={18} />
                                        <span>{currentPopup.cta_label || (popupIsFree ? 'Crear servidor gratis' : 'Aprovechar ahora')}</span>
                                    </a>
                                )}
                            </div>
                        </div>

                        {otherPopups.length > 0 && (
                            <div className="relative z-10 mt-5 space-y-2 border-t border-white/10 pt-4 text-left">
                                {otherPopups.slice(0, 2).map((other) => {
                                    const otherFree = isFreeServerAnnouncement(other);
                                    return (
                                        <div
                                            key={other.id}
                                            onClick={() => (other.cta_url ? goToPopup(other) : setPopupIdx(popups.findIndex((p) => p.id === other.id)))}
                                            className={`group flex cursor-pointer items-center justify-between gap-3 rounded-2xl border p-3 transition hover:scale-[1.01] ${
                                                otherFree
                                                    ? 'border-amber-400/40 bg-amber-500/10 hover:border-amber-400 hover:bg-amber-500/20'
                                                    : 'border-pink-400/40 bg-pink-500/10 hover:border-pink-400 hover:bg-pink-500/20'
                                            }`}
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                <span
                                                    className={`shrink-0 rounded-xl px-2.5 py-1.5 text-xs font-black ${
                                                        otherFree ? 'bg-amber-400 text-black' : 'bg-pink-500 text-white'
                                                    }`}
                                                >
                                                    {other.highlight || (otherFree ? '0,00 €' : 'OFERTA')}
                                                </span>
                                                <div className="min-w-0 font-sans">
                                                    <p className="truncate text-xs font-extrabold text-white">{other.title}</p>
                                                    <p className="truncate text-[11px] text-slate-300">
                                                        {otherFree ? 'Siempre disponible · Gana monedas y crea gratis' : other.message || 'Pulsa para acceder ahora'}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="shrink-0 rounded-xl bg-white/15 px-3 py-1.5 font-sans text-[11px] font-extrabold text-white transition group-hover:bg-white group-hover:text-black">
                                                {other.cta_label || 'Ir'}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="relative z-10 mt-4 flex items-center justify-between font-sans text-xs text-slate-400">
                            {popups.length > 1 ? (
                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => setPopupIdx((i) => (i - 1 + popups.length) % popups.length)}
                                        className="rounded-lg border border-white/10 bg-white/5 p-1 hover:bg-white/15 hover:text-white"
                                        aria-label="Anterior"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <span className="px-1 font-mono text-[11px]">
                                        {(popupIdx % popups.length) + 1} / {popups.length}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setPopupIdx((i) => (i + 1) % popups.length)}
                                        className="rounded-lg border border-white/10 bg-white/5 p-1 hover:bg-white/15 hover:text-white"
                                        aria-label="Siguiente"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            ) : (
                                <span />
                            )}
                            <button type="button" onClick={closePopup} className="hover:text-white">
                                Cerrar ventana
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
