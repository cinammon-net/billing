import { usePage } from '@inertiajs/react';
import { CalendarClock, Wrench, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const SCOPE_LABELS = { panel: 'Panel', store: 'Tienda', servers: 'Servidores de juego' };
const DISMISS_KEY = 'maintenance-dismissed';

const fmtDate = (iso) =>
    new Date(iso).toLocaleString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

const fmtCountdown = (ms) => {
    const total = Math.max(0, Math.floor(ms / 60000));
    const d = Math.floor(total / 1440);
    const h = Math.floor((total % 1440) / 60);
    const m = total % 60;
    if (d > 0) return `${d} d ${h} h`;
    if (h > 0) return `${h} h ${m} min`;
    return `${m} min`;
};

/** Aviso de mantenimiento anunciado en el panel: ámbar si está programado, rojo si está en curso. */
export default function MaintenanceBanner() {
    const { maintenance } = usePage().props;
    const [now, setNow] = useState(() => Date.now());
    const [dismissed, setDismissed] = useState(() => {
        try {
            return Number(localStorage.getItem(DISMISS_KEY)) || null;
        } catch {
            return null;
        }
    });

    useEffect(() => {
        const t = setInterval(() => setNow(Date.now()), 30000);
        return () => clearInterval(t);
    }, []);

    if (!maintenance) return null;
    const start = new Date(maintenance.starts_at).getTime();
    const end = maintenance.ends_at ? new Date(maintenance.ends_at).getTime() : null;
    if (end !== null && end <= now) return null;
    const active = start <= now;
    if (!active && dismissed === maintenance.id) return null;

    const scope = (maintenance.scope || []).map((s) => SCOPE_LABELS[s] ?? s).join(' · ');
    const storeBlocked = active && maintenance.block_access && (maintenance.scope || []).includes('store');

    const dismiss = () => {
        setDismissed(maintenance.id);
        try {
            localStorage.setItem(DISMISS_KEY, String(maintenance.id));
        } catch {
            /* sin almacenamiento */
        }
    };

    return (
        <div
            role="status"
            className={`relative z-40 flex items-start justify-between gap-3 border-b px-4 py-2.5 font-mono text-xs sm:px-6 ${
                active ? 'border-red-500/50 bg-red-950/90 text-red-100' : 'border-amber-500/40 bg-amber-950/85 text-amber-100'
            }`}
        >
            <div className="mx-auto flex w-full max-w-7xl min-w-0 items-start gap-2.5">
                {active ? <Wrench size={16} className="mt-0.5 shrink-0 animate-pulse text-red-300" /> : <CalendarClock size={16} className="mt-0.5 shrink-0 text-amber-300" />}
                <div className="min-w-0 space-y-0.5">
                    <p>
                        <strong>{active ? 'En mantenimiento' : 'Mantenimiento programado'}:</strong> {maintenance.title}
                        <span className="opacity-80">
                            {' — '}
                            {active
                                ? end
                                    ? `hasta ${fmtDate(maintenance.ends_at)} (quedan ${fmtCountdown(end - now)})`
                                    : 'sin hora de fin prevista'
                                : `empieza ${fmtDate(maintenance.starts_at)} (en ${fmtCountdown(start - now)})`}
                        </span>
                    </p>
                    <p className="font-sans text-[11px] opacity-80">
                        {scope && <span className="mr-2 font-semibold">Afecta a: {scope}.</span>}
                        {storeBlocked && <span className="mr-2 font-semibold text-red-200">No se aceptan pedidos nuevos hasta que termine.</span>}
                        {maintenance.message}
                    </p>
                </div>
            </div>
            {!active && (
                <button onClick={dismiss} className="shrink-0 opacity-70 hover:opacity-100" aria-label="Ocultar aviso">
                    <X size={16} />
                </button>
            )}
        </div>
    );
}
