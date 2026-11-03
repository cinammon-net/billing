import { useState } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { 
    Layers, 
    ShoppingCart, 
    ArrowUpRight, 
    ShieldCheck, 
    User, 
    LogOut, 
    Menu, 
    X,
    Activity,
    Tags
} from 'lucide-react';

export default function Authenticated({ user, header, children }) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const { panelUrl, auth } = usePage().props;
    const isAdmin = Boolean(auth?.user?.is_admin);
    const isAdminPlans = route().current('admin.plans.index');

    const isDashboard = route().current('dashboard');
    const isStore = route().current('store') || route().current('store.category');

    return (
        <div className="relative min-h-screen bg-[#04060d] font-sans text-slate-100 antialiased selection:bg-pink-500 selection:text-white">
            {/* Fondo ambiental Cyberpunk */}
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-[130px]" />
                <div className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-pink-500/10 blur-[130px]" />
                <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-purple-500/10 blur-[140px]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle,#ffffff_1px,transparent_1px)] bg-[length:24px_24px] opacity-[0.06]" />
            </div>

            {/* Navbar Cyber */}
            <nav className="sticky top-0 z-50 border-b border-pink-500/25 bg-[#060914]/80 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* Izquierda: Logo y Enlaces */}
                        <div className="flex items-center gap-8">
                            <a 
                                href={panelUrl} 
                                title="Volver a Cinammon.net"
                                className="group flex items-center gap-2.5 transition"
                            >
                                <div className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-pink-500/40 bg-pink-500/10 shadow-[0_0_12px_rgba(255,0,128,0.3)] transition group-hover:border-cyan-400 group-hover:shadow-[0_0_15px_rgba(0,247,255,0.4)]">
                                    <ApplicationLogo className="h-5 w-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-mono text-sm font-black tracking-widest text-white group-hover:text-pink-400 transition">
                                        CINAMMON<span className="text-[#00f7ff]">.NET</span>
                                    </span>
                                    <span className="font-mono text-[9px] uppercase tracking-wider text-pink-400/80">
                                        // Billing & Cloud
                                    </span>
                                </div>
                            </a>

                            <div className="hidden items-center gap-2 sm:flex">
                                <Link
                                    href={route('dashboard')}
                                    className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 font-mono text-xs font-semibold tracking-wider transition ${
                                        isDashboard
                                            ? 'border border-[#00f7ff]/50 bg-[#00f7ff]/10 text-[#00f7ff] shadow-[0_0_12px_rgba(0,247,255,0.25)]'
                                            : 'text-slate-400 hover:border hover:border-pink-500/30 hover:bg-pink-500/10 hover:text-pink-300'
                                    }`}
                                >
                                    <Layers size={14} />
                                    <span>Mis Servicios</span>
                                </Link>

                                <Link
                                    href={route('store')}
                                    className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 font-mono text-xs font-semibold tracking-wider transition ${
                                        isStore
                                            ? 'border border-pink-500/50 bg-pink-500/10 text-pink-300 shadow-[0_0_12px_rgba(255,0,128,0.25)]'
                                            : 'text-slate-400 hover:border hover:border-pink-500/30 hover:bg-pink-500/10 hover:text-pink-300'
                                    }`}
                                >
                                    <ShoppingCart size={14} />
                                    <span>Tienda de Planes</span>
                                </Link>

                                {isAdmin && (
                                    <Link
                                        href={route('admin.plans.index')}
                                        className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 font-mono text-xs font-semibold tracking-wider transition ${
                                            isAdminPlans
                                                ? 'border border-yellow-400/50 bg-yellow-400/10 text-yellow-300'
                                                : 'text-slate-400 hover:border hover:border-yellow-400/30 hover:bg-yellow-400/10 hover:text-yellow-300'
                                        }`}
                                    >
                                        <Tags size={14} />
                                        <span>Precios</span>
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Derecha: Telemetría, Acceso al Panel y Menú de Usuario */}
                        <div className="hidden items-center gap-4 sm:flex">
                            {/* Status badge */}
                            <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/30 px-3 py-1 font-mono text-[11px] text-emerald-400">
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                                </span>
                                <span className="hidden md:inline">Core Conectado</span>
                            </div>

                            {/* Enlace directo al Panel */}
                            <a
                                href={panelUrl}
                                className="group flex items-center gap-1.5 rounded-lg border border-[#00f7ff]/40 bg-[#00f7ff]/10 px-3 py-1.5 font-mono text-xs font-bold text-[#00f7ff] transition hover:border-[#00f7ff] hover:bg-[#00f7ff] hover:text-[#04060d] hover:shadow-[0_0_16px_rgba(0,247,255,0.4)]"
                            >
                                <span>Panel de Servidores</span>
                                <ArrowUpRight size={13} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </a>

                            {/* Dropdown de Usuario */}
                            <div className="relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button
                                            type="button"
                                            className="flex items-center gap-2.5 rounded-lg border border-pink-500/30 bg-[#090d1c] px-3 py-1.5 font-mono text-xs font-semibold text-slate-200 transition hover:border-pink-500 hover:text-white"
                                        >
                                            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-tr from-pink-500 to-fuchsia-600 font-mono text-[11px] font-bold text-white shadow-sm">
                                                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
                                            </div>
                                            <span className="max-w-[120px] truncate">{user.name}</span>
                                        </button>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content contentClasses="py-1 bg-[#090e1f] border border-pink-500/40 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-md">
                                        <div className="border-b border-pink-500/20 px-4 py-2 font-mono text-[11px] text-slate-400">
                                            Conectado como <span className="text-pink-300 font-bold">{user.email}</span>
                                        </div>
                                        <Dropdown.Link href={route('profile.edit')} className="flex items-center gap-2 font-mono text-xs text-slate-200 hover:bg-pink-500/20 hover:text-pink-300">
                                            <User size={13} />
                                            <span>Mi Perfil & 2FA</span>
                                        </Dropdown.Link>
                                        <Dropdown.Link href={route('logout')} method="post" as="button" className="flex items-center gap-2 font-mono text-xs text-rose-400 hover:bg-rose-500/20 hover:text-rose-300">
                                            <LogOut size={13} />
                                            <span>Cerrar Sesión</span>
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        {/* Botón Móvil */}
                        <div className="flex sm:hidden">
                            <button
                                onClick={() => setShowingNavigationDropdown((prev) => !prev)}
                                className="rounded-lg border border-pink-500/40 p-2 text-pink-400 transition hover:bg-pink-500/10"
                            >
                                {showingNavigationDropdown ? <X size={20} /> : <Menu size={20} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Menú Móvil desplegable */}
                {showingNavigationDropdown && (
                    <div className="border-b border-pink-500/30 bg-[#070b17] px-4 pt-2 pb-4 space-y-2 sm:hidden font-mono text-xs">
                        <Link
                            href={route('dashboard')}
                            className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
                                isDashboard ? 'bg-[#00f7ff]/10 text-[#00f7ff] border border-[#00f7ff]/40' : 'text-slate-300'
                            }`}
                        >
                            <Layers size={14} />
                            <span>Mis Servicios</span>
                        </Link>
                        <Link
                            href={route('store')}
                            className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
                                isStore ? 'bg-pink-500/10 text-pink-300 border border-pink-500/40' : 'text-slate-300'
                            }`}
                        >
                            <ShoppingCart size={14} />
                            <span>Tienda de Planes</span>
                        </Link>
                        {isAdmin && (
                            <Link
                                href={route('admin.plans.index')}
                                className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
                                    isAdminPlans ? 'bg-yellow-400/10 text-yellow-300 border border-yellow-400/40' : 'text-slate-300'
                                }`}
                            >
                                <Tags size={14} />
                                <span>Precios</span>
                            </Link>
                        )}
                        <a
                            href={panelUrl}
                            className="flex items-center justify-between rounded-lg border border-[#00f7ff]/40 bg-[#00f7ff]/10 px-3 py-2 text-[#00f7ff]"
                        >
                            <span>Panel de Servidores</span>
                            <ArrowUpRight size={14} />
                        </a>
                        <div className="border-t border-neutral-800 pt-2">
                            <div className="px-3 py-1 text-slate-400 font-bold">{user.name}</div>
                            <Link href={route('profile.edit')} className="block px-3 py-1.5 text-slate-300 hover:text-white">
                                Mi Perfil & 2FA
                            </Link>
                            <Link href={route('logout')} method="post" as="button" className="block w-full text-left px-3 py-1.5 text-rose-400">
                                Cerrar Sesión
                            </Link>
                        </div>
                    </div>
                )}
            </nav>

            {/* Cabecera / Subtítulo */}
            {header && (
                <header className="relative z-10 border-b border-pink-500/15 bg-gradient-to-r from-[#060a15] via-[#090d1f] to-[#060a15] px-4 py-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">{header}</div>
                </header>
            )}

            {/* Contenido principal */}
            <main className="relative z-10">{children}</main>
        </div>
    );
}
