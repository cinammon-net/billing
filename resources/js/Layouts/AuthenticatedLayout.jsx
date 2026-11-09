import { useState } from 'react';
import MaintenanceBanner from '@/Components/MaintenanceBanner';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { ArrowUpRight, BadgePercent, ChevronDown, Coins, CreditCard, Layers, LogOut, Menu, Receipt, Server, ShieldCheck, ShoppingCart, Tags, User, X } from 'lucide-react';

const ADMIN_LINKS = [
    { route: 'admin.plans.index', label: 'Precios', icon: Tags },
    { route: 'admin.payments.index', label: 'Pagos', icon: Receipt },
    { route: 'admin.payment-methods.index', label: 'Métodos de pago', icon: CreditCard },
    { route: 'admin.promotions.index', label: 'Descuentos por festivo', icon: BadgePercent },
];

function TopLink({ href, active, icon: Icon, children }) {
    return (
        <Link
            href={href}
            className={`relative flex items-center gap-1.5 rounded-lg px-3 py-2 whitespace-nowrap transition ${active ? 'text-white' : 'text-slate-400 hover:text-white'}`}
        >
            <Icon size={14} /> {children}
            <span
                aria-hidden="true"
                className={`absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-gradient-to-r from-pink-500 to-neon shadow-[0_0_8px_oklch(var(--tw-c-neon))] transition-opacity ${active ? 'opacity-100' : 'opacity-0'}`}
            />
        </Link>
    );
}

function MobileLink({ href, active, icon: Icon, admin = false, children }) {
    const on = admin ? 'border-yellow-400/40 bg-yellow-400/10 text-yellow-300' : 'border-pink-500/40 bg-white/5 text-white';
    return (
        <Link href={href} className={`flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 ${active ? on : 'border-white/5 bg-white/[0.02] text-slate-300'}`}>
            <Icon size={14} className={admin ? 'text-yellow-400' : 'text-cyan-400'} /> <span className="leading-tight">{children}</span>
        </Link>
    );
}

export default function Authenticated({ user, header, children }) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const { panelUrl, auth, coins } = usePage().props;
    const isAdmin = Boolean(auth?.user?.is_admin);
    const isAdminArea = ADMIN_LINKS.some((l) => route().current(l.route));
    const initials = user?.name ? user.name.slice(0, 2).toUpperCase() : 'U';

    const isDashboard = route().current('dashboard');
    const isStore = route().current('store') || route().current('store.category');
    const isCoins = route().current('coins.index');

    return (
        <div className="relative min-h-screen bg-[#04060d] font-sans text-slate-100 antialiased selection:bg-pink-500 selection:text-white">
            {/* Fondo ambiental Cyberpunk */}
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-[130px]" />
                <div className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-pink-500/10 blur-[130px]" />
                <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-purple-500/10 blur-[140px]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle,#ffffff_1px,transparent_1px)] bg-[length:24px_24px] opacity-[0.06]" />
            </div>

            {/* Navbar */}
            <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#05070f]/90 shadow-[0_10px_30px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <div aria-hidden="true" className="h-px bg-gradient-to-r from-transparent via-pink-500/70 to-transparent" />
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center gap-6 font-mono text-xs">
                        {/* Logo */}
                        <a href={panelUrl} title="Volver a Cinammon.net" className="group flex shrink-0 items-center gap-2.5">
                            <ApplicationLogo className="h-8 w-8 drop-shadow-[0_0_10px_rgba(255,77,166,0.45)] transition duration-300 group-hover:rotate-[30deg] group-hover:drop-shadow-[0_0_12px_oklch(var(--tw-c-neon)_/_0.6)]" />
                            <span className="flex flex-col leading-none">
                                <span className="text-sm font-black tracking-[0.2em] whitespace-nowrap text-white">
                                    CINAMMON<span className="text-neon">.NET</span>
                                </span>
                                <span className="mt-1 text-[9px] tracking-[0.25em] whitespace-nowrap text-slate-500 uppercase">Billing &amp; cloud</span>
                            </span>
                        </a>

                        {/* Enlaces principales */}
                        <div className="hidden items-center gap-1 lg:flex">
                            <TopLink href={route('dashboard')} active={isDashboard} icon={Layers}>
                                Mis servicios
                            </TopLink>
                            <TopLink href={route('store')} active={isStore} icon={ShoppingCart}>
                                Tienda
                            </TopLink>
                            <TopLink href={route('coins.index')} active={isCoins} icon={Coins}>
                                Monedas{typeof coins === 'number' && <span className="ml-1 rounded bg-yellow-400/15 px-1.5 py-0.5 text-[10px] font-bold text-yellow-300">{coins}</span>}
                            </TopLink>

                            {isAdmin && (
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button
                                            type="button"
                                            className={`relative flex items-center gap-1.5 rounded-lg px-3 py-2 whitespace-nowrap transition ${
                                                isAdminArea ? 'text-yellow-300' : 'text-slate-400 hover:text-yellow-300'
                                            }`}
                                        >
                                            <ShieldCheck size={14} /> Admin
                                            <ChevronDown size={13} />
                                            <span
                                                aria-hidden="true"
                                                className={`absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-yellow-400 shadow-[0_0_8px_#facc15] transition-opacity ${isAdminArea ? 'opacity-100' : 'opacity-0'}`}
                                            />
                                        </button>
                                    </Dropdown.Trigger>
                                    <Dropdown.Content align="left" contentClasses="py-1 bg-[#070a16] border border-yellow-400/30 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
                                        <p className="px-4 pt-2 pb-1 text-[10px] font-bold tracking-[0.2em] text-yellow-400/80 uppercase">Administración</p>
                                        {ADMIN_LINKS.map((l) => (
                                            <Dropdown.Link
                                                key={l.route}
                                                href={route(l.route)}
                                                className={`flex items-center gap-2 font-mono text-xs ${route().current(l.route) ? 'text-yellow-300' : 'text-slate-200'} hover:bg-yellow-400/10 hover:text-yellow-300`}
                                            >
                                                <l.icon size={13} /> {l.label}
                                            </Dropdown.Link>
                                        ))}
                                    </Dropdown.Content>
                                </Dropdown>
                            )}
                        </div>

                        {/* Derecha */}
                        <div className="ml-auto hidden items-center gap-3 lg:flex">
                            <a
                                href={panelUrl}
                                className="group flex items-center gap-1.5 rounded-xl border border-neon/40 bg-neon/10 px-3.5 py-2 font-bold whitespace-nowrap text-neon transition hover:bg-neon hover:text-[#04060d] hover:shadow-[0_0_16px_oklch(var(--tw-c-neon)_/_0.4)]"
                            >
                                <Server size={14} /> Panel
                                <ArrowUpRight size={13} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </a>

                            <span aria-hidden="true" className="h-5 w-px bg-white/10" />

                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button
                                        type="button"
                                        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] py-1 pr-2.5 pl-1 font-semibold text-slate-200 transition hover:border-pink-500/60 hover:text-white"
                                    >
                                        <span className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-pink-500 to-fuchsia-600 text-[11px] font-bold text-white">
                                            {initials}
                                            <span title="Conectado" className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#05070f] bg-emerald-400" />
                                        </span>
                                        <span className="max-w-[120px] truncate">{user.name}</span>
                                        <ChevronDown size={13} className="text-slate-500" />
                                    </button>
                                </Dropdown.Trigger>
                                <Dropdown.Content contentClasses="py-1 bg-[#070a16] border border-pink-500/30 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
                                    <div className="border-b border-white/10 px-4 py-2 font-mono text-[11px] text-slate-400">
                                        Conectado como <span className="block truncate font-bold text-pink-300">{user.email}</span>
                                    </div>
                                    <Dropdown.Link href={route('profile.edit')} className="flex items-center gap-2 font-mono text-xs text-slate-200 hover:bg-pink-500/15 hover:text-pink-300">
                                        <User size={13} /> Mi perfil y 2FA
                                    </Dropdown.Link>
                                    <Dropdown.Link href={route('logout')} method="post" as="button" className="flex items-center gap-2 font-mono text-xs text-rose-400 hover:bg-rose-500/15 hover:text-rose-300">
                                        <LogOut size={13} /> Cerrar sesión
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>

                        {/* Botón móvil */}
                        <button
                            type="button"
                            onClick={() => setShowingNavigationDropdown((prev) => !prev)}
                            className="ml-auto flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-300 transition hover:border-pink-500/50 hover:text-white lg:hidden"
                            aria-label={showingNavigationDropdown ? 'Cerrar menú' : 'Abrir menú'}
                            aria-expanded={showingNavigationDropdown}
                        >
                            {showingNavigationDropdown ? <X size={18} /> : <Menu size={18} />}
                        </button>
                    </div>
                </div>

                {/* Menú móvil */}
                {showingNavigationDropdown && (
                    <div className="border-t border-white/5 bg-[#070a16] px-4 pt-3 pb-4 font-mono text-xs lg:hidden">
                        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-pink-500 to-fuchsia-600 text-[12px] font-bold text-white">{initials}</span>
                            <span className="min-w-0">
                                <span className="block truncate font-bold text-white">{user.name}</span>
                                <span className="block truncate text-[11px] text-slate-400">{user.email}</span>
                            </span>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2">
                            <MobileLink href={route('dashboard')} active={isDashboard} icon={Layers}>Mis servicios</MobileLink>
                            <MobileLink href={route('store')} active={isStore} icon={ShoppingCart}>Tienda</MobileLink>
                            <MobileLink href={route('coins.index')} active={isCoins} icon={Coins}>Monedas{typeof coins === 'number' ? ` · ${coins}` : ''}</MobileLink>
                        </div>

                        {isAdmin && (
                            <>
                                <p className="mt-4 mb-2 text-[10px] font-bold tracking-[0.2em] text-yellow-400/80 uppercase">Administración</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {ADMIN_LINKS.map((l) => (
                                        <MobileLink key={l.route} href={route(l.route)} active={route().current(l.route)} icon={l.icon} admin>
                                            {l.label}
                                        </MobileLink>
                                    ))}
                                </div>
                            </>
                        )}

                        <a href={panelUrl} className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-neon/40 bg-neon/10 px-3 py-3 font-bold text-neon">
                            <Server size={14} /> Panel de servidores <ArrowUpRight size={14} />
                        </a>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                            <Link href={route('profile.edit')} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-slate-300">
                                <User size={13} /> Mi perfil
                            </Link>
                            <Link href={route('logout')} method="post" as="button" className="flex items-center justify-center gap-2 rounded-xl border border-rose-500/30 px-3 py-2.5 text-rose-400">
                                <LogOut size={13} /> Cerrar sesión
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

            <MaintenanceBanner />

            {/* Contenido principal */}
            <main className="relative z-10">{children}</main>
        </div>
    );
}
