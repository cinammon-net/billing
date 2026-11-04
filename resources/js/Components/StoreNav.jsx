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
    Globe,
    Hammer,
    Headphones,
    Joystick,
    Layers,
    LayoutGrid,
    LogIn,
    Menu,
    UserPlus,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const GAMES = [
    { key: 'minecraft', label: 'Minecraft', desc: 'Paper, Fabric, Forge, modpacks', icon: Box, tint: 'text-emerald-400' },
    { key: 'survival', label: 'Supervivencia', desc: 'Rust, ARK, Palworld, Valheim', icon: Gamepad2, tint: 'text-pink-400' },
    { key: 'shooters', label: 'Shooters', desc: 'CS2, Squad, Insurgency, L4D2', icon: Crosshair, tint: 'text-red-400' },
    { key: 'sandbox', label: 'Sandbox', desc: 'Factorio, Satisfactory, Terraria', icon: Hammer, tint: 'text-amber-400' },
    { key: 'simulation', label: 'Simuladores', desc: 'ETS2, ATS, Assetto Corsa', icon: Car, tint: 'text-sky-400' },
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

const isCategory = (key) => route().current('store.category', key);

function VipPill({ className = '' }) {
    const active = isCategory('ranks');
    return (
        <Link
            href={route('store.category', 'ranks')}
            className={`group relative inline-flex items-center gap-1.5 overflow-hidden rounded-full border px-3.5 py-1.5 font-bold transition ${
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
            className={`relative flex items-center gap-1.5 rounded-lg px-3 py-2 transition ${active ? 'text-white' : 'text-slate-400 hover:text-white'}`}
        >
            {children}
            <span
                aria-hidden="true"
                className={`absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-gradient-to-r from-pink-500 to-[#00f7ff] shadow-[0_0_8px_#00f7ff] transition-opacity ${
                    active ? 'opacity-100' : 'opacity-0'
                }`}
            />
        </Link>
    );
}

export default function StoreNav() {
    const { auth, panelUrl } = usePage().props;
    const [gamesOpen, setGamesOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const menuRef = useRef(null);

    const gamesActive = GAMES.some((g) => isCategory(g.key)) || SERVICES.some((s) => isCategory(s.key));

    useEffect(() => {
        const onKey = (e) => e.key === 'Escape' && (setGamesOpen(false), setMobileOpen(false));
        const onClick = (e) => menuRef.current && !menuRef.current.contains(e.target) && setGamesOpen(false);
        document.addEventListener('keydown', onKey);
        document.addEventListener('mousedown', onClick);
        return () => {
            document.removeEventListener('keydown', onKey);
            document.removeEventListener('mousedown', onClick);
        };
    }, []);

    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileOpen]);

    return (
        <header className="sticky top-0 z-50 border-b border-white/5 bg-[#05070f]/85 backdrop-blur-xl">
            {/* línea de neón superior */}
            <div aria-hidden="true" className="h-px bg-gradient-to-r from-transparent via-pink-500/70 to-transparent" />

            <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <Link href={route('store')} title="Cinammon Store" className="group flex shrink-0 items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-pink-500/40 bg-gradient-to-br from-pink-500/20 to-cyan-500/10 shadow-[0_0_14px_rgba(255,0,128,0.3)] transition group-hover:shadow-[0_0_18px_rgba(0,247,255,0.45)]">
                        <ApplicationLogo className="h-5 w-5" />
                    </span>
                    <span className="hidden font-mono text-sm font-black tracking-[0.2em] text-white sm:block">
                        CINAMMON<span className="text-[#00f7ff]">.STORE</span>
                    </span>
                </Link>

                {/* Navegación de escritorio */}
                <nav className="hidden flex-1 items-center gap-1 font-mono text-xs lg:flex" aria-label="Tienda">
                    <NavLink href={route('store')} active={route().current('store')}>
                        <LayoutGrid size={14} /> Catálogo
                    </NavLink>

                    <div ref={menuRef} className="relative">
                        <button
                            type="button"
                            onClick={() => setGamesOpen((v) => !v)}
                            aria-expanded={gamesOpen}
                            aria-haspopup="true"
                            className={`relative flex items-center gap-1.5 rounded-lg px-3 py-2 transition ${gamesActive || gamesOpen ? 'text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            <Gamepad2 size={14} /> Juegos y servicios
                            <ChevronDown size={13} className={`transition-transform ${gamesOpen ? 'rotate-180' : ''}`} />
                            <span
                                aria-hidden="true"
                                className={`absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-gradient-to-r from-pink-500 to-[#00f7ff] shadow-[0_0_8px_#00f7ff] ${gamesActive ? 'opacity-100' : 'opacity-0'}`}
                            />
                        </button>

                        {gamesOpen && (
                            <div className="absolute top-full left-0 mt-3 w-[720px] overflow-hidden rounded-2xl border border-white/10 bg-[#070a16]/95 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl">
                                <div className="grid grid-cols-[1fr_210px]">
                                    <div className="p-3">
                                        <p className="px-3 pt-1 pb-2 text-[10px] font-bold tracking-[0.2em] text-pink-400 uppercase">Servidores de juego</p>
                                        <div className="grid grid-cols-2 gap-1">
                                            {GAMES.map((g) => {
                                                const Icon = g.icon;
                                                return (
                                                    <Link
                                                        key={g.key}
                                                        href={route('store.category', g.key)}
                                                        onClick={() => setGamesOpen(false)}
                                                        className={`flex items-start gap-3 rounded-xl p-3 transition hover:bg-white/5 ${isCategory(g.key) ? 'bg-white/5' : ''}`}
                                                    >
                                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/40">
                                                            <Icon size={16} className={g.tint} />
                                                        </span>
                                                        <span className="min-w-0">
                                                            <span className="block text-[13px] font-bold text-white">{g.label}</span>
                                                            <span className="block truncate font-sans text-[11px] text-slate-400">{g.desc}</span>
                                                        </span>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div className="border-l border-white/5 bg-white/[0.02] p-3">
                                        <p className="px-3 pt-1 pb-2 text-[10px] font-bold tracking-[0.2em] text-cyan-400 uppercase">Servicios</p>
                                        {SERVICES.map((s) => {
                                            const Icon = s.icon;
                                            return (
                                                <Link
                                                    key={s.key}
                                                    href={route('store.category', s.key)}
                                                    onClick={() => setGamesOpen(false)}
                                                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[12px] transition hover:bg-white/5 hover:text-white ${isCategory(s.key) ? 'bg-white/5 text-white' : 'text-slate-300'}`}
                                                >
                                                    <Icon size={14} className="text-cyan-400" /> {s.label}
                                                </Link>
                                            );
                                        })}
                                        <Link
                                            href={route('store')}
                                            onClick={() => setGamesOpen(false)}
                                            className="mt-2 flex items-center justify-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-[11px] text-slate-300 hover:border-[#00f7ff]/50 hover:text-[#00f7ff]"
                                        >
                                            Ver todo el catálogo <ArrowUpRight size={12} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <VipPill className="ml-2" />
                </nav>

                {/* Acciones */}
                <div className="ml-auto flex items-center gap-2 font-mono text-xs">
                    <a
                        href={panelUrl}
                        className="hidden items-center gap-1 rounded-lg px-3 py-2 text-slate-400 transition hover:text-white md:flex"
                        title="Ir al panel de Cinammon"
                    >
                        Panel <ArrowUpRight size={13} />
                    </a>
                    {auth?.user ? (
                        <Link
                            href={route('dashboard')}
                            className="flex items-center gap-2 rounded-xl border border-[#00f7ff]/50 bg-[#00f7ff]/10 px-4 py-2 font-bold text-[#00f7ff] shadow-[0_0_15px_rgba(0,247,255,0.2)] transition hover:bg-[#00f7ff] hover:text-black"
                        >
                            <Layers size={14} />
                            <span className="hidden sm:inline">Mis servicios</span>
                        </Link>
                    ) : (
                        <>
                            <Link href={route('register')} className="hidden items-center gap-1 rounded-lg px-3 py-2 text-slate-300 transition hover:text-white md:flex">
                                <UserPlus size={13} /> Registro
                            </Link>
                            <a
                                href={`${panelUrl}/billing/redirect`}
                                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-fuchsia-600 px-4 py-2 font-bold text-white shadow-[0_0_15px_rgba(255,0,128,0.35)] transition hover:brightness-110 active:scale-95"
                            >
                                <LogIn size={13} /> <span>Entrar</span>
                            </a>
                        </>
                    )}
                    <button
                        type="button"
                        onClick={() => setMobileOpen(true)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-300 hover:text-white lg:hidden"
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
                    <div className="absolute inset-y-0 right-0 flex w-[86%] max-w-sm flex-col overflow-y-auto border-l border-white/10 bg-[#070a16] p-5 font-mono text-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black tracking-[0.2em] text-white">
                                CINAMMON<span className="text-[#00f7ff]">.STORE</span>
                            </span>
                            <button type="button" onClick={() => setMobileOpen(false)} className="text-slate-400 hover:text-white" aria-label="Cerrar menú">
                                <X size={20} />
                            </button>
                        </div>

                        <VipPill className="mt-5 justify-center" />

                        <p className="mt-6 mb-2 text-[10px] font-bold tracking-[0.2em] text-pink-400 uppercase">Servidores de juego</p>
                        {GAMES.map((g) => {
                            const Icon = g.icon;
                            return (
                                <Link
                                    key={g.key}
                                    href={route('store.category', g.key)}
                                    onClick={() => setMobileOpen(false)}
                                    className={`flex items-center gap-3 rounded-lg px-2 py-2.5 ${isCategory(g.key) ? 'bg-white/5 text-white' : 'text-slate-300'}`}
                                >
                                    <Icon size={16} className={g.tint} /> {g.label}
                                </Link>
                            );
                        })}

                        <p className="mt-5 mb-2 text-[10px] font-bold tracking-[0.2em] text-cyan-400 uppercase">Servicios</p>
                        {SERVICES.map((s) => {
                            const Icon = s.icon;
                            return (
                                <Link
                                    key={s.key}
                                    href={route('store.category', s.key)}
                                    onClick={() => setMobileOpen(false)}
                                    className={`flex items-center gap-3 rounded-lg px-2 py-2.5 ${isCategory(s.key) ? 'bg-white/5 text-white' : 'text-slate-300'}`}
                                >
                                    <Icon size={16} className="text-cyan-400" /> {s.label}
                                </Link>
                            );
                        })}

                        <div className="mt-auto space-y-2 border-t border-white/10 pt-5 text-xs">
                            <Link href={route('store')} onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-slate-300">
                                <LayoutGrid size={14} /> Todo el catálogo
                            </Link>
                            <a href={panelUrl} className="flex items-center gap-2 text-slate-300">
                                <ArrowUpRight size={14} /> Ir al panel
                            </a>
                            {!auth?.user && (
                                <Link href={route('register')} className="flex items-center gap-2 text-slate-300">
                                    <UserPlus size={14} /> Crear cuenta
                                </Link>
                            )}
                        </div>
                    </div>
                </div>,
                document.body,
            )}
        </header>
    );
}
