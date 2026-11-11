import { usePage } from '@inertiajs/react';
import { CalendarDays, Check, Clock, Copy, Megaphone, Sparkles, Tag, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const TYPE_STYLES = {
    offer: {
        label: 'Oferta',
        icon: Tag,
        bar: 'border-pink-500/60 from-pink-950/95 via-fuchsia-950/95 to-pink-950/95 text-pink-50',
        chip: 'bg-pink-500 text-white',
    },
    new: {
        label: 'Novedad',
        icon: Sparkles,
        bar: 'border-amber-500/60 from-amber-950/95 via-orange-950/95 to-amber-950/95 text-amber-50',
        chip: 'bg-amber-400 text-black',
    },
    event: {
        label: 'Evento',
        icon: CalendarDays,
        bar: 'border-violet-500/60 from-violet-950/95 via-purple-950/95 to-violet-950/95 text-violet-50',
        chip: 'bg-violet-500 text-white',
    },
    news: {
        label: 'Noticia',
        icon: Megaphone,
        bar: 'border-emerald-500/60 from-emerald-950/95 via-green-950/95 to-emerald-950/95 text-emerald-50',
        chip: 'bg-emerald-500 text-black',
    },
};

const DISMISS_KEY = 'announcements-dismissed';

function readIds() {
    try {
        const v = JSON.parse(localStorage.getItem(DISMISS_KEY) || '[]');
        return Array.isArray(v) ? v.filter((n) => typeof n === 'number') : [];
    } catch {
        return [];
    }
}

function writeIds(ids) {
    try {
        localStorage.setItem(DISMISS_KEY, JSON.stringify(ids.slice(-50)));
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
    if (d > 0) return `${d} d ${h} h`;
    if (h > 0) return `${h} h ${m} min`;
    return `${m} min`;
}

export default function AnnouncementBanner() {
    const { announcements, panelUrl } = usePage().props;
    const [now, setNow] = useState(() => Date.now());
    const [dismissed, setDismissed] = useState(() => readIds());
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const t = setInterval(() => setNow(Date.now()), 30000);
        return () => clearInterval(t);
    }, []);

    const items = (announcements || []).filter(
        (a) =>
            !dismissed.includes(a.id) &&
            new Date(a.starts_at).getTime() <= now &&
            (!a.ends_at || new Date(a.ends_at).getTime() > now),
    );

    useEffect(() => {
        if (items.length < 2 || paused) return;
        const t = setInterval(() => setIndex((i) => (i + 1) % items.length), 7000);
        return () => clearInterval(t);
    }, [items.length, paused]);

    if (items.length === 0) return null;
    const a = items[index % items.length];
    const style = TYPE_STYLES[a.type] || TYPE_STYLES.news;
    const Icon = style.icon;
    const left = endsIn(a.ends_at, now);

    const dismiss = () => {
        const next = [...dismissed, a.id];
        setDismissed(next);
        writeIds(next);
    };

    const copyCoupon = () => {
        if (!a.coupon_code) return;
        navigator.clipboard?.writeText(a.coupon_code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        });
    };

    const trackClick = () => {
        try {
            const base = (panelUrl || 'https://panel.cinammon.net').replace(/\/$/, '');
            fetch(`${base}/api/announcements/${a.id}/click`, { method: 'POST', keepalive: true }).catch(() => {});
        } catch {
            /* opcional */
        }
    };

    return (
        <div
            role="region"
            aria-label="Anuncios"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            className={`relative z-40 flex items-center justify-center gap-3 border-b bg-gradient-to-r px-10 py-2 font-mono text-xs ${style.bar}`}
        >
            <div className="flex min-w-0 flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-center">
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold tracking-wider uppercase ${style.chip}`}>
                    <Icon size={12} /> {style.label}
                </span>
                {a.highlight && <span className="text-sm font-extrabold tracking-wide text-yellow-300">{a.highlight}</span>}
                <strong className="tracking-wide">{a.title}</strong>
                {a.message && <span className="hidden font-sans text-[11px] opacity-80 md:inline">{a.message}</span>}
                {a.coupon_code && (
                    <button
                        type="button"
                        onClick={copyCoupon}
                        title="Copiar cupón"
                        className="inline-flex items-center gap-1 rounded border border-dashed border-white/50 bg-black/30 px-2 py-0.5 font-mono text-[11px] font-bold tracking-wider hover:bg-white/10"
                    >
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                        {copied ? '¡Copiado!' : a.coupon_code}
                    </button>
                )}
                {left && <span className="inline-flex items-center gap-1 font-sans text-[11px] font-semibold text-yellow-200"><Clock className="h-3 w-3" /> quedan {left}</span>}
                {a.cta_url && (
                    <a
                        href={a.cta_url}
                        onClick={trackClick}
                        target={a.cta_url.startsWith('http') ? '_blank' : undefined}
                        rel={a.cta_url.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="rounded-md border border-white/40 bg-white/10 px-2.5 py-0.5 font-bold whitespace-nowrap transition hover:bg-white hover:text-black"
                    >
                        {a.cta_label || 'Ver más'} →
                    </a>
                )}
            </div>
            {items.length > 1 && (
                <div className="absolute bottom-0.5 left-1/2 flex -translate-x-1/2 gap-1">
                    {items.map((it, i) => (
                        <button
                            key={it.id}
                            type="button"
                            aria-label={`Anuncio ${i + 1}`}
                            onClick={() => setIndex(i)}
                            className={`h-1 rounded-full transition-all ${i === index % items.length ? 'w-4 bg-white/80' : 'w-1.5 bg-white/30'}`}
                        />
                    ))}
                </div>
            )}
            <button onClick={dismiss} className="absolute top-1/2 right-3 -translate-y-1/2 opacity-60 hover:opacity-100" aria-label="Ocultar anuncio">
                <X size={16} />
            </button>
        </div>
    );
}
