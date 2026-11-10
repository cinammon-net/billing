import { Link, usePage } from '@inertiajs/react';
import SeasonIcon from '@/Components/SeasonIcon';

const fmtEnd = (d) => (d ? new Date(`${d}T23:59:59`).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' }) : null);

/** Franja de oferta del festivo activo (según el país del visitante). */
export default function PromoStrip() {
    const { season } = usePage().props;
    if (!season?.discount || !season?.holiday) return null;
    const end = fmtEnd(season.holiday.ends);

    return (
        <div className="relative z-20 border-b border-fuchsia-500/30 bg-gradient-to-r from-pink-600/25 via-fuchsia-600/20 to-purple-600/25 px-4 py-2 text-center font-mono text-xs text-pink-100">
            <SeasonIcon k={season.holiday.key} className="mr-1.5 h-3.5 w-3.5" />
            <strong className="text-white">{season.holiday.name}:</strong> -{season.discount}% en todos los planes
            {end && <span className="text-pink-200/80"> hasta el {end}</span>}
            <span className="mx-2 text-pink-300/50">·</span>
            <Link href={route('coins.index')} className="font-bold text-yellow-300 underline-offset-2 hover:underline">
                o consigue un servidor gratis con monedas
            </Link>
        </div>
    );
}
