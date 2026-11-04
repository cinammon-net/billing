import { Link, usePage } from '@inertiajs/react';
import MaintenanceBanner from '@/Components/MaintenanceBanner';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { 
    Box, 
    Gamepad2, 
    Crosshair, 
    Bot, 
    Database, 
    Layers, 
    ArrowUpRight, 
    Shield, 
    Zap, 
    Sparkles, 
    LogIn,
    UserPlus,
    Activity
} from 'lucide-react';

const CATEGORIES = [
    { key: 'minecraft', label: 'Minecraft', icon: Box },
    { key: 'survival', label: 'Supervivencia', icon: Gamepad2 },
    { key: 'shooters', label: 'Shooters', icon: Crosshair },
    { key: 'bots', label: 'Bots & Apps', icon: Bot },
    { key: 'databases', label: 'Bases de Datos', icon: Database },
];

export default function PublicLayout({ children }) {
    const { auth, panelUrl } = usePage().props;

    return (
        <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[#04060d] font-sans text-slate-100 antialiased selection:bg-pink-500 selection:text-white">
            {/* Fondo ambiental Cyberpunk */}
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-[140px]" />
                <div className="absolute top-1/2 -right-40 h-[450px] w-[450px] rounded-full bg-pink-500/10 blur-[150px]" />
                <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-purple-500/10 blur-[140px]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle,#ffffff_1px,transparent_1px)] bg-[length:24px_24px] opacity-[0.06]" />
            </div>

            {/* NAVBAR CYBER */}
            <header className="sticky top-0 z-50 border-b border-pink-500/25 bg-[#060914]/80 px-4 sm:px-8 py-3.5 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
                    {/* Izquierda: Logo y Categorías */}
                    <div className="flex items-center gap-8">
                        <Link 
                            href={route('store')} 
                            title="Cinammon Store"
                            className="group flex items-center gap-2.5 transition"
                        >
                            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-pink-500/40 bg-pink-500/10 shadow-[0_0_12px_rgba(255,0,128,0.3)] transition group-hover:border-cyan-400 group-hover:shadow-[0_0_15px_rgba(0,247,255,0.4)]">
                                <ApplicationLogo className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-mono text-sm font-black tracking-widest text-white group-hover:text-pink-400 transition">
                                    CINAMMON<span className="text-[#00f7ff]">.STORE</span>
                                </span>
                                <span className="font-mono text-[9px] uppercase tracking-wider text-pink-400/80">
                                    // Cloud Infrastructure
                                </span>
                            </div>
                        </Link>

                        {/* Menú de categorías */}
                        <nav className="hidden items-center gap-1.5 lg:flex font-mono text-xs">
                            {CATEGORIES.map((c) => {
                                const Icon = c.icon;
                                const isActive = route().current('store.category', c.key);
                                return (
                                    <Link
                                        key={c.key}
                                        href={route('store.category', c.key)}
                                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
                                            isActive
                                                ? 'border border-[#00f7ff]/50 bg-[#00f7ff]/10 text-[#00f7ff] shadow-[0_0_12px_rgba(0,247,255,0.25)] font-bold'
                                                : 'text-slate-400 hover:border hover:border-pink-500/30 hover:bg-pink-500/10 hover:text-pink-300'
                                        }`}
                                    >
                                        <Icon size={13} className={isActive ? 'text-[#00f7ff]' : 'text-slate-500'} />
                                        <span>{c.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Derecha: Botones de Auth y Panel */}
                    <nav className="flex items-center gap-3 font-mono text-xs">
                        <a
                            href={panelUrl}
                            className="hidden items-center gap-1 rounded-lg border border-slate-700 bg-neutral-900/60 px-3 py-1.5 text-slate-300 transition hover:border-[#00f7ff]/50 hover:text-[#00f7ff] sm:flex"
                        >
                            <span>Web / Panel</span>
                            <ArrowUpRight size={13} />
                        </a>

                        {auth?.user ? (
                            <Link
                                href={route('dashboard')}
                                className="flex items-center gap-2 rounded-lg border border-[#00f7ff]/50 bg-[#00f7ff]/10 px-4 py-1.5 font-bold text-[#00f7ff] shadow-[0_0_15px_rgba(0,247,255,0.25)] transition hover:bg-[#00f7ff] hover:text-black"
                            >
                                <Layers size={14} />
                                <span>Mis Servicios</span>
                            </Link>
                        ) : (
                            <>
                                <a
                                    href={`${panelUrl}/billing/redirect`}
                                    className="flex items-center gap-1.5 rounded-lg border border-pink-500/40 bg-gradient-to-r from-pink-500 to-fuchsia-600 px-4 py-1.5 font-bold text-white shadow-[0_0_15px_rgba(255,0,128,0.3)] transition hover:brightness-110 active:scale-95"
                                >
                                    <Zap size={13} />
                                    <span>Acceso SSO / Iniciar</span>
                                </a>
                                <Link
                                    href={route('register')}
                                    className="hidden items-center gap-1 rounded-lg border border-neutral-700 px-3 py-1.5 text-slate-300 transition hover:border-pink-500 hover:text-white md:flex"
                                >
                                    <UserPlus size={13} />
                                    <span>Registro</span>
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            </header>

            <MaintenanceBanner />

            {/* Contenido dinámico */}
            <main className="relative z-10 flex-1">{children}</main>

            {/* FOOTER CYBER */}
            <footer className="relative z-10 border-t border-pink-500/20 bg-[#060a16]/90 py-10 backdrop-blur-md">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Mini badges de garantía */}
                    <div className="grid grid-cols-2 gap-4 pb-8 border-b border-neutral-800/80 sm:grid-cols-4 font-mono text-xs">
                        <div className="flex items-center gap-2.5 text-slate-300">
                            <Zap size={18} className="text-[#00f7ff] shrink-0" />
                            <span>Despliegue &lt; 60 Segundos</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-slate-300">
                            <Shield size={18} className="text-pink-400 shrink-0" />
                            <span>Anti-DDoS 3.2 Tbps Ready</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-slate-300">
                            <Activity size={18} className="text-emerald-400 shrink-0" />
                            <span>Wings V2 Daemon Engine</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-slate-300">
                            <Sparkles size={18} className="text-purple-400 shrink-0" />
                            <span>AMD Ryzen 9 & DDR5 NVMe</span>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col items-center justify-between gap-4 font-mono text-xs text-slate-400 sm:flex-row">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-white">CINAMMON.NET</span>
                            <span>// Cloud Hosting & Orchestration Infrastructure</span>
                        </div>
                        <div className="flex items-center gap-5 text-slate-400">
                            <a href={panelUrl} className="hover:text-pink-300 transition">Web Principal</a>
                            <Link href={route('store')} className="hover:text-pink-300 transition">Catálogo</Link>
                            <a href={`${panelUrl}/tickets`} className="hover:text-pink-300 transition">Soporte 24/7</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
