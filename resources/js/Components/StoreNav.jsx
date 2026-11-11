import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link, usePage } from '@inertiajs/react';
import {
    AppWindow,
    ArrowUpRight,
    Bot,
    Box,
    Car,
    ChevronDown,
    Crosshair,
    Crown,
    Database,
    Drama,
    Gamepad2,
    Gift,
    Globe,
    Hammer,
    Headphones,
    Joystick,
    Layers,
    LayoutGrid,
    LifeBuoy,
    LogIn,
    Menu,
    UserPlus,
    X, Coins,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// Sufijo de la marca según el subdominio: CINAMMON.STORE en la tienda, CINAMMON.BILLING en billing.
const brandSuffix = (() => {
    const sub = typeof window !== 'undefined' ? window.location.hostname.split('.')[0] : '';
    return sub === 'billing' ? 'BILLING' : 'STORE';
})();

const GAMES = [
    { key: 'minecraft', label: 'Minecraft', desc: 'Paper, Fabric, Forge, modpacks', icon: Box, tint: 'text-emerald-400' },
    { key: 'survival', label: 'Supervivencia', desc: 'Rust, ARK, Palworld, Valheim', icon: Gamepad2, tint: 'text-pink-400' },
    { key: 'shooters', label: 'Shooters', desc: 'CS2, Squad, Insurgency, L4D2', icon: Crosshair, tint: 'text-red-400' },
    { key: 'sandbox', label: 'Sandbox', desc: 'Factorio, Satisfactory, Terraria', icon: Hammer, tint: 'text-amber-400' },
    { key: 'simulation', label: 'Simuladores', desc: 'ETS2, ATS, Assetto Corsa', icon: Car, tint: 'text-purple-400' },
    { key: 'roleplay', label: 'Roleplay y GTA', desc: 'FiveM, RedM, alt:V, MTA', icon: Drama, tint: 'text-orange-400' },
    { key: 'arcade', label: 'Clásicos', desc: 'Among Us, Teeworlds, OpenRA', icon: Joystick, tint: 'text-violet-400' },
];

const SERVICES = [
    { key: 'bots', label: 'Bots y apps', icon: Bot },
    { key: 'databases', label: 'Bases de datos', icon: Database },
    { key: 'voice', label: 'Voz', icon: Headphones },
    { key: 'web', label: 'Hosting web', icon: Globe },
    { key: 'software', label: 'Aplicaciones', icon: AppWindow },
];

const DISCORD_URL = 'https://discord.gg/U5EaDJerhZ';

const isCategory = (key) => route().current('store.category', key);

function VipPill({ className = '' }) {
    const active = isCategory('ranks');
    return (
        <Link
            href={route('store.category', 'ranks')}
            className={`group relative inline-flex items-center gap-1.5 overflow-hidden rounded-full border px-3.5 py-1.5 font-bold whitespace-nowrap transition ${
                active
                    ? 'border-yellow-300 bg-yellow-400/25 text-yellow-100'
                    : 'border-yellow-500/60 bg-gradient-to-r from-yellow-500/15 via-amber-400/10 to-yellow-500/15 text-yellow-300 hover:border-yellow-300 hover:text-yellow-100'
            } shadow-[0_0_14px_rgba(250,204,21,0.25)] ${className}`}
        >
            {/* destello que recorre la píldora */}
            <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent transition-all duration-700 group-hover:left-[120%]"
            />
            <Crown size={13} className="text-yellow-300" />
            <span>Rangos VIP</span>
        </Link>
    );
}

function NavLink({ href, active, children }) {
    return (
        <Link
            href={href}
            className={`relative flex items-center gap-1.5 rounded-lg px-3 py-2 whitespace-nowrap transition ${active ? 'text-white' : 'text-slate-400 hover:text-white'}`}
        >
            {children}
            <span
                aria-hidden="true"
                className={`absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-gradient-to-r from-pink-500 to-neon shadow-[0_0_8px_oklch(var(--tw-c-neon))] transition-opacity ${
                    active ? 'opacity-100' : 'opacity-0'
                }`}
            />
        </Link>
    );
}

export default function StoreNav() {
    const { auth, panelUrl, billingUrl, adventSummary } = usePage().props;
    const [gamesOpen, setGamesOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const menuRef = useRef(null);

    const isFree = route().current('store.free') || isCategory('free');
    const gamesActive = GAMES.some((g) => isCategory(g.key)) || SERVICES.some((s) => isCategory(s.key));
    const closeAll = () => {
        setGamesOpen(false);
        setMobileOpen(false);
    };

    useEffect(() => {
        const onKey = (e) => e.key === 'Escape' && closeAll();
        const onClick = (e) => menuRef.current && !menuRef.current.contains(e.target) && setGamesOpen(false);
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        document.addEventListener('keydown', onKey);
        document.addEventListener('mousedown', onClick);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            document.removeEventListener('keydown', onKey);
            document.removeEventListener('mousedown', onClick);
            window.removeEventListener('scroll', onScroll);
        };
    }, []);

    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileOpen]);

    const loginHref = `${panelUrl}/billing/redirect`;
    const registerHref = billingUrl ? `${billingUrl}/register` : route('register');
    const dashboardHref = billingUrl ? `${billingUrl}/dashboard` : route('dashboard');

    return (
        <header
            className={`sticky top-0 z-50 border-b transition-[background-color,box-shadow,border-color] duration-300 ${
                scrolled
                    ? 'border-white/10 bg-[#05070f]/95 shadow-[0_10px_30px_rgba(0,0,0,0.45)] backdrop-blur-xl'
                    : 'border-white/5 bg-[#05070f]/70 backdrop-blur-md'
            }`}
        >
            {/* línea de neón superior */}
            <div aria-hidden="true" className="h-px bg-gradient-to-r from-transparent via-pink-500/70 to-transparent" />

            <div className="mx-auto grid h-16 max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <Link href={route('store')} title={`Cinammon ${brandSuffix.charAt(0) + brandSuffix.slice(1).toLowerCase()}`} className="group flex shrink-0 items-center gap-2.5">
                    <ApplicationLogo className="h-8 w-8 drop-shadow-[0_0_10px_rgba(255,77,166,0.45)] transition duration-300 group-hover:rotate-[30deg] group-hover:drop-shadow-[0_0_12px_oklch(var(--tw-c-neon)_/_0.6)]" />
                    <span className="flex flex-col leading-none">
                        <span className="font-mono text-sm font-black tracking-[0.2em] text-white">
                            CINAMMON<span className="text-neon">.{brandSuffix}</span>
                        </span>
                        <span className="mt-1 hidden font-mono text-[9px] tracking-[0.25em] text-slate-500 uppercase sm:block">Game &amp; cloud hosting</span>
                    </span>
                </Link>

                {/* Navegación de escritorio (centrada) */}
                <nav className="hidden items-center justify-center gap-1 font-mono text-xs lg:flex" aria-label="Tienda">
                    <NavLink href={route('store')} active={route().current('store')}>
                        <LayoutGrid size={14} /> Catálogo
                    </NavLink>

                    <div ref={menuRef} className="relative">
                        <button
                            type="button"
                            onClick={() => setGamesOpen((v) => !v)}
                            aria-expanded={gamesOpen}
                            aria-haspopup="true"
                            className={`relative flex items-center gap-1.5 rounded-lg px-3 py-2 whitespace-nowrap transition ${gamesActive || gamesOpen ? 'text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            <Gamepad2 size={14} /> Juegos y servicios
                            <ChevronDown size={13} className={`transition-transform ${gamesOpen ? 'rotate-180' : ''}`} />
                            <span
                                aria-hidden="true"
                                className={`absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-gradient-to-r from-pink-500 to-neon shadow-[0_0_8px_oklch(var(--tw-c-neon))] ${gamesActive ? 'opacity-100' : 'opacity-0'}`}
                            />
                        </button>

                        {gamesOpen && (
                            <div className="absolute top-full left-1/2 mt-3 w-[760px] max-w-[calc(100vw-2rem)] -translate-x-1/2 overflow-hidden rounded-2xl border border-white/10 bg-[#070a16] shadow-[0_24px_70px_rgba(0,0,0,0.75)] ring-1 ring-pink-500/10">
                                <div aria-hidden="true" className="h-px bg-gradient-to-r from-pink-500/60 via-neon/50 to-transparent" />
                                <div className="grid grid-cols-[1fr_220px]">
                                    <div className="p-3">
                                        <p className="px-3 pt-1 pb-2 text-[10px] font-bold tracking-[0.2em] text-pink-400 uppercase">Servidores de juego</p>
                                        <div className="grid grid-cols-2 gap-1">
                                            {GAMES.map((g) => {
                                                const Icon = g.icon;
                                                return (
                                                    <Link
                                                        key={g.key}
                                                        href={route('store.category', g.key)}
                                                        onClick={closeAll}
                                                        className={`group/item flex items-start gap-3 rounded-xl border p-3 transition ${
                                                            isCategory(g.key) ? 'border-white/10 bg-white/5' : 'border-transparent hover:border-white/10 hover:bg-white/[0.04]'
                                                        }`}
                                                    >
                                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/40 transition group-hover/item:scale-105">
                                                            <Icon size={17} className={g.tint} />
                                                        </span>
                                                        <span className="min-w-0">
                                                            <span className="block text-[13px] font-bold text-white">{g.label}</span>
                                                            <span className="mt-0.5 block font-sans text-[11px] leading-snug text-slate-400">{g.desc}</span>
                                                        </span>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div className="flex flex-col border-l border-white/5 bg-white/[0.02] p-3">
                                        <p className="px-3 pt-1 pb-2 text-[10px] font-bold tracking-[0.2em] text-fuchsia-400 uppercase">Servicios</p>
                                        {SERVICES.map((s) => {
                                            const Icon = s.icon;
                                            return (
                                                <Link
                                                    key={s.key}
                                                    href={route('store.category', s.key)}
                                                    onClick={closeAll}
                                                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[12px] transition hover:bg-white/5 hover:text-white ${isCategory(s.key) ? 'bg-white/5 text-white' : 'text-slate-300'}`}
                                                >
                                                    <Icon size={14} className="text-fuchsia-400" /> {s.label}
                                                </Link>
                                            );
                                        })}
                                        <Link
                                            href={route('store')}
                                            onClick={closeAll}
                                            className="mt-auto flex items-center justify-center gap-1 rounded-lg border border-neon/30 bg-neon/5 px-3 py-2 text-[11px] font-bold text-neon transition hover:bg-neon hover:text-black"
                                        >
                                            Ver todo el catálogo <ArrowUpRight size={12} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-lg px-3 py-2 whitespace-nowrap text-slate-400 transition hover:text-white">
                        <LifeBuoy size={14} /> Soporte
                    </a>

                    <VipPill className="ml-2" />
                </nav>

                {/* Acciones */}
                <div className="col-start-3 flex items-center justify-end gap-2 font-mono text-xs">
                    {adventSummary && (
                        <Link
                            href={route('advent.index')}
                            className="hidden items-center gap-1.5 rounded-full border border-emerald-400/50 bg-emerald-500/15 px-3 py-1.5 whitespace-nowrap font-bold text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.25)] transition hover:bg-emerald-400 hover:text-black md:flex"
                            title={adventSummary.title || 'Calendario de Adviento'}
                        >
                            <Gift size={14} />
                            <span>Adviento</span>
                        </Link>
                    )}
                    <Link
                        href={route('store.free')}
                        className={`hidden items-center gap-1.5 rounded-lg px-3 py-2 whitespace-nowrap font-bold transition md:flex ${
                            isFree
                                ? 'border border-yellow-400/50 bg-yellow-400/20 text-yellow-200 shadow-[0_0_12px_rgba(250,204,21,0.3)]'
                                : 'text-yellow-300 hover:text-yellow-100'
                        }`}
                        title="Consigue un servidor gratis con monedas"
                    >
                        <Coins size={14} className="text-yellow-300" /> Gratis
                    </Link>
                    <a
                        href={panelUrl}
                        className="hidden items-center gap-1 rounded-lg px-3 py-2 whitespace-nowrap text-slate-400 transition hover:text-white md:flex lg:hidden xl:flex"
                        title="Ir al panel de Cinammon"
                    >
                        Panel <ArrowUpRight size={13} />
                    </a>
                    {auth?.user ? (
                        <a
                            href={dashboardHref}
                            className="flex items-center gap-2 rounded-xl border border-neon/50 bg-neon/10 px-4 py-2 font-bold text-neon shadow-[0_0_15px_oklch(var(--tw-c-neon)_/_0.2)] transition hover:bg-neon hover:text-black"
                        >
                            {auth?.avatar ? <img src={auth.avatar} alt="" referrerPolicy="no-referrer" className="h-[18px] w-[18px] rounded-full object-cover" /> : <Layers size={14} />}
                            <span className="hidden whitespace-nowrap sm:inline">Mis servicios</span>
                        </a>
                    ) : (
                        <>
                            <span aria-hidden="true" className="hidden h-5 w-px bg-white/10 md:block lg:hidden xl:block" />
                            <a href={registerHref} className="hidden items-center gap-1 rounded-lg px-3 py-2 whitespace-nowrap text-slate-300 transition hover:text-white md:flex">
                                <UserPlus size={13} /> Registro
                            </a>
                            <a
                                href={loginHref}
                                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-fuchsia-600 px-4 py-2 font-bold whitespace-nowrap text-white shadow-[0_0_15px_rgba(255,0,128,0.35)] transition hover:brightness-110 active:scale-95"
                            >
                                <LogIn size={13} /> <span>Entrar</span>
                            </a>
                        </>
                    )}
                    <button
                        type="button"
                        onClick={() => setMobileOpen(true)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-300 transition hover:border-pink-500/50 hover:text-white lg:hidden"
                        aria-label="Abrir menú"
                        aria-expanded={mobileOpen}
                    >
                        <Menu size={18} />
                    </button>
                </div>
            </div>

            {/* Menú móvil (en un portal: el backdrop-blur del header encerraría al panel fijo) */}
            {mobileOpen && createPortal(
                <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Menú de la tienda">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
                    <div className="absolute inset-y-0 right-0 flex w-[88%] max-w-sm flex-col border-l border-white/10 bg-[#070a16] font-mono text-sm">
                        <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
                            <span className="flex items-center gap-2 text-xs font-black tracking-[0.2em] text-white">
                                <ApplicationLogo className="h-6 w-6" />
                                CINAMMON<span className="-ml-2 text-neon">.STORE</span>
                            </span>
                            <button type="button" onClick={() => setMobileOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-white/5 hover:text-white" aria-label="Cerrar menú">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-5 pb-5">
                            <VipPill className="mt-5 w-full justify-center" />

                            <p className="mt-6 mb-2 text-[10px] font-bold tracking-[0.2em] text-pink-400 uppercase">Servidores de juego</p>
                            <div className="grid grid-cols-2 gap-2">
                                {GAMES.map((g) => {
                                    const Icon = g.icon;
                                    return (
                                        <Link
                                            key={g.key}
                                            href={route('store.category', g.key)}
                                            onClick={closeAll}
                                            className={`flex min-h-11 items-center gap-2 rounded-xl border px-2.5 py-2 text-[11.5px] ${
                                                isCategory(g.key) ? 'border-pink-500/40 bg-white/5 text-white' : 'border-white/5 bg-white/[0.02] text-slate-300'
                                            }`}
                                        >
                                            <Icon size={15} className={`shrink-0 ${g.tint}`} /> <span className="leading-tight">{g.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>

                            <p className="mt-6 mb-2 text-[10px] font-bold tracking-[0.2em] text-fuchsia-400 uppercase">Servicios</p>
                            <div className="grid grid-cols-2 gap-2">
                                {SERVICES.map((s) => {
                                    const Icon = s.icon;
                                    return (
                                        <Link
                                            key={s.key}
                                            href={route('store.category', s.key)}
                                            onClick={closeAll}
                                            className={`flex min-h-11 items-center gap-2 rounded-xl border px-2.5 py-2 text-[11.5px] ${
                                                isCategory(s.key) ? 'border-fuchsia-500/40 bg-white/5 text-white' : 'border-white/5 bg-white/[0.02] text-slate-300'
                                            }`}
                                        >
                                            <Icon size={15} className="shrink-0 text-fuchsia-400" /> <span className="leading-tight">{s.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>

                            <div className="mt-6 space-y-1 text-xs">
                                <Link href={route('store')} onClick={closeAll} className="flex items-center gap-2 rounded-lg px-2 py-2 text-slate-300 hover:bg-white/5">
                                    <LayoutGrid size={14} /> Todo el catálogo
                                </Link>
                                <Link href={route('store.free')} onClick={closeAll} className={`flex items-center gap-2 rounded-lg px-2 py-2 font-bold hover:bg-white/5 ${isFree ? 'bg-yellow-400/15 text-yellow-200' : 'text-yellow-300'}`}>
                                    <Coins size={14} /> Servidor gratis con monedas
                                </Link>
                                {adventSummary && (
                                    <Link href={route('advent.index')} onClick={closeAll} className="flex items-center gap-2 rounded-lg px-2 py-2 font-bold text-emerald-300 hover:bg-white/5">
                                        <Gift size={14} /> {adventSummary.title || 'Calendario de Adviento'}
                                    </Link>
                                )}
                                <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg px-2 py-2 text-slate-300 hover:bg-white/5">
                                    <LifeBuoy size={14} /> Soporte en Discord
                                </a>
                                <a href={panelUrl} className="flex items-center gap-2 rounded-lg px-2 py-2 text-slate-300 hover:bg-white/5">
                                    <ArrowUpRight size={14} /> Ir al panel
                                </a>
                            </div>
                        </div>

                        {/* Acciones fijas abajo */}
                        <div className="border-t border-white/10 p-5">
                            {auth?.user ? (
                                <a
                                    href={dashboardHref}
                                    onClick={closeAll}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-neon/50 bg-neon/10 px-4 py-3 text-xs font-bold text-neon"
                                >
                                    {auth?.avatar ? <img src={auth.avatar} alt="" referrerPolicy="no-referrer" className="h-[18px] w-[18px] rounded-full object-cover" /> : <Layers size={14} />} Mis servicios
                                </a>
                            ) : (
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <a href={registerHref} onClick={closeAll} className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 px-4 py-3 text-slate-200">
                                        <UserPlus size={13} /> Crear cuenta
                                    </a>
                                    <a href={loginHref} className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-fuchsia-600 px-4 py-3 font-bold text-white">
                                        <LogIn size={13} /> Entrar
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>,
                document.body,
            )}
        </header>
    );
}
